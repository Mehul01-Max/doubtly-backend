const mongoose = require("mongoose");

const doubtSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
  },
  heading: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    lowercase: true,
    enum: ["frontend", "backend", "dsa", "maths", "ai/ml", "miscellaneous"],
  },
  status: {
    type: String,
    required: true,
    lowercase: true,
    enum: [
      "no solution available",
      "unverified solution available",
      "verified solution available",
    ],
  },
  AnswerCount: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  commentCount: {
    type: Number,
    default: 0,
  },
  addDate: {
    type: Date,
    required: true,
  },
  modifiedDate: {
    type: Date,
  },
  upVotes: {
    type: Number,
    default: 0,
  },
});
const DoubtDB = mongoose.model("Doubt", doubtSchema);
module.exports = { DoubtDB };
