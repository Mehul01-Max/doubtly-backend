const { Router } = require("express");
const mongoose = require("mongoose");
const { UserDB } = require("../models/UserDB");
const { userMiddleware } = require("../middleware/userMiddleware");

const userDetails = Router();

userDetails.get("/dashboard", userMiddleware, async (req, res) => {
  try {
    const user = await UserDB.findOne({ _id: req.userId });
    if (!user) {
      return res.status(400).json({
        message: "invalid userId",
      });
    }
    const userDetails = {
      name: user.name.split(" ")[0],
      points: user.points,
    };
    return res.json({
      result: userDetails,
    });
  } catch (e) {
    console.error("Dashboard error:", e);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

module.exports = { userDetails };
