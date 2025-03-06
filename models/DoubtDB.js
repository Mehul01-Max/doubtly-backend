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
    enum: ["frontend", "backend", "dsa", "maths", "ai/ml"],
  },
  status: {
    type: Boolean,
    required: true,
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
  },
});
const DoubtDB = mongoose.model("Doubt", doubtSchema);
module.exports = { DoubtDB };
