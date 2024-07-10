require("dotenv").config();
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const { sendResponse } = require("./responseService");
const bcrypt = require("bcryptjs");
const Authentication = require("../models/authenticationSchema");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URL;
const LINKDIN_CLIENT_ID = process.env.LINKDIN_CLIENT_ID;
const LINKDIN_CLIENT_ID_SECRET = process.env.LINKDIN_CLIENT_ID_SECRET;
const LINKDIN_REDIRECT_URL = process.env.LINKDIN_REDIRECT_URL;

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

  passwordEncryption = async (payload) => {
    try {
      return await bcrypt.hash(payload.password, 14);
    } catch (error) {
      console.log(`Error while password encryption: ${error}`);
    }
  };

  passwordVerifier = async (payload) => {
    try {
      return await bcrypt.compare(payload.password, payload.encrypted_password);
    } catch (error) {
      console.log(`Error while password verification: ${error}`);
    }
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
          {}
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
      return sendResponse(res, 500, false, error.message, {});
    }
  };

  facebookSign = async (req, res) => {
    try {
      const { email, first_name, last_name } = req.body;

      let user_exist = await Authentication.findOne({
        email: email,
        is_deleted: false,
      }).lean();

      // Check user is exist or not if not exist create new one
      if (!user_exist) {
        user_exist = await Authentication.create({
          first_name,
          last_name,
          email: email,
          is_facebook_signup: true,
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
      return sendResponse(res, 500, false, error.message, {});
    }
  };

  linkedInSign = async (req, res) => {
    try {
      const { code } = req.body;

      const response = await axios.post(
        "https://www.linkedin.com/oauth/v2/accessToken",
        `grant_type=authorization_code&code=${code}&client_id=${LINKDIN_CLIENT_ID}&client_secret=${LINKDIN_CLIENT_ID_SECRET}&redirect_uri=${LINKDIN_REDIRECT_URL}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      // Decode the token
      const decoded = jwt.decode(response?.data?.id_token);

      let user_exist = await Authentication.findOne({
        email: decoded?.email,
        is_deleted: false,
      }).lean();

      // Check user is exist or not if not exist create new one
      if (!user_exist) {
        user_exist = await Authentication.create({
          first_name,
          last_name,
          email: email,
          is_linkedIn_signup: true,
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
      return sendResponse(res, 500, false, error.message, {});
    }
  };

  userSignUp = async (req, res) => {
    try {
      let { first_name, last_name, password, email } = req.body;

      let user_exist = await Authentication.findOne({
        email: email?.toLowerCase(),
        is_deleted: false,
      }).lean();

      if (user_exist) {
        return sendResponse(
          res,
          400,
          false,
          "This email is already exist. Please choose another one.",
          {}
        );
      }

      if (password) {
        password = await this.passwordEncryption({ password });
      }

      user_exist = await Authentication.create({
        first_name,
        last_name,
        email: email?.toLowerCase(),
        password,
      });

      user_exist = user_exist.toObject({ getters: true });

      // generate token
      const token = await this.tokenGenerator({ ...user_exist });

      return sendResponse(res, 200, true, "User register successfully", {
        user: user_exist,
        ...token,
      });
    } catch (error) {
      return sendResponse(res, 500, false, error.message, {});
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;

      let user_exist = await Authentication.findOne({
        email,
        is_deleted: false,
      }).lean();

      if (!user_exist)
        return sendResponse(res, 404, false, "User not found", {});

      if (
        !(await this.passwordVerifier({
          password,
          encrypted_password: user_exist?.password,
        }))
      )
        return sendResponse(res, 400, false, "Incorrect password", {});

      // generate token
      const token = await this.tokenGenerator({ ...user_exist });

      return sendResponse(res, 200, true, "Login succssfully", {
        user: user_exist,
        ...token,
      });
    } catch (error) {
      return sendResponse(res, 500, false, error.message, {});
    }
  };
}

module.exports = AuthService;
