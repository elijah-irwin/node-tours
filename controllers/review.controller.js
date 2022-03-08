const Review = require('../models/review.model');
const { catchAsync } = require('../utils/error-handlers');
const factory = require('../utils/handlers-factory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: { reviews },
  });
});

exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review, { path: 'user' });
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);

// *****************************
// Reviews Specific Middleware
// *****************************
exports.setTourUserIds = (req, res, next) => {
  if (req.params.tourId) req.body.tour = req.params.tourId;
  req.body.user = req.user.id;
  next();
};
