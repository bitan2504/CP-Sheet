const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const viewAuth = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            res.locals.isAuthenticated = false;
            res.locals.user = null;
            return next();
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (user) {
            res.locals.isAuthenticated = true;
            res.locals.user = user;
        } else {
            res.locals.isAuthenticated = false;
            res.locals.user = null;
        }

    } catch (error) {
        // If token is invalid or expired
        res.locals.isAuthenticated = false;
        res.locals.user = null;
    }

    next();
};

module.exports = viewAuth;
