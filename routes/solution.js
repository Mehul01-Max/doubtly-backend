const { Router } = require("express");
const solution = Router();
const mongoose = require("mongoose");
const { DoubtDB } = require("../models/DoubtDB");
const { SolutionDB } = require("../models/SolutionDB");
const { userMiddleware } = require("../middleware/userMiddleware");

solution.post("/add/:questionId", userMiddleware, async (req, res) => {
  try {
    const { questionId } = req.params;
    const { solution } = req.body;
    const doubt = await DoubtDB.find({ _id: questionId });
    if (doubt.length === 0) {
      res.json({
        message: "invalid id! no doubt with this id exists",
      });
    }
    if (!solution) {
      return res.status(400).json({
        message: "heading, description and type are required",
      });
    }
    const newDoubt = new SolutionDB({
      doubtID: questionId,
      userID: req.userId,
      solution,
      status: "pending",
      addDate: new Date(),
    });
    newDoubt.save();
    res.json({
      message: "solution added",
    });
  } catch (e) {
    console.log(e);
    res.json({
      message: "Internal server error",
    });
  }
});

solution.put("/modify/:solutionId", userMiddleware, async (req, res) => {
  try {
    const { solutionId } = req.params;
    const { solution } = req.body;
    let Solution = await SolutionDB.findById(solutionId);
    if (req.userId != Solution.userID) {
      return res.status(400).json({
        message:
          "You are not allowed to modify this solution as you are not the author",
      });
    }
    if (!solution) {
      return res.status(400).json({
        message: "solution are required",
      });
    }
    await SolutionDB.findByIdAndUpdate(
      solutionId,
      { solution, modifiedDate: new Date() },
      { runValidators: true }
    );
    res.json({
      message: "solution modified",
    });
  } catch (e) {
    res.json({
      message: "Internal Server Error",
    });
  }
});

solution.delete("/delete/:solutionId", userMiddleware, async (req, res) => {
  try {
    const { solutionId } = req.params;
    let Solution = await SolutionDB.findById(solutionId);
    if (req.userId != Solution.userID) {
      return res.status(400).json({
        message:
          "You are not allowed to delete this solution as you are not the author",
      });
    }
    await SolutionDB.findByIdAndDelete(solutionId);
    res.json({
      message: "solution deleted",
    });
  } catch (e) {
    res.json({
      message: "Internal server error",
    });
  }
});
solution.get("/show/:questionId", userMiddleware, async (req, res) => {
  const { questionId } = req.params;
  const doubt = await DoubtDB.find({ _id: questionId });
  if (doubt.length === 0) {
    res.json({
      message: "invalid id! no doubt with this id exists",
    });
  }
  const allReventSol = await SolutionDB.find({ doubtID: questionId });
  if (allReventSol === 0) {
    message: "no solution exists yet";
  }
  res.json({
    result: allReventSol,
  });
});
solution.put("/updateUpVotes/:solutionID", userMiddleware, async (req, res) => {
  try {
    const { solutionID } = req.params;
    const upVoted = await questionsUpVotesDB.findOne({
      solutionID,
      userID: req.userId,
    });
    if (!upVoted) {
      const newUpVote = new questionsUpVotesDB({
        solutionID,
        userID: req.userId,
      });
      newUpVote.save();
    } else {
      console.log(upVoted._id);
      await questionsUpVotesDB.findByIdAndDelete(upVoted._id);
    }
    const upVotes = await questionsUpVotesDB.find({ questionID });
    await DoubtDB.findByIdAndUpdate(questionID, { upVotes: upVotes.length });
    res.json({
      message: "upvote updated",
    });
  } catch (e) {
    console.log(e);
    res.status(400).json({
      message: "Internal Server error",
    });
  }
});
module.exports = { solution };
