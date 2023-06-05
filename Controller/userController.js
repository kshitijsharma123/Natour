const user = require("./../models/userModel");
const catchAsync = require("./../utils/catchError");
const AppError = require("../utils/appError");

exports.getMe = (req, res, next) => {
  req.user
//  console.log(req.user);
  next();
};

exports.getAllUser = catchAsync(async (req, res) => {
  const users = await user.find();

  return res.status(200).json({
    status: "succes",
    resultlenght: users.length,
    data: {
      users,
    },
  });
});

exports.createUser = (req, res) => {
  res.status(500).send(`Working on this Route`);
};

exports.getUser = async (req, res) => {
//  const meUser = await user.findOne({ _id: req.user.id });
  const meUser = await user.findById(req.user.id);

  return res.status(200).json({
    succes: "positive",
    data: {
      result: meUser,
    },
  });
};

exports.updateUser = (req, res) => {
  res.status(500).send(`Working on this Route`);
};

exports.deleteUser = (req, res) => {
  res.status(500).send(`Working on this Route`);
};
