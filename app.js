const express = require('express');
const morgan = require('morgan');

// Internal Imports.
const AppError = require('./utils/AppError');
const { baseErrorHandler } = require('./utils/error-handlers');

// Create App.
const app = express();

// Routers
const tourRouter = require('./routes/tours.routes');
const userRouter = require('./routes/users.routes');

// Middleware.
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

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
