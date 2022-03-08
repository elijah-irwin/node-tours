const express = require('express');

const router = express.Router();
const tourController = require('../controllers/tour.controller');
const authController = require('../controllers/auth.controller');
const reviewRouter = require('./review.routes');

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-tours/:year')
  .get(
    authController.protect,
    authController.restrictTo('lead-guide', 'admin', 'guide'),
    tourController.getMonthlyTours
  );

router
  .route('/top5-tours')
  .get(tourController.top5ToursAlias, tourController.getAllTours);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('lead-guide', 'admin'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('lead-guide', 'admin'),
    tourController.deleteTour
  );

router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
