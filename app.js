const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

// Internal Imports.
const AppError = require('./utils/AppError');
const { baseErrorHandler } = require('./utils/error-handlers');

// Routers
const tourRouter = require('./routes/tours.routes');
const userRouter = require('./routes/users.routes');

// Create App.
const app = express();

// Middleware.
app.use(helmet());
app.use(
  '/api',
  rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests have been sent! Try again later!',
  })
);
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
app.use(express.static(`${__dirname}/public`));

// Mounting Routes.
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Catch All Route.
app.all('*', (req, res, next) => {
  const err = new AppError(
    `There is no route ${req.originalUrl} here... sorry!`,
    404
  );
  next(err);
});

app.use(baseErrorHandler);

module.exports = app;
