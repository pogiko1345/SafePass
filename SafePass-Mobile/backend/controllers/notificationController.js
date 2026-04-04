const Notification = require('../models/Notification');
const User = require('../models/User');

// Create a new notification
const createNotification = async (notificationData) => {
  try {
    const notification = new Notification({
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      severity: notificationData.severity || 'low',
      targetRole: notificationData.targetRole || 'all',
      targetUser: notificationData.targetUser,
      relatedVisitor: notificationData.relatedVisitor,
      relatedUser: notificationData.relatedUser,
      expiresAt: notificationData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    
    await notification.save();
    return { success: true, notification };
  } catch (error) {
    console.error('Create notification error:', error);
    return { success: false, error: error.message };
  }
};

// Send admin notification for new visitor registration
const notifyAdminNewVisitor = async (visitorData) => {
  try {
    // Find all admin users
    const admins = await User.find({ role: 'admin', isActive: true });
    
    const notifications = [];
    for (const admin of admins) {
      const notification = await createNotification({
        title: 'New Visitor Registration',
        message: `${visitorData.fullName} has registered for a visit on ${new Date(visitorData.visitDate).toLocaleDateString()}. Please review and approve.`,
        type: 'visitor',
        severity: 'medium',
        targetRole: 'admin',
        targetUser: admin._id,
        relatedVisitor: visitorData.visitorId
      });
      notifications.push(notification);
    }
    
    return { success: true, notifications };
  } catch (error) {
    console.error('Notify admin error:', error);
    return { success: false, error: error.message };
  }
};

// Send security notification for approved visitor
const notifySecurityCheckIn = async (visitorData) => {
  try {
    // Find all security users
    const securityStaff = await User.find({ role: 'security', isActive: true });
    
    const notifications = [];
    for (const security of securityStaff) {
      const notification = await createNotification({
        title: 'Visitor Scheduled to Arrive',
        message: `${visitorData.fullName} is scheduled to arrive on ${new Date(visitorData.visitDate).toLocaleDateString()} at ${new Date(visitorData.visitTime).toLocaleTimeString()}. Purpose: ${visitorData.purposeOfVisit}`,
        type: 'visitor',
        severity: 'medium',
        targetRole: 'security',
        targetUser: security._id,
        relatedVisitor: visitorData.visitorId
      });
      notifications.push(notification);
    }
    
    return { success: true, notifications };
  } catch (error) {
    console.error('Notify security error:', error);
    return { success: false, error: error.message };
  }
};

// Send visitor approval notification
const notifyVisitorApproval = async (visitorData) => {
  try {
    const notification = await createNotification({
      title: 'Visit Approved!',
      message: `Your visit to Sapphire Aviation School on ${new Date(visitorData.visitDate).toLocaleDateString()} has been approved. You can now log in with your credentials.`,
      type: 'success',
      severity: 'low',
      targetUser: visitorData.userId,
      relatedVisitor: visitorData.visitorId
    });
    
    return { success: true, notification };
  } catch (error) {
    console.error('Notify visitor error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createNotification,
  notifyAdminNewVisitor,
  notifySecurityCheckIn,
  notifyVisitorApproval
};