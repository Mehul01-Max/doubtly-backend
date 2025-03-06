const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  solutionID: {
    type: String,
    required: true,
  },
  userID: {
    type: String,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  addDate: {
    type: Date,
    required: true,
  },
  modifiedDate: {
    type: Date,
  },
});

const CommentDB = mongoose.model("comments", CommentSchema);

module.exports = { CommentDB };
