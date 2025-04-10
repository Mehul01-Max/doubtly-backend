require("dotenv").config();
const { SolutionDB } = require("../models/SolutionDB");
const { UserDB } = require("../models/UserDB");
const { DoubtDB } = require("../models/DoubtDB");
const { questionsUpVotesDB } = require("../models/questionsUpVotesDB");
const { SolutionsUpVotesDB } = require("../models/SolutionsUpVotesDB");
const { algoliasearch } = require("algoliasearch");
const client = algoliasearch(
  process.env.ALGOLIA_APPLICATION_ID,
  process.env.ALGOLIA_API_KEY
);
const getTimeAgo = (date) => {
  const now = new Date();
  date = new Date(date);
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

const formattedSolutions = async (Solution, req) => {
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
  const formattedS = await Promise.all(
    Solution.map(async (d) => {
      const userName = userMap[d.userID];
      const isUpvoted = await SolutionsUpVotesDB.find({
        userID: req.userId,
        solutionID: d._id,
      });
      const isUserSol = d.userID === req.userId;
      return formattedSolution(d, userName, isUpvoted, isUserSol);
    })
  );
  return formattedS;
};
const formattedSolution = (d, userName, isUpvoted, isUserSol) => {
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
    date: d.addDate,
    isVerified: d.status,
    modifiedDate: modifiedDate || null,
    isUpvoted: isUpvoted.length === 0 ? false : true,
    isUserSol: isUserSol,
  };
};
const formattedDoubts = async (Doubt, req) => {
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
  const formattedD = await Promise.all(
    Doubt.map(async (d) => {
      const userName = userMap[d.userID];
      const isUpvoted = await questionsUpVotesDB.find({
        userID: req.userId,
        questionID: d._id,
      });
      const isUserDoubt = d.userID === req.userId;
      // console.log(formattedDoubt(d, userName, isUpvoted));
      return formattedDoubt(d, userName, isUpvoted, isUserDoubt);
    })
  );

  return formattedD;
};
const formattedDoubt = (d, userName, isUpvoted, isUserDoubt) => {
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
    answerCount: d.AnswerCount || 0,
    upvotes: d.upVotes || 0,
    timeAgo: timeAgo,
    date: d.addDate,
    status: d.status,
    modifiedDate: modifiedDate || null,
    isUpvoted: isUpvoted.length === 0 ? false : true,
    isUserDoubt: isUserDoubt,
  };
};
const calculateAgeInDays = (date) => {
  const now = new Date();
  const createdDate = new Date(date);
  const diffTime = Math.abs(now - createdDate);
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};
const calculateTrendingScore = (doubt) => {
  const ageInDays = calculateAgeInDays(doubt.addDate);
  return (
    doubt.views * 0.3 +
    doubt.AnswerCount * 2 +
    doubt.upVotes * 3 +
    doubt.commentCount * 1.5 -
    ageInDays * 0.5
  );
};
const updateDoubtStatus = async (doubtID) => {
  const solutions = await SolutionDB.find({ doubtID });
  if (new Date() - solutions.addDate > 300000) {
    return res.status(403).json({
      message: "exeeded 5 min time limit for modification",
    });
  }
  let hasCorrect = false;
  let hasPending = false;

  solutions.forEach((sol) => {
    if (sol.status === "correct") hasCorrect = true;
    if (sol.status === "pending") hasPending = true;
  });

  let newStatus = "No Solution Available";
  if (hasCorrect) {
    newStatus = "Verified Solution Available";
  } else if (hasPending) {
    newStatus = "Unverified Solution Available";
  }

  const d = await DoubtDB.findByIdAndUpdate(
    doubtID,
    { status: newStatus },
    { runValidators: true, new: true }
  );
  await client.addOrUpdateObject({
    indexName: "doubt_index",
    objectID: doubtID,
    body: d._doc,
  });
};

module.exports = {
  updateDoubtStatus,
  getTimeAgo,
  formattedDoubts,
  formattedDoubt,
  formattedSolutions,
  calculateTrendingScore,
};
