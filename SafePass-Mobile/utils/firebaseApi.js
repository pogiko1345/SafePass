// utils/firebaseApi.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { 
  auth, 
  db, 
  storage 
} from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updatePassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

class FirebaseApiService {
  constructor() {
    this.unsubscribeListeners = [];
  }

  // ================= AUTH METHODS =================

  async register(userData) {
    try {
      console.log('📝 Registering user:', userData.email);
      
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        userData.email, 
        userData.password
      );
      
      const user = userCredential.user;
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        id: user.uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone || '',
        role: userData.role || 'visitor',
        status: 'active',
        isActive: true,
        employeeId: userData.employeeId || '',
        department: userData.department || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Store user in AsyncStorage
      await AsyncStorage.setItem('currentUser', JSON.stringify({
        id: user.uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'visitor'
      }));
      
      return {
        success: true,
        user: {
          id: user.uid,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role || 'visitor'
        },
        token: await user.getIdToken()
      };
    } catch (error) {
      console.error('❌ Register error:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user profile from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      const userProfile = {
        id: user.uid,
        email: user.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        role: userData.role || 'visitor',
        phone: userData.phone || '',
        status: userData.status || 'active',
        ...userData
      };
      
      await AsyncStorage.setItem('currentUser', JSON.stringify(userProfile));
      
      return {
        success: true,
        user: userProfile,
        token: await user.getIdToken()
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    await signOut(auth);
    await this.clearAuth();
    return { success: true };
  }

  async clearAuth() {
    await AsyncStorage.multiRemove(['userToken', 'currentUser']);
  }

  async getCurrentUser() {
    const json = await AsyncStorage.getItem('currentUser');
    return json ? JSON.parse(json) : null;
  }

  async changePassword(passwordData) {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    
    await updatePassword(user, passwordData.newPassword);
    return { success: true };
  }

  async requestPasswordReset(email) {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: 'Password reset email sent' };
  }

  // ================= VISITOR METHODS =================

  async registerVisitor(visitorData) {
    try {
      const currentUser = await this.getCurrentUser();
      
      const visitorRef = await addDoc(collection(db, 'visitors'), {
        fullName: visitorData.fullName,
        phoneNumber: visitorData.phoneNumber,
        email: visitorData.email,
        idNumber: visitorData.idNumber || '',
        purposeOfVisit: visitorData.purposeOfVisit,
        host: visitorData.host,
        assignedOffice: visitorData.assignedOffice || '',
        vehicleNumber: visitorData.vehicleNumber || '',
        status: 'pending',
        approvalStatus: 'pending',
        visitDate: visitorData.visitDate,
        visitTime: visitorData.visitTime,
        registeredBy: currentUser?.id || null,
        registeredByName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : null,
        registeredAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Handle ID photo upload if present
      let idImageUrl = null;
      if (visitorData.idImageBase64) {
        idImageUrl = await this.uploadIdImage(visitorRef.id, visitorData.idImageBase64);
        await updateDoc(doc(db, 'visitors', visitorRef.id), {
          idImage: idImageUrl
        });
      }
      
      return {
        success: true,
        visitor: {
          id: visitorRef.id,
          ...visitorData,
          idImage: idImageUrl
        }
      };
    } catch (error) {
      console.error('Register visitor error:', error);
      throw error;
    }
  }

  async uploadIdImage(visitorId, base64Image) {
    try {
      const imageRef = ref(storage, `visitor_ids/${visitorId}.jpg`);
      const blob = await this.base64ToBlob(base64Image);
      await uploadBytes(imageRef, blob);
      const url = await getDownloadURL(imageRef);
      return url;
    } catch (error) {
      console.error('Upload image error:', error);
      return null;
    }
  }

  base64ToBlob(base64) {
    return new Promise((resolve, reject) => {
      try {
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        resolve(new Blob([byteArray], { type: 'image/jpeg' }));
      } catch (error) {
        reject(error);
      }
    });
  }

  async getAllVisitors(filters = {}) {
    try {
      let q = collection(db, 'visitors');
      const constraints = [];
      
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      if (filters.approvalStatus) {
        constraints.push(where('approvalStatus', '==', filters.approvalStatus));
      }
      
      constraints.push(orderBy('createdAt', 'desc'));
      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }
      
      q = query(q, ...constraints);
      const snapshot = await getDocs(q);
      
      const visitors = [];
      snapshot.forEach(doc => {
        visitors.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, visitors };
    } catch (error) {
      console.error('Get visitors error:', error);
      throw error;
    }
  }

  async approveVisitor(visitorId, adminNotes = '') {
    try {
      const currentUser = await this.getCurrentUser();
      
      await updateDoc(doc(db, 'visitors', visitorId), {
        status: 'approved',
        approvalStatus: 'approved',
        approvalNotes: adminNotes,
        approvedAt: serverTimestamp(),
        approvedBy: currentUser?.id,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Approve visitor error:', error);
      throw error;
    }
  }

  async rejectVisitor(visitorId, reason) {
    try {
      await updateDoc(doc(db, 'visitors', visitorId), {
        status: 'rejected',
        approvalStatus: 'rejected',
        rejectionReason: reason,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Reject visitor error:', error);
      throw error;
    }
  }

  async visitorCheckIn(visitorId) {
    try {
      await updateDoc(doc(db, 'visitors', visitorId), {
        status: 'checked_in',
        checkedInAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Create access log
      await this.createAccessLog({
        visitorId,
        location: 'Main Gate',
        status: 'granted',
        accessType: 'nfc'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Check-in error:', error);
      throw error;
    }
  }

  async visitorCheckOut(visitorId) {
    try {
      await updateDoc(doc(db, 'visitors', visitorId), {
        status: 'checked_out',
        checkedOutAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      await this.createAccessLog({
        visitorId,
        location: 'Main Gate',
        status: 'granted',
        accessType: 'nfc'
      });
      
      return { success: true };
    } catch (error) {
      console.error('Check-out error:', error);
      throw error;
    }
  }

  async getVisitorProfile() {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error('Not logged in');
    
    const q = query(
      collection(db, 'visitors'),
      where('email', '==', currentUser.email),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return { success: true, visitor: null };
    }
    
    let visitor = null;
    snapshot.forEach(doc => {
      visitor = { id: doc.id, ...doc.data() };
    });
    
    return { success: true, visitor };
  }

  async getVisitorAccessLogs(visitorId) {
    const q = query(
      collection(db, 'accessLogs'),
      where('visitorId', '==', visitorId),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const logs = [];
    snapshot.forEach(doc => {
      logs.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, logs };
  }

  // ================= ACCESS LOGS =================

  async createAccessLog(logData) {
    try {
      await addDoc(collection(db, 'accessLogs'), {
        visitorId: logData.visitorId,
        location: logData.location,
        gateId: logData.gateId || null,
        status: logData.status || 'granted',
        accessType: logData.accessType || 'manual',
        userName: logData.userName || null,
        timestamp: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Create access log error:', error);
      throw error;
    }
  }

  async getAccessLogs(page = 1, limit = 50) {
    try {
      const q = query(
        collection(db, 'accessLogs'),
        orderBy('timestamp', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(q);
      const logs = [];
      snapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, accessLogs: logs };
    } catch (error) {
      console.error('Get access logs error:', error);
      throw error;
    }
  }

  // ================= USER MANAGEMENT =================

  async getAllUsers(filters = {}) {
    try {
      let q = collection(db, 'users');
      const constraints = [];
      
      if (filters.role) {
        constraints.push(where('role', '==', filters.role));
      }
      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }
      
      constraints.push(orderBy('createdAt', 'desc'));
      
      q = query(q, ...constraints);
      const snapshot = await getDocs(q);
      
      const users = [];
      snapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, users };
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role,
        department: userData.department,
        employeeId: userData.employeeId,
        shift: userData.shift,
        position: userData.position,
        status: userData.status,
        isActive: userData.isActive,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      await deleteDoc(doc(db, 'users', userId));
      return { success: true };
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  }

  // ================= NOTIFICATIONS =================

  async getNotifications(filters = {}) {
    try {
      const q = query(
        collection(db, 'notifications'),
        orderBy('createdAt', 'desc'),
        limit(filters.limit || 50)
      );
      
      const snapshot = await getDocs(q);
      const notifications = [];
      snapshot.forEach(doc => {
        notifications.push({ id: doc.id, ...doc.data() });
      });
      
      const unreadCount = notifications.filter(n => !n.read).length;
      
      return { success: true, notifications, unreadCount };
    } catch (error) {
      console.error('Get notifications error:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
      return { success: true };
    } catch (error) {
      console.error('Mark notification error:', error);
      throw error;
    }
  }

  async markAllNotificationsAsRead() {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('read', '==', false)
      );
      
      const snapshot = await getDocs(q);
      const batch = [];
      snapshot.forEach(doc => {
        batch.push(updateDoc(doc.ref, { read: true }));
      });
      
      await Promise.all(batch);
      return { success: true };
    } catch (error) {
      console.error('Mark all notifications error:', error);
      throw error;
    }
  }

  // ================= SYSTEM SETTINGS =================

  async getSystemSettings() {
    try {
      const docRef = doc(db, 'settings', 'system');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { success: true, ...docSnap.data() };
      }
      
      // Default settings
      const defaultSettings = {
        emailNotifications: true,
        smsAlerts: true,
        autoApprove: false,
        maintenanceMode: false,
        sessionTimeout: '30',
        maxLoginAttempts: '5',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h'
      };
      
      await setDoc(docRef, defaultSettings);
      return { success: true, ...defaultSettings };
    } catch (error) {
      console.error('Get system settings error:', error);
      throw error;
    }
  }

  async updateSystemSettings(settings) {
    try {
      await updateDoc(doc(db, 'settings', 'system'), {
        ...settings,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Update system settings error:', error);
      throw error;
    }
  }

  // ================= REAL-TIME SUBSCRIPTIONS =================

  subscribeToVisitors(callback) {
    const q = query(collection(db, 'visitors'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const visitors = [];
      snapshot.forEach(doc => {
        visitors.push({ id: doc.id, ...doc.data() });
      });
      callback(visitors);
    });
    this.unsubscribeListeners.push(unsubscribe);
    return unsubscribe;
  }

  subscribeToVisitor(visitorId, callback) {
    const unsubscribe = onSnapshot(doc(db, 'visitors', visitorId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      }
    });
    this.unsubscribeListeners.push(unsubscribe);
    return unsubscribe;
  }

  subscribeToAccessLogs(callback) {
    const q = query(collection(db, 'accessLogs'), orderBy('timestamp', 'desc'), limit(50));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = [];
      snapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      callback(logs);
    });
    this.unsubscribeListeners.push(unsubscribe);
    return unsubscribe;
  }

  subscribeToNotifications(userId, callback) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = [];
      snapshot.forEach(doc => {
        notifications.push({ id: doc.id, ...doc.data() });
      });
      callback(notifications);
    });
    this.unsubscribeListeners.push(unsubscribe);
    return unsubscribe;
  }

  // Clean up all subscriptions
  cleanupSubscriptions() {
    this.unsubscribeListeners.forEach(unsubscribe => {
      if (unsubscribe) unsubscribe();
    });
    this.unsubscribeListeners = [];
  }

  // ================= ADMIN / SECURITY METHODS =================

  async getAdminStats() {
    try {
      const [usersSnapshot, visitorsSnapshot, activeVisitorsSnapshot, pendingSnapshot] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'visitors')),
        getDocs(query(collection(db, 'visitors'), where('status', '==', 'checked_in'))),
        getDocs(query(collection(db, 'visitors'), where('approvalStatus', '==', 'pending')))
      ]);
      
      return {
        success: true,
        stats: {
          totalUsers: usersSnapshot.size,
          totalVisitors: visitorsSnapshot.size,
          activeVisitors: activeVisitorsSnapshot.size,
          pendingApproval: pendingSnapshot.size
        }
      };
    } catch (error) {
      console.error('Get admin stats error:', error);
      throw error;
    }
  }

  async getSecurityLogs(filters = {}) {
    try {
      let q = collection(db, 'securityLogs');
      const constraints = [orderBy('createdAt', 'desc')];
      
      if (filters.type) constraints.push(where('eventType', '==', filters.type));
      if (filters.resolved !== undefined) constraints.push(where('resolved', '==', filters.resolved));
      if (filters.limit) constraints.push(limit(filters.limit));
      
      q = query(q, ...constraints);
      const snapshot = await getDocs(q);
      
      const logs = [];
      snapshot.forEach(doc => {
        logs.push({ id: doc.id, ...doc.data() });
      });
      
      return { success: true, logs };
    } catch (error) {
      console.error('Get security logs error:', error);
      throw error;
    }
  }

  async resolveAlert(alertId) {
    const currentUser = await this.getCurrentUser();
    await updateDoc(doc(db, 'securityLogs', alertId), {
      resolved: true,
      resolvedAt: serverTimestamp(),
      resolvedBy: currentUser?.id
    });
    return { success: true };
  }

  async reportVisitor(visitorId, reportData) {
    const currentUser = await this.getCurrentUser();
    await addDoc(collection(db, 'securityLogs'), {
      eventType: 'alert',
      severity: 'medium',
      message: `Report: ${reportData.reason}`,
      visitorId: visitorId,
      userId: currentUser?.id,
      metadata: reportData,
      resolved: false,
      createdAt: serverTimestamp()
    });
    return { success: true };
  }

  async getSecurityReports() {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    const reports = [];
    snapshot.forEach(doc => {
      reports.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, reports };
  }

  async getActiveUserCount() {
    const snapshot = await getDocs(query(collection(db, 'visitors'), where('status', '==', 'checked_in')));
    return snapshot.size;
  }

  async getVisitorStats() {
    const snapshot = await getDocs(collection(db, 'visitors'));
    const visitors = [];
    snapshot.forEach(doc => visitors.push(doc.data()));
    
    const today = new Date().toDateString();
    const todayVisitors = visitors.filter(v => {
      const visitDate = v.visitDate ? new Date(v.visitDate).toDateString() : null;
      return visitDate === today;
    }).length;
    
    const activeNow = visitors.filter(v => v.status === 'checked_in').length;
    const pendingApproval = visitors.filter(v => v.approvalStatus === 'pending').length;
    
    return {
      success: true,
      stats: {
        totalToday: todayVisitors,
        activeNow,
        pendingApproval
      }
    };
  }

  // ================= NFC METHODS =================

  async processNfcTap(tapData) {
    try {
      // Create access log
      await this.createAccessLog({
        visitorId: tapData.visitorId,
        location: `Gate ${tapData.gateId || 'Unknown'}`,
        status: 'granted',
        accessType: 'nfc',
        userName: tapData.visitorName
      });
      
      return { success: true, action: 'access_granted' };
    } catch (error) {
      console.error('Process NFC tap error:', error);
      throw error;
    }
  }

  async sendGateCommand(gateId, command, visitorId) {
    // This would connect to your Arduino via a cloud service
    console.log(`Sending command ${command} to gate ${gateId} for visitor ${visitorId}`);
    return { success: true };
  }

  async getGateStatus(gateId) {
    return { success: true, status: 'closed' };
  }

  // ================= HELPER METHODS =================

  async getProfile() {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error('Not logged in');
    
    const userDoc = await getDoc(doc(db, 'users', currentUser.id));
    if (userDoc.exists()) {
      return { success: true, user: userDoc.data() };
    }
    return { success: true, user: currentUser };
  }

  async updateProfile(data) {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new Error('Not logged in');
    
    await updateDoc(doc(db, 'users', currentUser.id), {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      updatedAt: serverTimestamp()
    });
    
    // Update local storage
    const updatedUser = { ...currentUser, ...data };
    await AsyncStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    return { success: true, user: updatedUser };
  }

  async checkEmailExists(email) {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const snapshot = await getDocs(q);
    return snapshot.size > 0;
  }

  async testConnection() {
    try {
      await getDocs(collection(db, 'users'), limit(1));
      return true;
    } catch {
      return false;
    }
  }
}

export default new FirebaseApiService();