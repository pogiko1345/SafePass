const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const axios = require('axios');

const JWT_SECRET = String(process.env.JWT_SECRET || '').trim();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const getJwtSecret = () => {
  if (!JWT_SECRET) {
    throw new Error('Missing required environment variable: JWT_SECRET');
  }
  return JWT_SECRET;
};
const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID || '';
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET || '';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID || '';

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role
    },
    getJwtSecret(),
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Verify Apple identity token using Apple's public keys
 * @param {string} identityToken - Apple identity token (JWT)
 * @returns {Promise<Object>} Decoded and verified token payload
 */
const verifyAppleIdentityToken = async (identityToken) => {
  try {
    // Fetch Apple's public keys
    const appleKeysResponse = await axios.get('https://appleid.apple.com/auth/keys');
    const keys = appleKeysResponse.data.keys;

    // Decode the token header to get the key ID
    const header = JSON.parse(Buffer.from(identityToken.split('.')[0], 'base64').toString('utf8'));
    const kid = header.kid;

    // Find the matching key
    const key = keys.find(k => k.kid === kid);
    if (!key) {
      throw new Error('Unable to find matching key for Apple identity token');
    }

    // Verify the token using the public key
    // For RS256 algorithm, we need to create a proper public key from JWK
    const { n, e } = key;

    // Convert JWK components to buffers
    const modulus = Buffer.from(n, 'base64url');
    const exponent = Buffer.from(e, 'base64url');

    // Create a public key using the crypto module
    // Apple uses RS256, so we create an RSA public key
    const publicKey = crypto.createPublicKey({
      key: {
        kty: 'RSA',
        n: modulus,
        e: exponent
      },
      format: 'jwk'
    });

    // Verify the token
    const decoded = jwt.verify(identityToken, publicKey, {
      algorithms: ['RS256'],
      audience: APPLE_CLIENT_ID,
      issuer: 'https://appleid.apple.com'
    });

    return decoded;
  } catch (error) {
    console.error('Apple identity token verification error:', error);
    throw new Error(`Invalid Apple identity token: ${error.message}`);
  }
};

/**
 * Handle Facebook login
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const facebookLogin = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Facebook access token is required'
      });
    }

    if (!FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
      return res.status(503).json({
        success: false,
        message: 'Facebook sign-in is not configured on the server'
      });
    }

    const tokenDebugResponse = await axios.get('https://graph.facebook.com/debug_token', {
      params: {
        input_token: accessToken,
        access_token: `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}`
      }
    });
    const tokenDebugData = tokenDebugResponse.data?.data;
    if (!tokenDebugData?.is_valid || String(tokenDebugData.app_id) !== FACEBOOK_APP_ID) {
      return res.status(401).json({ success: false, message: 'Invalid Facebook access token' });
    }

    // Verify the access token with Facebook's Graph API
    const facebookResponse = await axios.get(`https://graph.facebook.com/me`, {
      params: {
        fields: 'id,email,first_name,last_name,picture.type(large)',
        access_token: accessToken
      }
    });

    const facebookUserData = facebookResponse.data;

    const user = await User.findOne({ facebookId: facebookUserData.id });
    if (!user) {
      return res.status(403).json({
        success: false,
        code: 'SOCIAL_ACCOUNT_NOT_LINKED',
        message: 'This Facebook account is not connected to a SafePass account. Sign in with your SafePass password, then ask an administrator to connect it.'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Remove password from user object before sending response
    const userObject = user.toObject();
    delete userObject.password;

    res.status(200).json({
      success: true,
      message: 'Facebook login successful',
      token,
      user: userObject
    });
  } catch (error) {
    console.error('Facebook login error:', error);
    res.status(500).json({
      success: false,
      message: 'Facebook login failed'
    });
  }
};

/**
 * Handle Google login
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google ID token is required'
      });
    }

    if (!GOOGLE_CLIENT_ID) {
      return res.status(503).json({
        success: false,
        message: 'Google sign-in is not configured on the server'
      });
    }

    const googleResponse = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
      params: { id_token: idToken }
    });

    const tokenData = googleResponse.data || {};
    const validIssuer = ['accounts.google.com', 'https://accounts.google.com'].includes(tokenData.iss);
    const emailVerified = tokenData.email_verified === true || tokenData.email_verified === 'true';
    if (tokenData.aud !== GOOGLE_CLIENT_ID || !validIssuer || !emailVerified || !tokenData.email) {
      return res.status(401).json({ success: false, message: 'Invalid Google ID token' });
    }

    const googleUserData = {
      id: tokenData.sub,
      email: tokenData.email,
      firstName: tokenData.given_name || '',
      lastName: tokenData.family_name || '',
      picture: tokenData.picture || '',
      verified_email: emailVerified
    };

    const user = await User.findOne({ googleId: googleUserData.id });
    if (!user) {
      return res.status(403).json({
        success: false,
        code: 'SOCIAL_ACCOUNT_NOT_LINKED',
        message: 'This Google account is not connected to a SafePass account. Sign in with your SafePass password, then ask an administrator to connect it.'
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Remove password from user object before sending response
    const userObject = user.toObject();
    delete userObject.password;

    res.status(200).json({
      success: true,
      message: 'Google login successful',
      token,
      user: userObject
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Google login failed'
    });
  }
};

// Verifies a provider identity for the visitor registration flow. This does not
// create an account; it returns a short-lived, server-signed proof that the
// visitor registration endpoint can safely bind to the new visitor account.
const getSocialSignupProfile = async (req, res) => {
  try {
    const provider = String(req.body?.provider || '').toLowerCase();
    const purpose = req.body?.purpose === 'account_link' ? 'account_link' : 'visitor_signup';
    let profile;

    if (provider === 'google') {
      const idToken = req.body?.idToken;
      if (!idToken || !GOOGLE_CLIENT_ID) {
        return res.status(400).json({ success: false, message: 'Google sign-up is not configured.' });
      }
      const { data = {} } = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
        params: { id_token: idToken }
      });
      const validIssuer = ['accounts.google.com', 'https://accounts.google.com'].includes(data.iss);
      const emailVerified = data.email_verified === true || data.email_verified === 'true';
      if (data.aud !== GOOGLE_CLIENT_ID || !validIssuer || !emailVerified || !data.sub || !data.email) {
        return res.status(401).json({ success: false, message: 'Invalid Google account.' });
      }
      profile = {
        provider,
        socialId: data.sub,
        email: data.email,
        fullName: `${data.given_name || ''} ${data.family_name || ''}`.trim() || data.email,
      };
    } else if (provider === 'facebook') {
      const accessToken = req.body?.accessToken;
      if (!accessToken || !FACEBOOK_APP_ID || !FACEBOOK_APP_SECRET) {
        return res.status(400).json({ success: false, message: 'Facebook sign-up is not configured.' });
      }
      const debug = await axios.get('https://graph.facebook.com/debug_token', {
        params: { input_token: accessToken, access_token: `${FACEBOOK_APP_ID}|${FACEBOOK_APP_SECRET}` }
      });
      if (!debug.data?.data?.is_valid || String(debug.data.data.app_id) !== FACEBOOK_APP_ID) {
        return res.status(401).json({ success: false, message: 'Invalid Facebook account.' });
      }
      const { data = {} } = await axios.get('https://graph.facebook.com/me', {
        params: { fields: 'id,email,first_name,last_name', access_token: accessToken }
      });
      if (!data.id || !data.email) {
        return res.status(400).json({ success: false, message: 'Facebook did not provide an email address. Use the standard visitor form instead.' });
      }
      profile = {
        provider,
        socialId: data.id,
        email: data.email,
        fullName: `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.email,
      };
    } else {
      return res.status(400).json({ success: false, message: 'Choose Google or Facebook.' });
    }

    const signupToken = jwt.sign(
      { purpose, ...profile },
      getJwtSecret(),
      { expiresIn: '10m' },
    );
    return res.json({ success: true, profile, signupToken });
  } catch (error) {
    console.error('Social sign-up profile error:', error);
    return res.status(401).json({ success: false, message: 'Unable to verify that social account.' });
  }
};

const linkSocialAccount = async (req, res) => {
  try {
    const proof = jwt.verify(String(req.body?.signupToken || ''), getJwtSecret());
    if (
      proof?.purpose !== 'account_link' ||
      !['google', 'facebook'].includes(proof.provider) ||
      !proof.socialId
    ) {
      return res.status(401).json({ success: false, message: 'Invalid social account verification.' });
    }

    const field = proof.provider === 'google' ? 'googleId' : 'facebookId';
    const owner = await User.findOne({ [field]: proof.socialId });
    if (owner && String(owner._id) !== String(req.user._id)) {
      return res.status(409).json({
        success: false,
        message: `This ${proof.provider === 'google' ? 'Google' : 'Facebook'} account is already connected to another SafePass account.`,
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'SafePass account not found.' });
    user[field] = proof.socialId;
    await user.save();

    const userObject = user.toObject();
    delete userObject.password;
    return res.json({ success: true, message: `${proof.provider === 'google' ? 'Google' : 'Facebook'} account connected.`, user: userObject });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Social account verification expired. Please try again.' });
  }
};

/**
 * Handle Apple login
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const appleLogin = async (req, res) => {
  try {
    const { identityToken, userData } = req.body;

    if (!identityToken) {
      return res.status(400).json({
        success: false,
        message: 'Apple identity token is required'
      });
    }

    if (!APPLE_CLIENT_ID) {
      return res.status(503).json({
        success: false,
        message: 'Apple sign-in is not configured on the server'
      });
    }

    // Verify the identity token with Apple's public keys
    let appleUserData;
    try {
      appleUserData = await verifyAppleIdentityToken(identityToken);
    } catch (verifyError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Apple identity token'
      });
    }

    // Extract user data from verified token
    const verifiedAppleData = {
      sub: appleUserData.sub,
      email: appleUserData.email,
      email_verified: appleUserData.email_verified || false,
      // Note: Apple doesn't always provide first/last name in the token
      // For now, we'll rely on userData from the client for name information
      // In a more complete implementation, you might need to handle this differently
    };

    // Check if user already exists with this Apple ID
    let user = await User.findOne({ appleId: verifiedAppleData.sub });

    if (!user) {
      // Check if user exists with the same email (for account linking)
      user = await User.findOne({ email: verifiedAppleData.email });

      if (user) {
        // Link Apple account to existing user
        user.appleId = verifiedAppleData.sub;
        // Update name if provided in userData and not already set
        if (userData?.firstName && (!user.firstName || user.firstName === '')) user.firstName = userData.firstName;
        if (userData?.lastName && (!user.lastName || user.lastName === '')) user.lastName = userData.lastName;
        // Mark as verified if the email is verified by Apple
        if (verifiedAppleData.email_verified) {
          user.isVerified = true;
          user.verifiedAt = new Date();
        }
      } else {
        // Create new user from Apple data
        user = new User({
          email: verifiedAppleData.email,
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || '',
          appleId: verifiedAppleData.sub,
          role: 'visitor', // Default role, can be adjusted based on business logic
          password: crypto.randomBytes(16).toString('hex'), // Random password for social login users
          isVerified: verifiedAppleData.email_verified, // Set based on Apple's email verification
          verifiedAt: verifiedAppleData.email_verified ? new Date() : null,
          status: 'active',
          isActive: true
        });
      }

      await user.save();
    }

    // Generate JWT token
    const token = generateToken(user);

    // Remove password from user object before sending response
    const userObject = user.toObject();
    delete userObject.password;

    res.status(200).json({
      success: true,
      message: 'Apple login successful',
      token,
      user: userObject
    });
  } catch (error) {
    console.error('Apple login error:', error);
    res.status(500).json({
      success: false,
      message: 'Apple login failed'
    });
  }
};

module.exports = {
  facebookLogin,
  googleLogin,
  getSocialSignupProfile,
  linkSocialAccount,
  appleLogin
};
