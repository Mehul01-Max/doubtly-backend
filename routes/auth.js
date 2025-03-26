const bcrypt = require("bcryptjs");
const { Router } = require("express");
const jwt = require("jsonwebtoken");
const { userMiddleware } = require("../middleware/userMiddleware");
const { UserDB } = require("../models/UserDB");
const mongoose = require("mongoose");
const authRouter = Router();
const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};
const isStrongPassword = (password) => {
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};
authRouter.post("/check", userMiddleware, async (req, res) => {
  res.json({
    message: "token verified",
  });
});
authRouter.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, Email and Password are required",
      });
    }
    const isPresentEmail = await UserDB.findOne({ email });
    if (isPresentEmail) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "not a valid email",
      });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserDB({
      name,
      email,
      password: hashedPassword,
      JoinedDate: new Date(),
      points: 0,
    });
    await newUser.save();
    res.json({
      message: "user created",
    });
  } catch (e) {
    console.log(e);
    res.json({
      message: "Internal Server Error",
    });
  }
});
authRouter.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!password || !email) {
      return res.status(400).json({
        message: "email and password is required",
      });
    }
    const user = await UserDB.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "these email is not registered with us",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "invalid password",
      });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN,
      {
        expiresIn: "4d",
      }
    );
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ token, message: "Login Successful" });
  } catch (e) {
    console.log(e);
    return res.json({
      message: "Internal server error",
    });
  }
});
authRouter.post("/refreshToken", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    // console.log(refreshToken);
    if (!refreshToken) {
      return res.status(400).json({
        message: "invalid refresh token",
      });
    }
    const verify = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
    if (!verify) {
      return res.status(400).json({
        message: "invalid refresh token",
      });
    }
    const token = jwt.sign({ userId: verify.userId }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    // console.log(token);
    res.json({ token });
  } catch (e) {
    console.log(e);
    res.status(400).json({
      message: "error occurred check console",
    });
  }
});

module.exports = { authRouter };
