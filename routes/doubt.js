require("dotenv").config();
const { Router } = require("express");
const { algoliasearch } = require("algoliasearch");
const client = algoliasearch(
  process.env.ALGOLIA_APPLICATION_ID,
  process.env.ALGOLIA_API_KEY
);
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
  calculateTrendingScore,
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
    // console.log(req.userId);
    const newDoubt = new DoubtDB({
      userID: req.userId,
      heading,
      description,
      type,
      status: "No solution available",
      addDate: new Date(),
    });
    newDoubt.save();
    await client.saveObject({
      indexName: "doubt_index",
      body: { objectID: newDoubt._doc._id, ...newDoubt._doc },
    });
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

doubt.put("/modify/:doubtId", userMiddleware, async (req, res) => {
  try {
    const { doubtId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(doubtId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const { heading, description, type } = req.body;
    let Doubt = await DoubtDB.findById(doubtId);
    if (req.userId != Doubt.userID) {
      return res.status(400).json({
        message:
          "You are not allowed to modify this question as you are not the author",
      });
    }
    // console.log(Doubt.addDate - new Date());
    if (new Date() - Doubt.addDate > 300000) {
      return res.status(403).json({
        message:
          "You are not allowed to modify as the doubt is posted more than 5 minutes ago",
      });
    }
    if (!heading || !description || !type) {
      return res.status(400).json({
        message: "heading, description and type are required",
      });
    }
    const d = await DoubtDB.findByIdAndUpdate(
      doubtId,
      { heading, description, type, modifiedDate: new Date() },
      { runValidators: true, new: true }
    );
    await client.addOrUpdateObject({
      indexName: "doubt_index",
      objectID: doubtId,
      body: d._doc,
    });
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
    if (!mongoose.Types.ObjectId.isValid(doubtId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    let Doubt = await DoubtDB.findById(doubtId);
    if (req.userId != Doubt.userID) {
      return res.status(400).json({
        message:
          "You are not allowed to delete this question as you are not the author",
      });
    }
    if (new Date() - Doubt.addDate > 300000) {
      return res.status(403).json({
        message:
          "You are not allowed to delete as the doubt is posted more than 5 minutes ago",
      });
    }
    await DoubtDB.findByIdAndDelete(doubtId);
    await SolutionDB.deleteMany({ doubtID: doubtId });
    await client.deleteObject({
      indexName: "doubt_index",
      objectID: doubtId,
    });
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
    const formattedJSON = await formattedDoubts(Doubt, req);
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
doubt.get("/show/", userMiddleware, async (req, res) => {
  try {
    const techStack = req.query.stack;
    const type = req.query.type;
    if (techStack && !allowedTypes.includes(techStack)) {
      return res.status(404).json({
        message: "this doubt type doesn't exist",
      });
    }
    const query = {};
    if (techStack) query.type = techStack;
    if (type === "unanswered") query.status = false;
    const Doubt = await DoubtDB.find(query);
    if (Doubt.length === 0) {
      return res.json({
        message: "currently this doubt type is empty",
      });
    }
    let formattedJSON = Doubt;
    const updatedDoubts = Doubt.map((doubt) => ({
      ...doubt._doc,
      trendingScore: calculateTrendingScore(doubt),
    }));
    updatedDoubts.sort((a, b) => b.trendingScore - a.trendingScore);

    formattedJSON = await formattedDoubts(updatedDoubts, req);
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
    if (!mongoose.Types.ObjectId.isValid(doubtId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const Doubt = await DoubtDB.findById(doubtId);
    const userName = await UserDB.findById(Doubt.userID);
    const solution = await SolutionDB.find({ doubtID: doubtId._id });
    const formatted = formattedDoubt(
      Doubt,
      userName.name,
      solution.length,
      req.userId === Doubt.userID
    );
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
    if (!mongoose.Types.ObjectId.isValid(questionID)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    const upVoted = await questionsUpVotesDB.findOne({
      questionID,
      userID: req.userId,
    });
    if (!upVoted) {
      const newUpVote = new questionsUpVotesDB({
        questionID,
        userID: req.userId,
        upvoteDate: new Date(),
      });
      await newUpVote.save();
    } else {
      // console.log(upVoted._id);
      await questionsUpVotesDB.findByIdAndDelete(upVoted._id);
    }
    const upVotes = await questionsUpVotesDB.find({ questionID });
    const d = await DoubtDB.findByIdAndUpdate(
      questionID,
      { upVotes: upVotes.length },
      { runValidators: true, new: true }
    );
    await client.addOrUpdateObject({
      indexName: "doubt_index",
      objectID: questionID,
      body: d._doc,
    });
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
    const Doubt = await DoubtDB.find({ userID: req.userId }).sort({
      addDate: -1,
    });
    if (Doubt.length === 0) {
      return res.json({
        message: "currently this doubt type is empty",
      });
    }
    const formattedJSON = await formattedDoubts(Doubt, req);
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
doubt.put("/viewsUpdate/:questionId", userMiddleware, async (req, res) => {
  try {
    const { questionId } = req.params;
    const d = await DoubtDB.findByIdAndUpdate(
      questionId,
      { $inc: { views: 1 } },
      { runValidators: true, new: true }
    );
    await client.addOrUpdateObject({
      indexName: "doubt_index",
      objectID: questionId,
      body: d._doc,
    });
    return res.json({
      message: "views updated successfully",
    });
  } catch (e) {
    console.log(e);
    return res.json({
      message: "Internal Server error",
    });
  }
});
doubt.get("/trending", userMiddleware, async (req, res) => {
  try {
    const Doubt = await DoubtDB.find();
    const updatedDoubts = Doubt.map((doubt) => ({
      ...doubt._doc,
      trendingScore: calculateTrendingScore(doubt),
    }));
    updatedDoubts.sort((a, b) => b.trendingScore - a.trendingScore);
    const formattedJSON = await formattedDoubts(updatedDoubts, req);
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
doubt.get("/latest", userMiddleware, async (req, res) => {
  try {
    const Doubt = await DoubtDB.find().sort({ addDate: -1 });
    const formattedJSON = await formattedDoubts(Doubt, req);
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
doubt.get("/search", userMiddleware, async (req, res) => {
  try {
    const q = req.query.q;
    const response = await client.search({
      requests: [{ indexName: "doubt_index", query: q }],
    });
    const doubts = await formattedDoubts(response.results[0]["hits"], req);
    return res.json({
      result: doubts,
    });
  } catch (e) {
    console.log(e);
    return res.json({
      message: "Internal server error",
    });
  }
});
doubt.get;
module.exports = { doubt };
