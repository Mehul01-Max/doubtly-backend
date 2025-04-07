require("dotenv").config();
const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL,
    pass: process.env.PASS,
  },
});

const sendSolutionNotification = async (
  userEmail,
  doubtTitle,
  doubtLink,
  isUserDoubt
) => {
  try {
    const subject = "New Solution Added to Your Doubt";
    const text = isUserDoubt
      ? `A new solution has been added to your doubt: "${doubtTitle}". Here is the link! ${doubtLink}`
      : `A new solution has been added to your upvoted doubt: "${doubtTitle}". Here is the link! ${doubtLink}`;

    const mailOptions = {
      from: process.env.GMAIL,
      to: userEmail,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
  } catch (e) {
    console.log(e);
  }
};

module.exports = { sendSolutionNotification };
