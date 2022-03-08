const User = require('../models/user.model');
const { catchAsync } = require('../utils/error-handlers');
const AppError = require('../utils/AppError');
const factory = require('../utils/handlers-factory');

// Helpers
const filterUpdateObj = (obj, ...allowedFields) => {
  const update = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) update[el] = obj[el];
  });
  return update;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

// Controllers
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

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.createUser = (req, res) => {};
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
