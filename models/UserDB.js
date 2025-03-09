const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  JoinedDate: {
    type: Date,
    required: true,
  },
  points: {
    type: Number,
    required: true,
  },
});

const UserDB = mongoose.model("User", UserSchema);

module.exports = { UserDB };
