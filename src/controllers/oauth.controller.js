const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const User = require("../models/user.model");
const { generateAccessAndAccessTokens } = require("../controllers/user.controller");

/**
description - Get google oauth screen link
route - GET /api/v1/oauth/google
*/
const googleLogin = asyncHandler(async (req, res) => {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        client_id: process.env.GOOGLE_CLIENT_ID,
        access_type: "offline",
        response_type: "code",
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email",
        ].join(" "),
    };

    const qs = new URLSearchParams(options);
    res.redirect(`${rootUrl}?${qs.toString()}`);
});

/**
description - Callback uri for google oauth
route - GET /api/v1/oauth/callback/google
*/
const googleCallback = asyncHandler(async (req, res) => {
    const code = req.query.code;

    if (!code) {
        throw new ApiError(400, "Authorization code not provided");
    }

    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    const redirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();

    if (!clientId || !clientSecret || !redirectUri) {
        throw new ApiError(500, "Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI) are not properly set in .env");
    }

    const url = "https://oauth2.googleapis.com/token";
    const values = {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
    };

    let tokenRes;
    try {
        tokenRes = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams(values).toString(),
        });
    } catch (error) {
        console.error("Network Error: Failed to fetch Google OAuth tokens", error);
        throw new ApiError(500, "Network error: Failed to fetch Google OAuth tokens");
    }

    if (!tokenRes.ok) {
        const d = await tokenRes.json();
        console.error("Google OAuth API Error", d);
        if (d.error === 'invalid_client') {
            throw new ApiError(401, "Google OAuth Client ID or Secret is invalid. Please verify them in your .env file.");
        }
        throw new ApiError(400, "Google OAuth token exchange failed: " + (d.error_description || d.error));
    }
    const tokenData = await tokenRes.json();
    const { id_token, access_token } = tokenData;

    let userRes;
    try {
        userRes = await fetch(
            `https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=${access_token}`,
            {
                headers: {
                    Authorization: `Bearer ${id_token}`,
                },
            }
        );
    } catch (error) {
        console.error("Failed to fetch Google user profile", error);
        throw new ApiError(500, "Failed to fetch Google user profile");
    }
    if (!userRes.ok) {
        const d = await userRes.json();
        console.error("Failed to fetch Google user profile ok=false", d);
        throw new ApiError(500, "Failed to fetch Google user profile");
    }

    const googleUser = await userRes.json();

    if (!googleUser.email) {
        throw new ApiError(400, "Google email not provided");
    }

    let user = await User.findOne({ email: googleUser.email.toLowerCase() });

    if (!user) {
        // Create user with a strong random password, since they're using OAuth
        const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);

        let username = googleUser.email.split("@")[0].toLowerCase();
        // ensure unique username
        let userExists = await User.findOne({ username });
        let suffix = 1;
        while (userExists) {
            username = `${googleUser.email.split("@")[0].toLowerCase()}${suffix}`;
            userExists = await User.findOne({ username });
            suffix++;
        }

        user = await User.create({
            fullName: googleUser.name,
            email: googleUser.email.toLowerCase(),
            username,
            password: randomPassword,
            avatar: googleUser.picture,
        });
    }

    const { accessToken, refreshToken } = await generateAccessAndAccessTokens(user._id);

    const optionsCookie = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, optionsCookie)
        .cookie("refreshToken", refreshToken, optionsCookie)
        .redirect("/");
});

module.exports = {
    googleLogin,
    googleCallback,
};
