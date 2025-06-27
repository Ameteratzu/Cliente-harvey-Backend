const cors = require("cors");
const runCrons = require("./cron/index.js");
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const hpp = require("hpp");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { xss } = require("express-xss-sanitizer");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

runCrons();

const router = require("./routes/index.js");
const errorHandler = require("./middlewares/errorHandler.js");
const AppError = require("./utils/appError.js");

const app = express();
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

app.use(cookieParser());
app.use(helmet());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(xss());
app.use(hpp());

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/", router);

app.get("/", (req, res) => {
  return res.send("Welcome to express!");
});

app.use(errorHandler);

module.exports = app;
