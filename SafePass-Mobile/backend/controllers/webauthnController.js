const { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } = require('@simplewebauthn/server');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost'; // Should be your domain in production
const RP_NAME = process.env.WEBAUTHN_RP_NAME || 'SafePass';
const ORIGIN = process.env.WEBAUTHN_ORIGIN || 'http://localhost:19006'; // Expo web dev server

const getJwtSecret = () => {
  const secret = String(process.env.JWT_SECRET || '').trim();
  if (!secret) throw new Error('Missing required environment variable: JWT_SECRET');
  return secret;
};

const getAuthenticatedRegistrationUser = (req, submittedEmail = '') => {
  const user = req.user;
  if (!user) return null;

  const requestedEmail = String(submittedEmail || '').trim().toLowerCase();
  if (requestedEmail && requestedEmail !== String(user.email || '').trim().toLowerCase()) {
    return false;
  }
  return user;
};

/**
 * Generate WebAuthn registration options
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const generateRegistrationOptionsHandler = async (req, res) => {
  try {
    const user = getAuthenticatedRegistrationUser(req, req.body?.email);
    if (user === false) {
      return res.status(403).json({ success: false, message: 'You can only register a passkey for your own account' });
    }
    if (!user) {
      return res.status(401).json({ success: false, message: 'Please authenticate before registering a passkey' });
    }

    // Generate a user ID for WebAuthn (should be stable and unique)
    const userId = Buffer.from(user._id.toString()).toString('base64url');

    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpId: RP_ID,
      userID: userId,
      userName: user.email,
      authenticatorSelection: {
        // Require platform authenticator (built-in biometric)
        authenticatorAttachment: 'platform',
        // Require resident key (discoverable credential)
        requireResidentKey: true,
        // Prefer user verification (biometric/PIN)
        userVerification: 'preferred'
      },
      // Exclude credentials already registered for this user
      excludeCredentials: []
    });

    // Store the challenge in the user document for later verification
    user.webauthnChallenge = options.challenge;
    await user.save();

    res.status(200).json({
      success: true,
      options
    });
  } catch (error) {
    console.error('WebAuthn registration options error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate registration options',
      error: error.message
    });
  }
};

/**
 * Verify WebAuthn registration response
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const verifyRegistrationResponseHandler = async (req, res) => {
  try {
    const { id, rawId, response, type } = req.body;
    const user = getAuthenticatedRegistrationUser(req, req.body?.email || req.query?.email);
    if (user === false) {
      return res.status(403).json({ success: false, message: 'You can only register a passkey for your own account' });
    }
    if (!user) {
      return res.status(401).json({ success: false, message: 'Please authenticate before registering a passkey' });
    }

    // Verify the registration response
    const verification = await verifyRegistrationResponse({
      credential: {
        id,
        rawId,
        type,
        response
      },
      expectedChallenge: user.webauthnChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: false
    });

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      // Store the WebAuthn credential
      user.webauthnCredentialID = registrationInfo.credentialID;
      user.webauthnCredentialPublicKey = registrationInfo.credentialPublicKey;
      user.webauthnCounter = registrationInfo.counter;
      user.webauthnChallenge = null; // Clear the challenge after use

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role
        },
        getJwtSecret(),
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Remove password from user object before sending response
      const userObject = user.toObject();
      delete userObject.password;

      res.status(200).json({
        success: true,
        message: 'WebAuthn registration successful',
        token,
        user: userObject
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'WebAuthn registration verification failed'
      });
    }
  } catch (error) {
    console.error('WebAuthn registration verification error:', error);
    res.status(500).json({
      success: false,
      message: 'WebAuthn registration verification failed',
      error: error.message
    });
  }
};

/**
 * Generate WebAuthn authentication options
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const generateAuthenticationOptionsHandler = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user has WebAuthn credential
    if (!user.webauthnCredentialID) {
      return res.status(400).json({
        success: false,
        message: 'No WebAuthn credential found for this user'
      });
    }

    // Generate authentication options
    const options = await generateAuthenticationOptions({
      challenge: crypto.randomBytes(32).toString('base64url'),
      allowCredentials: [
        {
          id: user.webauthnCredentialID,
          type: 'public-key'
        }
      ],
      userVerification: 'preferred'
    });

    // Store the challenge in the user document for later verification
    user.webauthnChallenge = options.challenge;
    await user.save();

    res.status(200).json({
      success: true,
      options
    });
  } catch (error) {
    console.error('WebAuthn authentication options error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate authentication options',
      error: error.message
    });
  }
};

/**
 * Verify WebAuthn authentication response
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const verifyAuthenticationResponseHandler = async (req, res) => {
  try {
    const { id, rawId, response, type, authenticatorAttestation } = req.body;
    const email = req.body?.email || req.query?.email;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify the authentication response
    const verification = await verifyAuthenticationResponse({
      credential: {
        id,
        rawId,
        type,
        response
      },
      expectedChallenge: user.webauthnChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credentialCurrentSignCount: user.webauthnCounter,
      requireUserVerification: false
    });

    const { verified, authenticationInfo } = verification;

    if (verified && authenticationInfo) {
      // Update the counter to prevent replay attacks
      user.webauthnCounter = authenticationInfo.newCounter;
      user.webauthnChallenge = null; // Clear the challenge after use

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role
        },
        getJwtSecret(),
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      // Remove password from user object before sending response
      const userObject = user.toObject();
      delete userObject.password;

      res.status(200).json({
        success: true,
        message: 'WebAuthn authentication successful',
        token,
        user: userObject
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'WebAuthn authentication verification failed'
      });
    }
  } catch (error) {
    console.error('WebAuthn authentication verification error:', error);
    res.status(500).json({
      success: false,
      message: 'WebAuthn authentication verification failed',
      error: error.message
    });
  }
};

module.exports = {
  generateRegistrationOptionsHandler,
  verifyRegistrationResponseHandler,
  generateAuthenticationOptionsHandler,
  verifyAuthenticationResponseHandler
};
