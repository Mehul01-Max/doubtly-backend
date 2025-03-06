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
doubt.post("/add", userMiddleware, async (req, res) => {
  try {
    const { heading, description, type } = req.body;
    if (!heading || !description || !type) {
      return res.status(400).json({
        message: "heading, description and type are required",
      });
    }
    const newDoubt = new DoubtDB({
      userID: req.userId,
      heading,
      description,
      type,
      status: false,
      addDate: new Date(),
    });
    newDoubt.save();
    res.json({
      message: "doubt created",
    });
  } catch (e) {
    console.log(e);
    res.json({
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
    res.json({
      message: "doubt modified",
    });
  } catch (e) {
    res.json({
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
    res.json({
      message: "doubt deleted",
    });
  } catch (e) {
    res.json({
      message: "Internal server error",
    });
  }
});
doubt.get("/showAll", userMiddleware, async (req, res) => {
  try {
    const Doubt = await DoubtDB.find();
    const formattedJSON = await formattedDoubts(Doubt);
    res.json({
      result: formattedJSON,
    });
  } catch (e) {
    console.log(e);
    res.json({
      message: "Internal server error",
    });
  }
});
const allowedTypes = DoubtDB.schema.path("type").enumValues;
doubt.get("/show/:techStack", userMiddleware, async (req, res) => {
  try {
    const { techStack } = req.params;
    if (!allowedTypes.includes(techStack)) {
      res.status(404).json({
        message: "this doubt type doesn't exist",
      });
    }
    const Doubt = await DoubtDB.find({ type: techStack });
    if (Doubt.length === 0) {
      res.json({
        message: "currently this doubt type is empty",
      });
    }
    const formattedJSON = await formattedDoubts(Doubt);
    res.json({
      result: formattedJSON,
    });
  } catch (e) {
    console.log(e);
    res.json({
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
      res.json({
        message: "not a valid doubt id",
      });
    }
    res.json({
      result: formatted,
    });
  } catch (e) {
    console.log(e);
    res.json({
      message: "Internal server error",
    });
  }
});
module.exports = { doubt };
