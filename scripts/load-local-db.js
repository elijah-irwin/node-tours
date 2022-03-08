const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: '../.env' });

// Local imports.
const Tour = require('../models/tour.model');
const User = require('../models/user.model');
const Review = require('../models/review.model');

// DB connection.
mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connection successful!');
  });

// Read local data.
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`, 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`, 'utf-8')
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/reviews.json`, 'utf-8')
);

// Delete old data.
const deleteAllTours = async () => {
  await Tour.deleteMany();
  await User.deleteMany();
  await Review.deleteMany();
  process.exit();
};

// Create tour data.
const createTours = async () => {
  await Tour.create(tours);
  await User.create(users, { validateBeforeSave: false });
  await Review.create(reviews);
  process.exit();
};

if (process.argv[2] === '--load') createTours();
else if (process.argv[2] === '--delete') deleteAllTours();
