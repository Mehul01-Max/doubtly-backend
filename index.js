const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { authRouter } = require("./routes/auth");
const { doubt } = require("./routes/doubt");
const { solution } = require("./routes/solution");
const { comment } = require("./routes/comment");
const app = express();
dotenv.config();
app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.json({
    message: "hi",
  });
});
app.use("/api/auth", authRouter);
app.use("/api/doubt", doubt);
app.use("/api/solution", solution);
app.use("/api/comment", comment);
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
