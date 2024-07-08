const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/social-signup';

mongoose.connect(DB_URL);

mongoose.connection.on("connected", async () => {
  console.log("Database connected!");
});

mongoose.connection.on("error", (err) => {
  console.log("Mongodb Connection failed! ", err);
  mongoose.disconnect();
});

module.exports = mongoose;
