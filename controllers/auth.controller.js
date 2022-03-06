const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { catchAsync } = require('../utils/error-handlers');
const AppError = require('../utils/AppError');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) If email or password is not provided.
  if (!email || !password)
    return next(new AppError('Email & password required.', 400));

  // 2) Fetch user details with provided email.
  const user = await User.findOne({ email }).select('+password');

  // 3) If there is no user or the provided password is invalid.
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Invalid email or password.', 401));

  // 4) Otherwise, sign and return the auth token.
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Check if user actually exists.
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('User not found.', 404));

  // 2) Generate the random reset token.
  const resetToken = user.createPassResetToken();
  await user.save({ validateBeforeSave: false });
});

// *****************************
// Auth Specific Middleware
// *****************************
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get the token.
  let token;
  const { authorization } = req.headers;
  if (authorization && authorization.startsWith('Bearer'))
    token = authorization.split(' ')[1];

  if (!token)
    return next(new AppError('You must be signed in for this request.', 401));

  // 2) Verify the token is valid.
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists.
  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError('User no longer exists.', 401));

  // 4) Check if user changed password after token was issued.
  if (user.changedPasswordAfter(decoded.iat))
    return next(new AppError('User password has changed. Relog.', 401));

  // 5) Otherwise we are chillin, let em in.
  req.user = user;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (roles.includes(req.user.role)) return next();
    return next(new AppError('No Permission.', 403));
  };
