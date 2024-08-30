const AuthService = require("../services/authService");
const { sendResponse } = require("../services/responseService");

const authService = new AuthService();

const googleSignUp = async (req, res) => {
  await authService.googleSign(req, res);
};

const googleSignupJWT = async (req, res) => {
  await authService.googleSignJWT(req, res);
};

const facebookSignup = async (req, res) => {
  await authService.facebookSign(req, res);
};

const linkedInSignup = async (req, res) => {
  await authService.linkedInSign(req, res);
};

const userSignup = async (req, res) => {
  await authService.userSignUp(req, res);
};

const login = async (req, res) => {
  await authService.login(req, res);
};

const githubSignup = async (req, res) => {
  await authService.githubSign(req, res);
}

module.exports = {
  googleSignUp,
  googleSignupJWT,
  facebookSignup,
  linkedInSignup,
  userSignup,
  login,
  githubSignup
};
