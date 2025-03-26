const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  userID: { type: String, ref: "User" },
  message: { type: String, required: true },
  link: { type: String, required: true },
  addDate: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

const NotificationDB = mongoose.model("Notification", notificationSchema);
module.exports = { NotificationDB };
