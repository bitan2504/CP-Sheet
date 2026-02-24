const express = require("express");
const { googleLogin, googleCallback } = require("../controllers/oauth.controller");

const router = express.Router();

router.route("/google").get(googleLogin);
router.route("/callback/google").get(googleCallback);

module.exports = router;