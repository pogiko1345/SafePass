const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const User = require('../models/User');
const { 
  notifyAdminNewVisitor, 
  notifySecurityCheckIn 
} = require('../controllers/notificationController');

// Register new visitor
router.post('/register', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      idNumber,
      idImage,
      purposeOfVisit,
      vehicleNumber,
      visitDate,
      visitTime,
      privacyAccepted
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // Create visitor record
    const visitor = new Visitor({
      fullName,
      email,
      phoneNumber,
      idNumber,
      idImage,
      purposeOfVisit,
      vehicleNumber,
      visitDate: new Date(visitDate),
      visitTime: new Date(visitTime),
      approvalStatus: 'pending',
      status: 'pending',
      registeredAt: new Date()
    });

    await visitor.save();

    // Generate temporary password
    const tempPassword = `VIS${Math.random().toString(36).slice(-8).toUpperCase()}`;

    // Create user account
    const user = new User({
      firstName: fullName.split(' ')[0],
      lastName: fullName.split(' ').slice(1).join(' ') || 'Visitor',
      email,
      password: tempPassword,
      phone: phoneNumber,
      role: 'visitor',
      status: 'pending',
      visitorId: visitor._id,
      isActive: false // Account inactive until approved
    });

    await user.save();

    // Store temporary password in visitor record
    visitor.temporaryPassword = tempPassword;
    await visitor.save();

    // Notify admin about new registration
    await notifyAdminNewVisitor({
      ...visitor.toObject(),
      visitorId: visitor._id
    });

    res.status(201).json({
      success: true,
      message: 'Visitor registration submitted successfully',
      visitor: {
        _id: visitor._id,
        fullName: visitor.fullName,
        email: visitor.email,
        status: 'pending'
      },
      credentials: {
        email: user.email,
        password: tempPassword
      }
    });
  } catch (error) {
    console.error('Visitor registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed', 
      error: error.message 
    });
  }
});

// Admin: Get pending visitors
router.get('/pending', async (req, res) => {
  try {
    const pendingVisitors = await Visitor.find({ 
      approvalStatus: 'pending' 
    }).sort({ registeredAt: -1 });
    
    res.json({
      success: true,
      visitors: pendingVisitors
    });
  } catch (error) {
    console.error('Get pending visitors error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pending visitors' 
    });
  }
});

// Admin: Approve visitor
router.put('/:visitorId/approve', async (req, res) => {
  try {
    const { visitorId } = req.params;
    const { adminNotes } = req.body;
    const adminId = req.user?.id; // Should come from auth middleware

    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Visitor not found' 
      });
    }

    // Update visitor
    visitor.approvalStatus = 'approved';
    visitor.status = 'approved';
    visitor.approvedBy = adminId;
    visitor.approvedAt = new Date();
    visitor.adminNotes = adminNotes;
    await visitor.save();

    // Update user account
    const user = await User.findOne({ visitorId });
    if (user) {
      user.status = 'active';
      user.isActive = true;
      await user.save();
    }

    // Notify security about upcoming visit
    await notifySecurityCheckIn(visitor);

    res.json({
      success: true,
      message: 'Visitor approved successfully',
      visitor
    });
  } catch (error) {
    console.error('Approve visitor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to approve visitor' 
    });
  }
});

// Admin: Reject visitor
router.put('/:visitorId/reject', async (req, res) => {
  try {
    const { visitorId } = req.params;
    const { reason } = req.body;

    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Visitor not found' 
      });
    }

    // Update visitor
    visitor.approvalStatus = 'rejected';
    visitor.status = 'rejected';
    visitor.rejectionReason = reason;
    await visitor.save();

    // Delete or deactivate user account
    const user = await User.findOne({ visitorId });
    if (user) {
      user.isActive = false;
      user.status = 'suspended';
      await user.save();
    }

    res.json({
      success: true,
      message: 'Visitor rejected',
      visitor
    });
  } catch (error) {
    console.error('Reject visitor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reject visitor' 
    });
  }
});

// Get visitor profile (for logged-in visitor)
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    
    if (!user || user.role !== 'visitor') {
      return res.status(404).json({ 
        success: false, 
        message: 'Visitor profile not found' 
      });
    }

    const visitor = await Visitor.findById(user.visitorId);
    if (!visitor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Visitor record not found' 
      });
    }

    res.json({
      success: true,
      visitor
    });
  } catch (error) {
    console.error('Get visitor profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile' 
    });
  }
});

// Visitor self check-in
router.put('/:visitorId/self-checkin', async (req, res) => {
  try {
    const { visitorId } = req.params;
    
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Visitor not found' 
      });
    }

    if (!visitor.hasApprovedVisitWindow()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Visitor does not have an approved visit window yet' 
      });
    }

    visitor.markCheckedIn(req.user?.id || null);
    await visitor.save();

    res.json({
      success: true,
      message: 'Checked in successfully',
      visitor
    });
  } catch (error) {
    console.error('Self check-in error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check in' 
    });
  }
});

// Visitor self check-out
router.put('/:visitorId/self-checkout', async (req, res) => {
  try {
    const { visitorId } = req.params;
    
    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Visitor not found' 
      });
    }

    visitor.markCheckedOut(req.user?.id || null);
    await visitor.save();

    res.json({
      success: true,
      message: 'Checked out successfully',
      visitor
    });
  } catch (error) {
    console.error('Self check-out error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check out' 
    });
  }
});

module.exports = router;
