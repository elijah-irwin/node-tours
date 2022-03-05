const express = require('express');
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router
  .route('/')
  .get(authController.protect, userController.getAllUsers)
  .post(userController.createUser);

router.post('/sign-up', authController.signUp);
router.post('/sign-in', authController.signIn);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
