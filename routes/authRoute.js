const {
  googleSignUp,
  googleSignupJWT,
  facebookSignup,
  linkedInSignup,
} = require("../controller/authController");

const authRoute = require("express").Router();

authRoute.post("/google-signup", googleSignUp);
authRoute.post("/google-signup-jwt", googleSignupJWT);
authRoute.post("/facebook-signup", facebookSignup);
authRoute.post("/linkdin-signup", linkedInSignup);

module.exports = authRoute;
