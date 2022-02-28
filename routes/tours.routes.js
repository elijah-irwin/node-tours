const express = require('express');

const router = express.Router();
const tourController = require('../controllers/tour.controller');

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/top5-tours')
  .get(tourController.top5ToursAlias, tourController.getAllTours);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
