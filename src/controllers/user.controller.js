const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/user.model");
const EmailUpdate = require("../models/emailUpdate.model");
const ApiResponse = require("../utils/ApiResponse");
const { generateOTP, sendOTPEmail } = require("../utils/mailer");

const generateAccessAndAccessTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Something went wrong while generating referesh and access token"
        );
    }
};

/**
description - Register a new user
route - POST /api/v1/users/register
*/
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    if (
        [fullName, email, username, password].some(
            (field) => field?.trim() === ""
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

/**
description - Login an existing user
route - POST /api/v1/users/login
*/
const loginUser = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "username or email is required");
    }

    const user = await User.findOne({
        $or: [{ username }, { email: username }],
    });

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndAccessTokens(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged In Successfully"
            )
        );
});

/**
description - Logout user and clear cookies
route - POST /api/v1/users/logout
*/
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1, // this removes the field from document
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"));
});

/**
description - Change current user password
route - POST /api/v1/users/change-password
*/
const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

/**
description - Update user account details like full name and email
route - PATCH /api/v1/users/update-account
*/
const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Account details updated successfully")
        );
});

/**
description - Request email change, generate OTP and send via email
route - PUT /api/v1/users/change-email
*/
const changeEmail = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const userId = req.user._id;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    // Check if email is already in use by another user
    const existingUser = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: userId } 
    });

    if (existingUser) {
        throw new ApiError(409, "Email is already in use by another user");
    }

    // Check if the user already has this email
    const currentUser = await User.findById(userId);
    if (currentUser.email === email.toLowerCase()) {
        throw new ApiError(400, "This is already your current email");
    }

    // Generate OTP
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert EmailUpdate record (replace existing pending request)
    await EmailUpdate.findOneAndUpdate(
        { userId },
        { 
            userId, 
            email: email.toLowerCase(), 
            otp, 
            expiry 
        },
        { upsert: true, new: true }
    );

    // Send OTP email
    try {
        await sendOTPEmail(email, otp);
    } catch (error) {
        // Clean up the EmailUpdate record if email sending fails
        await EmailUpdate.findOneAndDelete({ userId });
        throw new ApiError(500, "Failed to send verification email. Please try again.");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { email }, "OTP sent to your email. Please verify within 10 minutes."));
});

/**
description - Verify OTP and update user email
route - PATCH /api/v1/users/verify-email
*/
const verifyEmail = asyncHandler(async (req, res) => {
    const { otp } = req.body;
    const userId = req.user._id;

    if (!otp) {
        throw new ApiError(400, "OTP is required");
    }

    // Find the pending email update request
    const emailUpdate = await EmailUpdate.findOne({ userId });

    if (!emailUpdate) {
        throw new ApiError(404, "No pending email change request found. Please request a new OTP.");
    }

    // Check if OTP is expired
    if (new Date() > emailUpdate.expiry) {
        await EmailUpdate.findOneAndDelete({ userId });
        throw new ApiError(400, "OTP has expired. Please request a new one.");
    }

    // Verify OTP
    if (emailUpdate.otp !== otp) {
        throw new ApiError(400, "Invalid OTP");
    }

    // Check if email is still available (could have been taken since OTP was sent)
    const existingUser = await User.findOne({ 
        email: emailUpdate.email, 
        _id: { $ne: userId } 
    });

    if (existingUser) {
        await EmailUpdate.findOneAndDelete({ userId });
        throw new ApiError(409, "Email is no longer available. Please try with a different email.");
    }

    // Update user's email
    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { email: emailUpdate.email },
        { new: true }
    ).select("-password -refreshToken");

    // Delete the EmailUpdate record
    await EmailUpdate.findOneAndDelete({ userId });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Email updated successfully"));
});

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    updateAccountDetails,
    changeCurrentPassword,
    changeEmail,
    verifyEmail,
};
