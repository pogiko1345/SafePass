const express = require('express');
const router = express.Router();
const webauthnController = require('../controllers/webauthnController');
const { authMiddleware } = require('../middleware/authMiddleware');

// WebAuthn routes
router.post('/register/options', authMiddleware, webauthnController.generateRegistrationOptionsHandler);
router.post('/register/verify', authMiddleware, webauthnController.verifyRegistrationResponseHandler);
router.post('/authenticate/options', webauthnController.generateAuthenticationOptionsHandler);
router.post('/authenticate/verify', webauthnController.verifyAuthenticationResponseHandler);

module.exports = router;
