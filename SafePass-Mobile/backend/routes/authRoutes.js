const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Social login routes
router.post('/facebook', authController.facebookLogin);
router.post('/google', authController.googleLogin);
router.post('/social-signup-profile', authController.getSocialSignupProfile);
router.post('/link-social-account', authMiddleware, authController.linkSocialAccount);
router.post('/apple', authController.appleLogin);

module.exports = router;
