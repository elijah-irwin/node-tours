const User = require('../models/user.model');
const { catchAsync } = require('../utils/error-handlers');
const AppError = require('../utils/AppError');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

exports.createUser = (req, res) => {};

const filterUpdateObj = (obj, ...allowedFields) => {
  const update = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) update[el] = obj[el];
  });
  return update;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword)
    return next(new AppError('Cant update password here.', 400));

  const update = filterUpdateObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, update, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getUser = (req, res) => {};
exports.updateUser = (req, res) => {};
exports.deleteUser = (req, res) => {};
