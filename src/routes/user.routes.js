const { Router } = require("express");
const {
    registerUser,
    loginUser,
    logoutUser,
    changeCurrentPassword,
    updateAccountDetails,
    changeEmail,
    verifyEmail,
} = require("../controllers/user.controller");
const verifyJWT = require("../middlewares/auth.middleware");

const router = Router();


router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/change-email").put(verifyJWT, changeEmail);
router.route("/verify-email").patch(verifyJWT, verifyEmail);

module.exports = router;
