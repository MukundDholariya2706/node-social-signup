require("dotenv").config();
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const { sendResponse } = require("./responseService");
const Authentication = require("../models/authenticationSchema");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URL;

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

class AuthService {
  tokenGenerator = async (payload) => {
    try {
      const expiresIn = payload?.rememberMe
        ? process.env.JWT_REMEMBER_EXPIRE
        : process.env.JWT_EXPIRES_IN;

      const token = jwt.sign({ id: payload._id }, process.env.JWT_SECRET_KEY, {
        expiresIn,
      });

      return {
        token,
        user: payload,
      };
    } catch (error) {}
  };

  googleSign = async (req, res) => {
    try {
      oauth2Client.setCredentials({ access_token: req.body.access_token });
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const googleResponse = await oauth2.userinfo.get();

      let user_exist = await Authentication.findOne({
        email: googleResponse?.data?.email,
        is_deleted: false,
      }).lean();

      // Check user is exist or not if not exist create new one
      if (!user_exist) {
        user_exist = await Authentication.create({
          first_name: googleResponse?.data?.given_name,
          last_name: googleResponse?.data?.family_name,
          email: googleResponse?.data?.email,
          is_google_signup: true,
        });
        user_exist = user_exist.toObject({ getters: true });
      }

      // generate token
      const token = await this.tokenGenerator({ ...user_exist });

      return sendResponse(res, 200, true, "", {
        user: user_exist,
        ...token,
      });
    } catch (error) {
      return sendResponse(res, 500, false, error.message, {
        message: error.message,
      });
    }
  };

  googleSignJWT = async (req, res) => {
    try {
      const { credential } = req.body;
      if (!credential) {
        return sendResponse(
          res,
          404,
          false,
          "Google oAuth token not found.",
          undefined
        );
      }

      const decoded = jwt.decode(credential);

      let user_exist = await Authentication.findOne({
        email: decoded?.email,
        is_deleted: false,
      }).lean();

      // Check user is exist or not if not exist create new one
      if (!user_exist) {
        user_exist = await Authentication.create({
          first_name: decoded?.given_name,
          last_name: decoded?.family_name,
          email: decoded?.email,
          is_google_signup: true,
        });
        user_exist = user_exist.toObject({ getters: true });
      }

      // generate token
      const token = await this.tokenGenerator({ ...user_exist });

      return sendResponse(res, 200, true, "", {
        user: user_exist,
        ...token,
      });
    } catch (error) {
      return sendResponse(res, 500, false, error.message, {
        message: error.message,
      });
    }
  };

  facebookSign = async (req, res) => {
    try {

    } catch (error){
      return sendResponse(res, 500, false, error.message, {
        message: error.message,
      });
    }
  }
}

module.exports = AuthService;
