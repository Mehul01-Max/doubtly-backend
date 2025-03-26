const { Router } = require("express");
const { userMiddleware } = require("../middleware/userMiddleware");
const notification = Router();
notification.get("/", userMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userID: req.userId }).sort({
      addDate: -1,
    });
    res.status(200).json(notifications);
  } catch (e) {
    console.log(e);
    res.status(400).json({
      message: "Internal server error",
    });
  }
});
module.exports = { notification };
