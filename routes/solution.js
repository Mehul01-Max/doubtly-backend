const { Router } = require("express");
const solution = Router();
const mongoose = require("mongoose");
const { DoubtDB } = require("../models/DoubtDB");
const { SolutionDB } = require("../models/SolutionDB");
const { userMiddleware } = require("../middleware/userMiddleware");
const { SolutionsUpVotesDB } = require("../models/SolutionsUpVotesDB");
const { formattedSolutions, updateDoubtStatus } = require("../utils");
const { sendSolutionNotification } = require("../utils/emailService");
const { UserDB } = require("../models/UserDB");
const { questionsUpVotesDB } = require("../models/questionsUpVotesDB");
const { NotificationDB } = require("../models/NotificationDB");
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
    const question = await DoubtDB.findById(questionId);
    const user = await UserDB.findById(question.userID);
    await sendSolutionNotification(
      user.email,
      question.heading,
      `${process.env.WEBSITE_LINK}/dashboard/doubt/${questionId}`,
      true
    );
    const upvotedUserId = await questionsUpVotesDB.find({
      questionID: questionId,
    });
    const users = upvotedUserId.map((d) => {
      if (question.userID != d.userID) {
        return d.userID;
      }
    });
    const newNotification = new NotificationDB({
      userID: req.userId,
      message: `A new solution was added to your doubt: "${question.title}`,
      link: `${process.env.WEBSITE_LINK}/dashboard/doubt/${questionId}`,
    });
    await newNotification.save();
    const upvotedUser = await UserDB.find({ _id: { $in: users } });
    for (u of upvotedUser) {
      await sendSolutionNotification(
        u.email,
        question.heading,
        `${process.env.WEBSITE_LINK}/dashboard/doubt/${questionId}`,
        false
      );
    }
    await updateDoubtStatus(questionId);
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
    await updateDoubtStatus(questionId.doubtID);
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
solution.put("/updateStatus/:solutionID", userMiddleware, async (req, res) => {
  try {
    const { solutionID } = req.params;
    const { status } = req.body;
    if (!["pending", "wrong", "correct"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const solution = await SolutionDB.findById(solutionID);
    if (!solution) {
      return res.status(404).json({ error: "Solution not found" });
    }
    await SolutionDB.findByIdAndUpdate(solutionID, { status: status });
    await updateDoubtStatus(solution.doubtID);
    res.json({
      message: "status changed successfully",
    });
  } catch (e) {
    console.log(e);
    res.json({
      message: "Internal server error",
    });
  }
});
module.exports = { solution };
