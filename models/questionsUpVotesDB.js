const mongoose = require("mongoose");

const questionsUpVotesSchema = new mongoose.Schema({
  questionID: {
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

const questionsUpVotesDB = mongoose.model(
  "questionsUpVotes",
  questionsUpVotesSchema
);

module.exports = { questionsUpVotesDB };
