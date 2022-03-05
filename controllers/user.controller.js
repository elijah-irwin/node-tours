const User = require('../models/user.model');
const { catchAsync } = require('../utils/error-handlers');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

exports.createUser = (req, res) => {};

exports.getUser = (req, res) => {};
exports.updateUser = (req, res) => {};
exports.deleteUser = (req, res) => {};
