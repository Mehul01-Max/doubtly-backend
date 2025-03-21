const mongoose = require("mongoose");

const solutionsUpVotesSchema = new mongoose.Schema({
  solutionID: {
    type: String,
    required: true,
  },
  userID: {
    type: String,
    required: true,
  },
  upvoteDate: {
    type: Date,
    required: true,
  },
});

const SolutionsUpVotesDB = mongoose.model(
  "solutionsUpVotes",
  solutionsUpVotesSchema
);

module.exports = { SolutionsUpVotesDB };
