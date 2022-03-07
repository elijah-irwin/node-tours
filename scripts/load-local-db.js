const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: '../.env' });

// Local imports.
const Tour = require('../models/tour.model');

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

// Delete old data.
const deleteAllTours = async () => {
  await Tour.deleteMany();
  process.exit();
};

// Create tour data.
const createTours = async () => {
  await Tour.create(tours);
  process.exit();
};

if (process.argv[2] === '--load') createTours();
else if (process.argv[2] === '--delete') deleteAllTours();
