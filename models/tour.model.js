const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tour name is required!'],
      unique: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Tour duration is required!'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Tour max group size is required!'],
    },
    difficulty: {
      type: String,
      required: [true, 'Tour must have a difficulty!'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'Tour price is required!'],
    },
    priceDiscount: Number,
    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour must have a summary!'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Tour must have a cover image!'],
    },
    images: [String],
    startDates: [Date],
  },
  { timestamps: true }
);

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
