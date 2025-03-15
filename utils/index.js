// const { SolutionDB } = require('../models/SolutionDB');
const { SolutionDB } = require("../models/SolutionDB");
const { UserDB } = require("../models/UserDB");
const { DoubtDB } = require("../models/DoubtDB");

const getTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}y ago`;
};

const formattedSolutions = async (Solution) => {
  if (!Solution) {
    res.json({
      message: "no solution available",
    });
  }
  const userIds = [...new Set(Solution.map((s) => s.userID))];
  const users = await UserDB.find({ _id: { $in: userIds } });
  const userMap = {};
  users.forEach((user) => {
    userMap[user._id] = user.name;
  });
  const solutionIds = Solution.map((d) => d._id);
  const formattedS = Solution.map((d) => {
    const userName = userMap[d.userID];
    return formattedSolution(d, userName);
  });
  return formattedS;
};
const formattedSolution = (d, userName) => {
  const timeAgo = getTimeAgo(d.addDate);
  let modifiedDate = null;
  if (typeof modifiedDate == Number) {
    modifiedDate = getTimeAgo(d.modifiedDate);
  }
  return {
    id: d._id,
    solution: d.solution,
    username: userName || "Unknown User",
    upvotes: d.upVotes || 0,
    timeAgo: timeAgo,
    modifiedDate: modifiedDate || null,
  };
};
const formattedDoubts = async (Doubt) => {
  if (!Doubt) {
    res.json({
      message: "no doubt available",
    });
  }
  const userIds = [...new Set(Doubt.map((d) => d.userID))];
  const users = await UserDB.find({ _id: { $in: userIds } });
  const userMap = {};
  users.forEach((user) => {
    userMap[user._id] = user.name;
  });
  const doubtIds = Doubt.map((d) => d._id);
  const solutionCounts = await SolutionDB.aggregate([
    { $match: { doubtID: { $in: doubtIds.map((id) => id.toString()) } } },
    { $group: { _id: "$doubtID", count: { $sum: 1 } } },
  ]);
  const solutionCountMap = {};
  solutionCounts.forEach((item) => {
    solutionCountMap[item._id] = item.count;
  });
  const formattedD = Doubt.map((d) => {
    const userName = userMap[d.userID];
    // console.log(d.userID);
    const solutionCount = solutionCounts[d._id.toString()];
    return formattedDoubt(d, userName, solutionCount);
  });

  return formattedD;
};
const formattedDoubt = (d, userName, solutionCount) => {
  const timeAgo = getTimeAgo(d.addDate);
  let modifiedDate = null;
  if (typeof modifiedDate == Number) {
    modifiedDate = getTimeAgo(d.modifiedDate);
  }
  const tags = [d.type];

  return {
    id: d._id,
    title: d.heading,
    description: d.description,
    tags: tags,
    username: userName || "Unknown User",
    answerCount: solutionCount || 0,
    upvotes: d.upVotes || 0,
    timeAgo: timeAgo,
    modifiedDate: modifiedDate || null,
  };
};
module.exports = {
  getTimeAgo,
  formattedDoubts,
  formattedDoubt,
  formattedSolutions,
};
