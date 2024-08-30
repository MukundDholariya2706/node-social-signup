const dotenv = require("dotenv");
const express = require("express");
const http = require("http");
const cors = require("cors");
const rootRouter = require("./routes/route");

dotenv.config();

// DB connection
require("./config/dbConnection");

const app = express();

const PORT = process.env.PORT || 3001;
const URL = process.env.URL || "localhost";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// routes
app.use(rootRouter);

// create server
const server = http.createServer(app);

// listen server
server.listen(PORT, () => {
  console.log(`server is running on http://${URL}:${PORT}`);
});
