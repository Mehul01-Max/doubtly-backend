const { Router } = require("express");
const mongoose = require("mongoose");
const { UserDB } = require("../models/UserDB");
const { userMiddleware } = require("../middleware/userMiddleware");
const { DoubtDB } = require("../models/DoubtDB");
const { SolutionDB } = require("../models/SolutionDB");
const { SolutionsUpVotesDB } = require("../models/SolutionsUpVotesDB");
const userDetails = Router();

userDetails.get("/", userMiddleware, async (req, res) => {
  try {
    const user = await UserDB.findOne({ _id: req.userId });
    if (!user) {
      return res.status(400).json({
        message: "invalid userId",
      });
    }
    const doubtAsked = await DoubtDB.find({ userID: req.userId });
    const doubtAskedLastWeek = doubtAsked.filter(
      (c) => new Date() - c.addDate < 604800000
    );
    const doubtAnswered = await SolutionDB.find({
      userID: req.userId,
    });
    const correctlyAnswered = await SolutionDB.find({
      userID: req.userId,
      status: "correct",
    });
    const correctlyAnsweredLastweek = correctlyAnswered.filter((c) => {
      return new Date() - c.addDate < 604800000;
    });
    const upvotes = doubtAnswered.reduce((acc, curr) => {
      return (acc = acc + (curr.upVotes || 0));
    }, 0);
    const solutionIDs = doubtAnswered.map((d) => d._id);
    const upvoteList = await SolutionsUpVotesDB.find({
      solutionID: { $in: solutionIDs },
    });
    const upvoteLastWeek = upvoteList.filter((d) => {
      return new Date() - d.upvoteDate < 604800000;
    });
    const users = await UserDB.find({}).sort({ points: -1 });
    let rank = 0;
    for (let i = 0; i < users.length; i++) {
      if (users[i]._id == req.userId) {
        rank = i + 1;
      }
    }
    const userDetails = {
      firstName: user.name.split(" ")[0],
      email: user.email,
      doubtAsked: doubtAsked.length,
      doubtAskedLastWeek: doubtAskedLastWeek.length,
      joinedDate: user.JoinedDate,
      answersGiven: doubtAnswered.length,
      correctlyAnswered: correctlyAnswered.length,
      acceptance: correctlyAnswered.length / doubtAnswered.length,
      correctlyAnsweredLastweek: correctlyAnsweredLastweek.length,
      upvotes: upvotes,
      upvoteLastWeek: upvoteLastWeek.length,
      fullName: user.name,
      points: user.points,
      rank: rank,
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
userDetails.get("/leaderboard", userMiddleware, async (req, res) => {
  try {
    const user = await UserDB.find({}).sort({ points: -1 });
    const leaderboard = await Promise.all(
      user.map(async (user) => {
        const correctlyAnswered = await SolutionDB.countDocuments({
          userID: user._id,
          status: "correct",
        });
        return { ...user._doc, correctlyAnswered };
      })
    );
    res.json({
      result: leaderboard,
    });
  } catch (e) {
    console.log(e);
    res.json({
      message: "Internal server error",
    });
  }
});

module.exports = { userDetails };
// name, bio, email, joinedDate,  doubt asked, answersGiven, acceptance
