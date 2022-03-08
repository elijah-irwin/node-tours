const express = require('express');
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/sign-up', authController.signUp);
router.post('/sign-in', authController.signIn);
router.post('/forgot-password', authController.forgotPassword);
router.patch('/reset-password/:token', authController.resetPassword);

// All routes below this middleware require user auth.
router.use(authController.protect);

router.patch('/update-password', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/update-me', userController.updateMe);
router.delete('/delete-me', userController.deleteMe);

// All routes below this middleware are restricted to admins.
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
