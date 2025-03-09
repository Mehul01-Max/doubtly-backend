const { Router } = require("express");
const comment = Router();
const mongoose = require("mongoose");
const { DoubtDB } = require("../models/DoubtDB");
const { userMiddleware } = require("../middleware/userMiddleware");
const { CommentDB } = require("../models/CommentDB");
const { UserDB } = require("../models/UserDB");
const { SolutionDB } = require("../models/SolutionDB");

comment.post("/add/:solutionID", userMiddleware, (req, res) => {
  try {
    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({
        message: "comment cannot be empty",
      });
    }
    const { solutionID } = req.params;
    const newComment = new CommentDB({
      solutionID,
      userID: req.userId,
      comment,
      addDate: new Date(),
    });
    newComment.save();
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
    let com = await CommentDB.findById(commentID);
    console.log(commentID);
    if (!com) {
      return res.status(400).json({
        message: "not a valid comment id",
      });
    }
    if (req.userId != com.userID) {
      console.log(req.userId + " " + com);
      return res.status(400).json({
        message:
          "You are not allowed to delete this comment as you are not the author",
      });
    }
    await CommentDB.findByIdAndDelete(commentID);
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
