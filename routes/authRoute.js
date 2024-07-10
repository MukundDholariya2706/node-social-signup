const {
  googleSignUp,
  googleSignupJWT,
  facebookSignup,
  linkedInSignup,
  userSignup,
  login
} = require("../controller/authController");

const authRoute = require("express").Router();

authRoute.post("/google-signup", googleSignUp);
authRoute.post("/google-signup-jwt", googleSignupJWT);
authRoute.post("/facebook-signup", facebookSignup);
authRoute.post("/linkdin-signup", linkedInSignup);
authRoute.post("/signup", userSignup);
authRoute.post("/login", login);


module.exports = authRoute;
