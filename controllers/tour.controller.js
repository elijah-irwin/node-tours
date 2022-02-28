const Tour = require('../models/tour.model');

exports.getAllTours = async (req, res) => {
  const tours = await Tour.find();

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours,
    },
  });
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getTour = async (req, res) => {
  const tour = await Tour.findById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
};

exports.updateTour = async (req, res) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      updatedTour,
    },
  });
};

exports.deleteTour = async (req, res) => {
  await Tour.findByIdAndDelete(req.params.id);
  res.status(204).json({
    status: 'success',
    data: null,
  });
};
