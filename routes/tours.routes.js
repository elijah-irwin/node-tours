const express = require('express');

const router = express.Router();
const tourController = require('../controllers/tour.controller');
const authController = require('../controllers/auth.controller');

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-tours/:year').get(tourController.getMonthlyTours);

router
  .route('/top5-tours')
  .get(tourController.top5ToursAlias, tourController.getAllTours);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('lead-guide', 'admin'),
    tourController.deleteTour
  );

module.exports = router;
