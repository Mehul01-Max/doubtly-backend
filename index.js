const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { authRouter } = require("./routes/auth");
const { doubt } = require("./routes/doubt");
const { solution } = require("./routes/solution");
const { comment } = require("./routes/comment");
const { userDetails } = require("./routes/userDetails");
const cookieParser = require("cookie-parser");
const app = express();
app.use(cookieParser());
dotenv.config();
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://doubtly-frontend-flame.vercel.app",
      "https://doubtly-frontend-flame.vercel.app/",
    ],
    credentials: true,
  })
);
app.get("/", (req, res) => {
  res.json({
    message: "hi",
  });
});
app.use("/api/auth", authRouter);
app.use("/api/doubt", doubt);
app.use("/api/solution", solution);
app.use("/api/comment", comment);
app.use("/api/userDetails", userDetails);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Mongo connection open");
  })
  .catch((e) => {
    console.log(e);
  });
app.listen(3000, () => {
  console.log("listening to port 3000");
});
