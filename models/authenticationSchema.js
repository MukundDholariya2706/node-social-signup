const mongoose = require("mongoose");

let authenticationSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
    },
    auth_token: {
      type: String,
    },
    is_google_signup: {
      type: Boolean,
      default: false,
    },
    is_facebook_signup: {
      type: Boolean,
      default: false,
    },
    is_linkedIn_signup: {
      type: Boolean,
      default: false,
    },
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Authentication = mongoose.model(
  "authentication",
  authenticationSchema,
  "authentication"
);
module.exports = Authentication;
