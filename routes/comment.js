require("dotenv").config();
const { Router } = require("express");
const comment = Router();
const mongoose = require("mongoose");
const { DoubtDB } = require("../models/DoubtDB");
const { userMiddleware } = require("../middleware/userMiddleware");
const { CommentDB } = require("../models/CommentDB");
const { UserDB } = require("../models/UserDB");
const { SolutionDB } = require("../models/SolutionDB");
const { algoliasearch } = require("algoliasearch");
const client = algoliasearch(
  process.env.ALGOLIA_APPLICATION_ID,
  process.env.ALGOLIA_API_KEY
);
comment.post("/add/:solutionID", userMiddleware, async (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({
        message: "comment cannot be empty",
      });
    }
    const { solutionID } = req.params;
    if (!mongoose.Types.ObjectId.isValid(solutionID)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const newComment = new CommentDB({
      solutionID,
      userID: req.userId,
      comment,
      addDate: new Date(),
    });
    await newComment.save();
    const commentCount = await CommentDB.countDocuments({ solutionID });
    await SolutionDB.findByIdAndUpdate(
      solutionID,
      { commentCount },
      { runValidators: true }
    );
    const questionId = await SolutionDB.findById(solutionID);
    const solutions = await SolutionDB.find({ doubtID: questionId.doubtID });
    // console.log(solutions);
    const totalCommentCount = solutions.reduce(
      (sum, solution) => sum + (solution.commentCount || 0),
      0
    );
    // console.log(totalCommentCount);
    const d = await DoubtDB.findByIdAndUpdate(
      questionId.doubtID,
      {
        commentCount: totalCommentCount,
      },
      { runValidators: true, new: true }
    );
    await client.addOrUpdateObject({
      indexName: "doubt_index",
      objectID: questionId.doubtID,
      body: d._doc,
    });
    return res.json({
      message: "comment created",
    });
  } catch (e) {
    console.log(e);
    return res.status(400).json({
      message: "Internal server error",
    });
  }
});

comment.put("/modify/:commentID", userMiddleware, async (req, res) => {
  try {
    const { commentID } = req.params;
    if (!mongoose.Types.ObjectId.isValid(commentID)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const { comment } = req.body;
    let com = await CommentDB.findById(commentID);
    if (!com) {
      return res.status(400).json({
        message: "not a valid comment id",
      });
    }
    console.log(com);
    if (req.userId != com.userID) {
      console.log(req.userId + " " + com.userID);
      return res.status(400).json({
        message:
          "You are not allowed to modify this comment as you are not the author",
      });
    }
    if (!comment) {
      return res.status(400).json({
        message: "comment cannot be empty",
      });
    }
    await CommentDB.findByIdAndUpdate(
      commentID,
      { comment, modifiedDate: new Date() },
      { runValidators: true }
    );
    return res.json({
      message: "comment modified",
    });
  } catch (e) {
    console.log(e);
    return res.json({
      message: "Internal server error",
    });
  }
});

comment.delete("/delete/:commentID", userMiddleware, async (req, res) => {
  try {
    const { commentID } = req.params;
    if (!mongoose.Types.ObjectId.isValid(commentID)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    let com = await CommentDB.findById(commentID);
    // console.log(commentID);
    if (!com) {
      return res.status(400).json({
        message: "not a valid comment id",
      });
    }
    if (req.userId != com.userID) {
      // console.log(req.userId + " " + com);
      return res.status(400).json({
        message:
          "You are not allowed to delete this comment as you are not the author",
      });
    }
    const solutionID = await CommentDB.findById(commentID);
    // console.log(solutionID.solutionID);
    await CommentDB.findByIdAndDelete(commentID);
    const commentCount = await CommentDB.countDocuments({
      solutionID: solutionID.solutionID,
    });
    // console.log(commentCount);
    await SolutionDB.findByIdAndUpdate(
      solutionID.solutionID,
      { commentCount },
      { runValidators: true }
    );
    const questionId = await SolutionDB.findById(solutionID.solutionID);
    const solutions = await SolutionDB.find({ doubtID: questionId.doubtID });
    // console.log(solutions);
    const totalCommentCount = solutions.reduce(
      (sum, solution) => sum + (solution.commentCount || 0),
      0
    );
    // console.log(totalCommentCount);
    const d = await DoubtDB.findByIdAndUpdate(
      questionId.doubtID,
      {
        commentCount: totalCommentCount,
      },
      { runValidators: true, new: true }
    );
    await client.addOrUpdateObject({
      indexName: "doubt_index",
      objectID: questionId.doubtID,
      body: d._doc,
    });
    return res.json({
      message: "comment Deleted",
    });
  } catch (e) {
    return res.json({
      message: "Internal server error",
    });
  }
});
comment.get("/show/:solutionID", userMiddleware, async (req, res) => {
  try {
    const { solutionID } = req.params;
    if (!mongoose.Types.ObjectId.isValid(solutionID)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const comments = await CommentDB.find({ solutionID });
    console.log(solutionID);
    if (!comments) {
      return res.json({
        message: "the comment for this solution is empty",
      });
    }
    return res.json({
      result: comments,
    });
  } catch (e) {
    return res.status(400).json({
      message: "Internal server error",
    });
  }
});
module.exports = { comment };
