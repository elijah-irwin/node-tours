const express = require('express');
const morgan = require('morgan');
const app = express();

// Routers
const tourRouter = require('./routes/tours.routes');
const userRouter = require('./routes/users.routes');

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(`${__dirname}/public`));

// Mounting Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
