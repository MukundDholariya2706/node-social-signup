const { googleSignUp, googleSignupJWT } = require("../controller/authController");

const authRoute = require("express").Router();

authRoute.post('/google-signup', googleSignUp);
authRoute.post('/google-signup-jwt', googleSignupJWT);

module.exports = authRoute;