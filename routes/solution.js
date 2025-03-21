const { Router } = require("express");
const solution = Router();
const mongoose = require("mongoose");
const { DoubtDB } = require("../models/DoubtDB");
const { SolutionDB } = require("../models/SolutionDB");
const { userMiddleware } = require("../middleware/userMiddleware");
const { SolutionsUpVotesDB } = require("../models/SolutionsUpVotesDB");
const { formattedSolutions } = require("../utils");
solution.post("/add/:questionId", userMiddleware, async (req, res) => {
  try {
    const { questionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const { solution } = req.body;
    const doubt = await DoubtDB.find({ _id: questionId });
    if (doubt.length === 0) {
      return res.json({
        message: "invalid id! no doubt with this id exists",
      });
    }
    if (!solution) {
      return res.status(400).json({
        message: "solution is required",
      });
    }
    const newDoubt = new SolutionDB({
      doubtID: questionId,
      userID: req.userId,
      solution,
      status: "pending",
      addDate: new Date(),
    });
    await newDoubt.save();
    const AnswerCount = await SolutionDB.countDocuments({
      doubtID: questionId,
    });
    await DoubtDB.findByIdAndUpdate(
      questionId,
      { AnswerCount },
      { runValidators: true }
    );
    return res.json({
      message: "solution added",
    });
  } catch (e) {
    console.log(e);
    return res.json({
      message: "Internal server error",
    });
  }
});

solution.put("/modify/:solutionId", userMiddleware, async (req, res) => {
  try {
    const { solutionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(solutionId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
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
    return res.json({
      message: "solution modified",
    });
  } catch (e) {
    return res.json({
      message: "Internal Server Error",
    });
  }
});

solution.delete("/delete/:solutionId", userMiddleware, async (req, res) => {
  try {
    const { solutionId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(solutionId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    let Solution = await SolutionDB.findById(solutionId);
    if (req.userId != Solution.userID) {
      return res.status(400).json({
        message:
          "You are not allowed to delete this solution as you are not the author",
      });
    }
    const questionId = await SolutionDB.findById(solutionId);
    console.log(questionId);
    await SolutionDB.findByIdAndDelete(solutionId);
    const AnswerCount = await SolutionDB.countDocuments({
      doubtID: questionId.doubtID,
    });
    console.log(AnswerCount);
    await DoubtDB.findByIdAndUpdate(
      questionId.doubtID,
      { AnswerCount },
      { runValidators: true }
    );
    return res.json({
      message: "solution deleted",
    });
  } catch (e) {
    console.log(e);
    return res.json({
      message: "Internal server error",
    });
  }
});
solution.get("/show/:questionId", userMiddleware, async (req, res) => {
  const { questionId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }
  const doubt = await DoubtDB.find({ _id: questionId });
  if (doubt.length === 0) {
    return res.json({
      message: "invalid id! no doubt with this id exists",
    });
  }
  const allReventSol = await SolutionDB.find({ doubtID: questionId }).sort({
    upVotes: -1,
  });
  if (allReventSol === 0) {
    return res.json({
      message: "no solution exists yet",
    });
  }
  const formattedSols = await formattedSolutions(allReventSol, req);
  return res.json({
    result: formattedSols,
  });
});
solution.put("/updateUpVotes/:solutionID", userMiddleware, async (req, res) => {
  try {
    const { solutionID } = req.params;
    if (!mongoose.Types.ObjectId.isValid(solutionID)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const upVoted = await SolutionsUpVotesDB.findOne({
      solutionID,
      userID: req.userId,
    });
    if (!upVoted) {
      const newUpVote = new SolutionsUpVotesDB({
        solutionID,
        userID: req.userId,
        upvoteDate: new Date(),
      });
      await newUpVote.save();
    } else {
      console.log(upVoted._id);
      await SolutionsUpVotesDB.findByIdAndDelete(upVoted._id);
    }
    const upVotes = await SolutionsUpVotesDB.find({ solutionID });
    console.log(solutionID);
    console.log(upVotes);
    await SolutionDB.findByIdAndUpdate(solutionID, { upVotes: upVotes.length });
    return res.json({
      message: "upvote updated",
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      message: "Internal Server error",
    });
  }
});
module.exports = { solution };
