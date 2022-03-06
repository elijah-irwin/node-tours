const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { catchAsync } = require('../utils/error-handlers');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createAndSendToken = (user, statusCode, res) => {
  user.password = undefined;
  user.passwordChangedAt = undefined;
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRY * 24 * 60 * 60 * 1000
    ),
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  });

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  createAndSendToken(newUser, 201, res);
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
  createAndSendToken(user, 200, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Check if user actually exists.
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('User not found.', 404));

  // 2) Generate the random reset token.
  const resetToken = user.createPassResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to users email.
  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/reset-password/${resetToken}`;

    const message = `You are receiving this email because you have initiated a password reset. Submit a PATCH request to: ${resetUrl} with your new credentials.`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Check email for password reset intructions.',
    });
  } catch {
    // If any issues, need to reset password reset token and expiry time.
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    next(new AppError('Issue sending the email. Try again later.', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Hash and compare token to existing users.
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Invalid token provided.', 400));

  // 2) If user with matching token and not expired, update password and reset fields.
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 3) Sign new token and return to user.
  createAndSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user.
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if provided password is correct.
  const correct = await user.correctPassword(
    req.body.currentPassword,
    user.password
  );
  if (!correct) return next(new AppError('Current password is invalid.', 401));

  // 3) If so, update the password.
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();

  // 4) Sign a new token and send back to user.
  createAndSendToken(user, 200, res);
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
