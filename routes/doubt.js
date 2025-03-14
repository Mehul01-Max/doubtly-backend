const { Router } = require("express");
const doubt = Router();
const mongoose = require("mongoose");
const { DoubtDB } = require("../models/DoubtDB");
const { userMiddleware } = require("../middleware/userMiddleware");
const { SolutionDB } = require("../models/SolutionDB");
const { UserDB } = require("../models/UserDB");
const {
  getTimeAgo,
  formattedDoubts,
  formattedDoubt,
} = require("../utils/index");
const { questionsUpVotesDB } = require("../models/questionsUpVotesDB");
doubt.post("/add", userMiddleware, async (req, res) => {
  try {
    const { heading, description, type } = req.body;
    if (!heading || !description || !type) {
      return res.status(400).json({
        message: "heading, description and type are required",
      });
    }
    console.log(req.userId);
    const newDoubt = new DoubtDB({
      userID: req.userId,
      heading,
      description,
      type,
      status: false,
      addDate: new Date(),
    });
    newDoubt.save();
    return res.json({
      message: "doubt created",
    });
  } catch (e) {
    console.log(e);
    return res.json({
      message: "Internal server error",
    });
  }
});

doubt.put("/modify/:doubtid", userMiddleware, async (req, res) => {
  try {
    const { doubtId } = req.params;
    const { heading, description, type } = req.body;
    let Doubt = await DoubtDB.findById(doubtId);
    if (req.userId != Doubt.userID) {
      return res.status(400).json({
        message:
          "You are not allowed to modify this question as you are not the author",
      });
    }
    if (!heading || !description || !type) {
      return res.status(400).json({
        message: "heading, description and type are required",
      });
    }
    await DoubtDB.findByIdAndUpdate(
      doubtId,
      { heading, description, type, modifiedDate: new Date() },
      { runValidators: true }
    );
    return res.json({
      message: "doubt modified",
    });
  } catch (e) {
    return res.json({
      message: "Internal Server Error",
    });
  }
});
doubt.delete("/delete/:doubtId", userMiddleware, async (req, res) => {
  try {
    const { doubtId } = req.params;
    let Doubt = await DoubtDB.findById(doubtId);
    if (req.userId != Doubt.userID) {
      return res.status(400).json({
        message:
          "You are not allowed to delete this question as you are not the author",
      });
    }
    await DoubtDB.findByIdAndDelete(doubtId);
    await SolutionDB.deleteMany({ doubtID: doubtId });
    return res.json({
      message: "doubt deleted",
    });
  } catch (e) {
    return res.json({
      message: "Internal server error",
    });
  }
});
doubt.get("/showAll", userMiddleware, async (req, res) => {
  try {
    const Doubt = await DoubtDB.find();
    const formattedJSON = await formattedDoubts(Doubt);
    return res.json({
      result: formattedJSON,
    });
  } catch (e) {
    console.log(e);
    return res.json({
      message: "Internal server error",
    });
  }
});
const allowedTypes = DoubtDB.schema.path("type").enumValues;
doubt.get("/show/:techStack", userMiddleware, async (req, res) => {
  try {
    const { techStack } = req.params;
    if (!allowedTypes.includes(techStack)) {
      return res.status(404).json({
        message: "this doubt type doesn't exist",
      });
    }
    const Doubt = await DoubtDB.find({ type: techStack });
    if (Doubt.length === 0) {
      return res.json({
        message: "currently this doubt type is empty",
      });
    }
    const formattedJSON = await formattedDoubts(Doubt);
    return res.json({
      result: formattedJSON,
    });
  } catch (e) {
    console.log(e);
    return res.json({
      message: "Internal server error",
    });
  }
});
doubt.get("/show/id/:doubtId", userMiddleware, async (req, res) => {
  try {
    const { doubtId } = req.params;
    const Doubt = await DoubtDB.findById(doubtId);
    const userName = await UserDB.findById(Doubt.userID);
    const solution = await SolutionDB.find({ doubtID: doubtId._id });
    const formatted = formattedDoubt(Doubt, userName.name, solution.length);
    if (!Doubt) {
      return res.json({
        message: "not a valid doubt id",
      });
    }
    return res.json({
      result: formatted,
    });
  } catch (e) {
    console.log(e);
    return res.json({
      message: "Internal server error",
    });
  }
});
doubt.put("/updateUpVotes/:questionID", userMiddleware, async (req, res) => {
  try {
    const { questionID } = req.params;
    const upVoted = await questionsUpVotesDB.findOne({
      questionID,
      userID: req.userId,
    });
    if (!upVoted) {
      const newUpVote = new questionsUpVotesDB({
        questionID,
        userID: req.userId,
      });
      await newUpVote.save();
    } else {
      console.log(upVoted._id);
      await questionsUpVotesDB.findByIdAndDelete(upVoted._id);
    }
    const upVotes = await questionsUpVotesDB.find({ questionID });
    await DoubtDB.findByIdAndUpdate(questionID, { upVotes: upVotes.length });
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
doubt.get("/mydoubt", userMiddleware, async (req, res) => {
  try {
    const Doubt = await DoubtDB.find({ userID: req.userId });
    if (Doubt.length === 0) {
      return res.json({
        message: "currently this doubt type is empty",
      });
    }
    const formattedJSON = await formattedDoubts(Doubt);
    return res.json({
      result: formattedJSON,
    });
  } catch (e) {
    console.log(e);
    return res.json({
      message: "Internal server error",
    });
  }
});
module.exports = { doubt };
