import { Platform } from 'react-native';
let AsyncStorage;

if (Platform.OS === 'web') {
  AsyncStorage = require('./webStorage').default;
} else {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}
import * as ImageManipulator from 'expo-image-manipulator';

const WEB_FALLBACK_API_BASE_URL = (() => {
  if (
    typeof window === "undefined" ||
    !window.location ||
    !window.location.protocol ||
    !window.location.hostname
  ) {
    return "http://localhost:5000/api";
  }

  const { protocol, hostname } = window.location;
  const isLocalHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0";

  return isLocalHost
    ? `${protocol}//${hostname}:5000/api`
    : "https://safepass-052h.onrender.com/api";
})();

const DEFAULT_API_BASE_URL = Platform.select({
  ios: "http://localhost:5000/api",            // iOS simulator
  android: "http://10.0.2.2:5000/api",         // Android emulator
  web: WEB_FALLBACK_API_BASE_URL,              // Browser on same host as backend
  default: "http://localhost:5000/api",        // Default
});

const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  DEFAULT_API_BASE_URL
).replace(/\/$/, "");

// Keep simulation/fallback OFF by default so app uses real backend/database.
const DEV_FALLBACK_ENABLED = process.env.EXPO_PUBLIC_ENABLE_DEV_FALLBACK === "true";

class ApiService {
  constructor() {
    this.token = null;
    this._lastOtp = null;
    this._lastReset = null;
  }

  // ================= TOKEN HANDLING =================

  async setToken(token) {
    const normalizedToken = typeof token === "string" ? token.trim() : "";
    const validToken =
      normalizedToken &&
      normalizedToken !== "undefined" &&
      normalizedToken !== "null"
        ? normalizedToken
        : null;

    this.token = validToken;
    if (validToken) {
      await AsyncStorage.setItem("userToken", validToken);
      // Backward compatibility for older screens still reading authToken.
      await AsyncStorage.setItem("authToken", validToken);
    } else {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("authToken");
    }
  }

  async getToken() {
    if (!this.token) {
      const userTokenRaw = await AsyncStorage.getItem("userToken");
      const userToken =
        typeof userTokenRaw === "string"
          ? userTokenRaw.trim()
          : "";

      if (userToken) {
        if (userToken === "undefined" || userToken === "null") {
          await AsyncStorage.removeItem("userToken");
          await AsyncStorage.removeItem("authToken");
          this.token = null;
        } else {
          this.token = userToken;
        }
      } else {
        // Backward compatibility: migrate legacy authToken to userToken.
        const legacyTokenRaw = await AsyncStorage.getItem("authToken");
        const legacyToken =
          typeof legacyTokenRaw === "string"
            ? legacyTokenRaw.trim()
            : "";

        if (legacyToken) {
          if (legacyToken === "undefined" || legacyToken === "null") {
            await AsyncStorage.removeItem("authToken");
            this.token = null;
          } else {
            this.token = legacyToken;
            await AsyncStorage.setItem("userToken", legacyToken);
          }
        }
      }
    }
    return this.token;
  }

  async clearAuth() {
    this.token = null;
    await AsyncStorage.multiRemove([
      "userToken",
      "authToken",
      "currentUser",
      "trustedDevice",
      "isNewRegistration"
    ]);
  }

  isDevFallbackEnabled() {
    return DEV_FALLBACK_ENABLED;
  }

  // ================= NFC METHODS =================
  async processNfcTap(tapData) {
    try {
      const visitorId = tapData?.visitorId;
      if (!visitorId) {
        return { success: false, message: "Missing visitor ID" };
      }

      const visitorRes = await this.getVisitorById(visitorId);
      const visitor = visitorRes?.visitor;
      if (!visitor) {
        return { success: false, message: "Visitor record not found" };
      }

      if (visitor.status === "checked_in") {
        const response = await this.fetch(`/visitors/${visitorId}/self-checkout`, {
          method: "PUT",
        });
        return { ...response, action: "check_out" };
      }

      if (visitor.status === "checked_out") {
        return { success: false, message: "Visit already completed" };
      }

      if (visitor.status !== "approved" && visitor.approvalStatus !== "approved") {
        return { success: false, message: "Visit request is not approved yet" };
      }

      const response = await this.fetch(`/visitors/${visitorId}/self-checkin`, {
        method: "PUT",
      });
      return { ...response, action: "check_in" };
    } catch (error) {
      console.error("Process NFC tap error:", error);
      throw error;
    }
  }

  async sendGateCommand(gateId, command, visitorId) {
    // Gate controller endpoint is not available yet; keep API shape stable.
    return {
      success: true,
      simulated: true,
      gateId,
      command,
      visitorId,
      timestamp: new Date().toISOString(),
    };
  }

  async getGateStatus(gateId) {
    return {
      success: true,
      simulated: true,
      gateId,
      status: "online",
    };
  }

  // ================= GENERIC FETCH =================
async fetch(url, options = {}) {
  const token = await this.getToken();
  console.log(`🌐 FETCH: ${url}, Method: ${options.method || 'GET'}, Has Token: ${!!token}`);

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body !== "string") {
    config.body = JSON.stringify(config.body);
  }

  try {
    console.log(`📤 Sending request to: ${API_BASE_URL}${url}`);
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    console.log(`📥 Response status: ${response.status}`);

    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
      console.log(`📦 Response data:`, data);
    } else {
      const text = await response.text();
      data = text ? { message: text } : {};
      console.log(`📦 Response text:`, text);
    }

    if (!response.ok) {
      console.log(`❌ HTTP ${response.status}:`, data);
      const apiError = new Error(data.error || data.message || `HTTP ${response.status}`);
      apiError.status = response.status;
      apiError.data = data;
      throw apiError;
    }

    return data;
  } catch (error) {
    console.error(`❌ FETCH ERROR for ${url}:`, error);
    if (error.message.includes("Network request failed")) {
      throw new Error(
        "Cannot connect to backend. Make sure server is running on port 5000."
      );
    }
    throw error;
  }
}

  // ================= AUTH =================

async register(userData) {
  try {
    console.log('📝 Registering user:', userData);
    const response = await this.fetch("/register", {
      method: "POST",
      body: userData,
    });
    console.log('📥 Register response:', response);
    return response;
  } catch (error) {
    console.error('❌ Register error:', error);
    throw error;
  }
}

  async createStaffUser(staffData) {
    try {
      const payload = {
        ...staffData,
        role: "staff",
        status: staffData?.status || "active",
        isActive: staffData?.isActive ?? true,
      };
      return await this.fetch("/admin/staff/create", {
        method: "POST",
        body: payload,
      });
    } catch (error) {
      const errorMessage = String(error?.message || "").toLowerCase();
      const message = errorMessage.includes("username already")
        ? "Username already registered. Please use another username."
        : errorMessage.includes("staff id already") || errorMessage.includes("employeeid")
          ? "Staff ID already registered. Please use another staff ID."
          : errorMessage.includes("email already")
            ? "Email already registered. Please use another email address."
            : error?.message || "Failed to create staff account";
      throw new Error(message);
    }
  }

  async login(email, password) {
    try {
      const response = await this.fetch("/login", {
        method: "POST",
        body: { email, password },
      });

      if (response.token) {
        await this.setToken(response.token);
        await AsyncStorage.setItem("currentUser", JSON.stringify(response.user));
      }
      return response;
    } catch (error) {
      console.error("Login API error:", error);
      
      if (error?.data?.requiresEmailVerification || error?.status === 403) {
        throw new Error(
          error?.data?.message ||
            "Your account is not yet verified. Please verify your email first."
        );
      }

      if (error.message.includes("401")) {
        throw new Error("Invalid email or password. Please check your credentials.");
      }
      throw error;
    }
  }

  async logout() {
    try {
      await this.fetch("/logout", { method: "POST" });
    } catch (e) {
      // Ignore logout errors
    }
    await this.clearAuth();
  }

  async checkEmailExists(email) {
    try {
      const response = await this.fetch("/check-email", {
        method: "POST",
        body: { email },
      });
      return response.exists;
    } catch {
      return false;
    }
  }

  // ================= USER =================

  async getProfile() {
    try {
      const response = await this.fetch("/profile");
      
      if (response && response.user) {
        await AsyncStorage.setItem("currentUser", JSON.stringify(response.user));
        return response;
      }
      return response;
    } catch (error) {
      console.log("Profile fetch failed:", error.message);
      
      if (error.message.includes("401") || error.message.includes("authenticate")) {
        const cachedUser = await this.getCurrentUser();
        if (cachedUser) {
          console.log("Using cached user data as fallback");
          return { 
            user: cachedUser,
            fromCache: true,
            message: "Using cached profile data"
          };
        }
      }
      throw error;
    }
  }

  async updateProfile(data) {
    const response = await this.fetch("/profile", {
      method: "PUT",
      body: data,
    });

    if (response.user) {
      await AsyncStorage.setItem("currentUser", JSON.stringify(response.user));
    }
    return response;
  }

  async getCurrentUser() {
    const json = await AsyncStorage.getItem("currentUser");
    return json ? JSON.parse(json) : null;
  }

  // ================= 2FA / OTP METHODS =================
async verifyCredentials(email, password) {
  try {
    const loginResponse = await this.fetch("/login", {
      method: "POST",
      body: { email, password },
    });
    
    const trustedDevice = await AsyncStorage.getItem('trustedDevice');
    
    // Check if user is pending
    if (loginResponse.user?.status === 'pending') {
      return {
        success: true,
        requires2FA: false,
        user: loginResponse.user,
        tempToken: loginResponse.token,
        status: 'pending'
      };
    }
    
    return {
      success: true,
      requires2FA: !trustedDevice,
      user: loginResponse.user,
      tempToken: loginResponse.token,
    };
    
  } catch (error) {
    console.error("Verify credentials error:", error);

    if (!this.isDevFallbackEnabled()) {
      throw new Error(
        error?.data?.message ||
          error.message ||
          "Invalid email or password"
      );
    }

    // Demo accounts (development fallback if backend not running)
    const demoAccounts = {
      'admin@test.com': { password: 'admin123', role: 'admin', status: 'active' },
      'security@test.com': { password: 'security123', role: 'security', status: 'active' },
      'visitor@test.com': { password: 'visitor123', role: 'visitor', status: 'active' },
      'pending@test.com': { password: 'pending123', role: 'visitor', status: 'pending' }
    };
    
    const demoMatch = demoAccounts[email];
    if (demoMatch && password === demoMatch.password) {
      return {
        success: true,
        requires2FA: false,
        user: { 
          email, 
          role: demoMatch.role, 
          status: demoMatch.status,
          firstName: demoMatch.role.charAt(0).toUpperCase() + demoMatch.role.slice(1),
          lastName: 'Demo'
        },
        tempToken: "demo_token_" + Math.random().toString(36).substring(2),
      };
    }
    
    throw new Error(error.message || "Invalid email or password");
  }
}

  async requestOtp(phoneNumber, method = 'sms') {
    try {
      const response = await this.fetch("/auth/request-otp", {
        method: "POST",
        body: { phoneNumber, method },
      });
      return response;
    } catch (error) {
      console.log("⚠️ OTP request API not ready - using simulation");
      
      if (!this.isDevFallbackEnabled()) {
        throw error;
      }

      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      this._lastOtp = {
        code: mockOtp,
        phoneNumber,
        timestamp: Date.now(),
        method,
        expiresAt: Date.now() + 60000
      };
      
      console.log(`📱 [SIMULATION] OTP for ${phoneNumber}: ${mockOtp}`);
      
      if (__DEV__) {
        setTimeout(() => {
          alert(`🔐 Your OTP code is: ${mockOtp}`);
        }, 500);
      }
      
      return {
        success: true,
        tempToken: "otp_" + Math.random().toString(36).substring(2),
        expiresIn: 60,
        method
      };
    }
  }

  async verifyOtp(phoneNumber, otpCode, tempToken) {
    try {
      const response = await this.fetch("/auth/verify-otp", {
        method: "POST",
        body: { phoneNumber, otpCode, tempToken },
      });
      return response;
    } catch (error) {
      console.log("⚠️ OTP verify API not ready - using simulation");
      
      if (!this.isDevFallbackEnabled()) {
        throw error;
      }

      const isValid = this._lastOtp && 
                     this._lastOtp.phoneNumber === phoneNumber &&
                     this._lastOtp.expiresAt > Date.now() &&
                     (otpCode === this._lastOtp.code || 
                      otpCode === "123456" || 
                      otpCode === "000000");   
      
      if (isValid) {
        this._lastOtp = null;
        return {
          success: true,
          verified: true,
          message: "OTP verified successfully",
        };
      } else {
        return {
          success: false,
          verified: false,
          message: this._lastOtp?.expiresAt < Date.now() 
            ? "OTP code has expired" 
            : "Invalid OTP code",
        };
      }
    }
  }

  async enable2FA(phoneNumber) {
    try {
      const response = await this.fetch("/auth/enable-2fa", {
        method: "POST",
        body: { phoneNumber },
      });
      return response;
    } catch (error) {
      console.log("⚠️ Enable 2FA API not ready - using simulation");
      if (!this.isDevFallbackEnabled()) {
        throw error;
      }

      return {
        success: true,
        message: "2FA enabled successfully",
      };
    }
  }

  async disable2FA() {
    try {
      const response = await this.fetch("/auth/disable-2fa", {
        method: "POST",
      });
      return response;
    } catch (error) {
      console.log("⚠️ Disable 2FA API not ready - using simulation");
      if (!this.isDevFallbackEnabled()) {
        throw error;
      }

      return {
        success: true,
        message: "2FA disabled successfully",
      };
    }
  }

  async trustDevice() {
    try {
      await AsyncStorage.setItem('trustedDevice', 'true');
      await AsyncStorage.setItem('trustedUntil', Date.now() + 2592000000);
      return { success: true };
    } catch (error) {
      console.error("Trust device error:", error);
      return { success: false };
    }
  }

  // ================= ACCESS LOG =================

  async getAccessLogs(page = 1, limit = 50) {
    return await this.fetch(`/access-logs?page=${page}&limit=${limit}`);
  }

  async createAccessLog(data) {
    return await this.fetch("/access-log", {
      method: "POST",
      body: data,
    });
  }

  async simulateNfcScan(location, accessType = "entry") {
    return await this.fetch("/nfc-scan", {
      method: "POST",
      body: { location, accessType },
    });
  }

  async getStats() {
    return await this.fetch("/stats");
  }

  // ================= PASSWORD RESET METHODS =================

  async requestPasswordReset(email) {
    try {
      const response = await this.fetch("/auth/request-password-reset", {
        method: "POST",
        body: { email },
      });
      return response;
    } catch (error) {
      console.log("⚠️ Password reset API not ready - using simulation");
      
      if (!this.isDevFallbackEnabled()) {
        throw error;
      }

      const resetToken = "reset_" + Math.random().toString(36).substring(2);
      
      this._lastReset = {
        email,
        token: resetToken,
        otp: "123456",
        expiresAt: Date.now() + 600000
      };
      
      console.log(`📧 [SIMULATION] Password reset OTP for ${email}: 123456`);
      
      if (__DEV__) {
        setTimeout(() => {
          alert(`🔐 Password reset OTP: 123456`);
        }, 500);
      }
      
      return {
        success: true,
        resetToken,
        expiresIn: 600
      };
    }
  }

  async verifyPasswordResetOtp(email, otpCode, resetToken) {
    try {
      const response = await this.fetch("/auth/verify-password-reset", {
        method: "POST",
        body: { email, otpCode, resetToken },
      });
      return response;
    } catch (error) {
      console.log("⚠️ Password reset verify API not ready - using simulation");
      
      if (!this.isDevFallbackEnabled()) {
        throw error;
      }

      const isValid = this._lastReset?.email === email && 
                      this._lastReset?.token === resetToken &&
                      this._lastReset?.expiresAt > Date.now() &&
                      (otpCode === this._lastReset?.otp || otpCode === "123456");
      
      if (isValid) {
        return {
          success: true,
          verified: true,
          message: "OTP verified successfully"
        };
      } else {
        return {
          success: false,
          verified: false,
          message: this._lastReset?.expiresAt < Date.now() 
            ? "Reset code has expired" 
            : "Invalid verification code"
        };
      }
    }
  }

  async resetPassword(email, newPassword, resetToken) {
    try {
      const response = await this.fetch("/auth/reset-password", {
        method: "POST",
        body: { email, newPassword, resetToken },
      });
      return response;
    } catch (error) {
      console.log("⚠️ Password reset API not ready - using simulation");
      if (!this.isDevFallbackEnabled()) {
        throw error;
      }

      return {
        success: true,
        message: "Password reset successfully"
      };
    }
  }
  
  // ================= VISITOR METHODS =================

  async registerVisitor(visitorData) {
    try {
      const response = await this.fetch("/visitors/register", {
        method: "POST",
        body: visitorData,
      });
      
      if (response.success && response.visitor) {
        // Store visitor info for later use
        await AsyncStorage.setItem("lastVisitor", JSON.stringify(response.visitor));
        if (response.credentials) {
          await AsyncStorage.setItem("visitorCredentials", JSON.stringify(response.credentials));
        }
      }
      
      return response;
    } catch (error) {
      console.error("Visitor registration error:", error);
      throw error;
    }
  }

  async getVisitorProfile() {
    try {
      const response = await this.fetch("/visitor-profile");
      return response;
    } catch (error) {
      console.error("Get visitor profile error:", error);
      throw error;
    }
  }

  async getVisitorAccessLogs(visitorId) {
    try {
      const response = await this.fetch(`/visitors/${visitorId}/logs`);
      return response;
    } catch (error) {
      console.error("Get visitor logs error:", error);
      throw error;
    }
  }

  async visitorCheckIn(visitorId, payload = {}) {
    try {
      const response = await this.fetch(`/visitors/${visitorId}/self-checkin`, {
        method: "PUT",
        body: payload,
      });
      return response;
    } catch (error) {
      console.error("Visitor check-in error:", error);
      throw error;
    }
  }

  async visitorCheckOut(visitorId, payload = {}) {
    try {
      const response = await this.fetch(`/visitors/${visitorId}/self-checkout`, {
        method: "PUT",
        body: payload,
      });
      return response;
    } catch (error) {
      console.error("Visitor check-out error:", error);
      throw error;
    }
  }

  async updateVisitorPhoneLocation(visitorId, locationData) {
    try {
      const response = await this.fetch(`/visitors/${visitorId}/phone-location`, {
        method: "PUT",
        body: locationData,
      });
      return response;
    } catch (error) {
      console.error("Update visitor phone location error:", error);
      throw error;
    }
  }

  async securityCheckIn(visitorId) {
    try {
      const response = await this.fetch(`/visitors/${visitorId}/checkin`, {
        method: "PUT",
      });
      return response;
    } catch (error) {
      console.error("Security check-in error:", error);
      throw error;
    }
  }

  async securityCheckOut(visitorId) {
    try {
      const response = await this.fetch(`/visitors/${visitorId}/checkout`, {
        method: "PUT",
      });
      return response;
    } catch (error) {
      console.error("Security check-out error:", error);
      throw error;
    }
  }

  async getVisitors(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await this.fetch(`/visitors${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error("Get visitors error:", error);
      throw error;
    }
  }

  async getVisitorById(visitorId) {
    try {
      const response = await this.fetch(`/visitors/${visitorId}`);
      return response;
    } catch (error) {
      console.error("Get visitor error:", error);
      throw error;
    }
  }

  async requestVisitorAppointment(userId, appointmentData) {
    try {
      const response = await this.fetch(`/visitors/${userId}/visit`, {
        method: "PUT",
        body: appointmentData,
      });
      return response;
    } catch (error) {
      console.error("Request visitor appointment error:", error);
      throw error;
    }
  }

  async getStaffAppointments(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await this.fetch(
        `/staff/appointments${queryString ? `?${queryString}` : ""}`,
      );
      return response;
    } catch (error) {
      console.error("Get staff appointments error:", error);
      throw error;
    }
  }

  async approveStaffAppointment(visitorId, note = "") {
    try {
      return await this.fetch(`/staff/appointments/${visitorId}/approve`, {
        method: "PUT",
        body: { note },
      });
    } catch (error) {
      console.error("Approve staff appointment error:", error);
      throw error;
    }
  }

  async adjustStaffAppointment(visitorId, adjustmentData) {
    try {
      return await this.fetch(`/staff/appointments/${visitorId}/adjust`, {
        method: "PUT",
        body: adjustmentData,
      });
    } catch (error) {
      console.error("Adjust staff appointment error:", error);
      throw error;
    }
  }

  async rejectStaffAppointment(visitorId, reason) {
    try {
      return await this.fetch(`/staff/appointments/${visitorId}/reject`, {
        method: "PUT",
        body: { reason },
      });
    } catch (error) {
      console.error("Reject staff appointment error:", error);
      throw error;
    }
  }

  // ================= ADMIN VISITOR APPROVAL METHODS =================

  async getPendingVisitors() {
    try {
      const response = await this.fetch("/admin/visitors/pending");
      return response;
    } catch (error) {
      console.error("Get pending visitors error:", error);
      throw error;
    }
  }

  async getAllVisitors(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await this.fetch(`/admin/visitors${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error("Get all visitors error:", error);
      throw error;
    }
  }

async approveVisitor(visitorId, adminNotes = '') {
  try {
    console.log(`🚀 Approving visitor with ID: ${visitorId}`);
    const response = await this.fetch(`/admin/visitors/${visitorId}/approve`, {
      method: "PUT",
      body: { adminNotes }
    });
    console.log('✅ Approve response:', response);
    return response;
  } catch (error) {
    console.error('❌ Approve error:', error);
    throw error;
  }
}

async rejectVisitor(visitorId, reason) {
  try {
    console.log(`🚀 Rejecting visitor with ID: ${visitorId}, Reason: ${reason}`);
    const response = await this.fetch(`/admin/visitors/${visitorId}/reject`, {
      method: "PUT",
      body: { reason }
    });
    console.log('✅ Reject response:', response);
    return response;
  } catch (error) {
    console.error('❌ Reject error:', error);
    throw error;
  }
}

  async sendAdminNotification(notificationData) {
    try {
      const response = await this.fetch("/admin/notifications", {
        method: "POST",
        body: notificationData
      });
      return response;
    } catch (error) {
      console.error("Send admin notification error:", error);
      throw error;
    }
  }

  async sendVisitorApprovalEmail(visitor) {
    try {
      const response = await this.fetch("/emails/send-approval", {
        method: "POST",
        body: {
          to: visitor.email,
          visitorName: visitor.fullName,
          password: visitor.temporaryPassword,
          visitDate: visitor.visitDate,
          visitTime: visitor.visitTime,
          purpose: visitor.purposeOfVisit
        }
      });
      return response;
    } catch (error) {
      console.error("Send approval email error:", error);
      throw error;
    }
  }

  async sendVisitorRejectionEmail(visitorId, reason) {
    try {
      const response = await this.fetch("/emails/send-rejection", {
        method: "POST",
        body: { visitorId, reason }
      });
      return response;
    } catch (error) {
      console.error("Send rejection email error:", error);
      throw error;
    }
  }

  async registerVisitorWithNotification(visitorData) {
    try {
      const registrationResponse = await this.registerVisitor(visitorData);
      
      if (registrationResponse.success && registrationResponse.visitor) {
        await this.sendAdminNotification({
          type: 'VISITOR_REGISTRATION',
          visitorId: registrationResponse.visitor._id,
          visitorName: visitorData.fullName,
          visitorEmail: visitorData.email,
          purpose: visitorData.purposeOfVisit,
          visitDate: visitorData.visitDate,
          visitTime: visitorData.visitTime,
          phoneNumber: visitorData.phoneNumber,
          timestamp: new Date().toISOString()
        });
        
        return registrationResponse;
      }
      
      return registrationResponse;
    } catch (error) {
      console.error("Visitor registration with notification error:", error);
      throw error;
    }
  }

  async getVisitorStats() {
    try {
      const response = await this.fetch("/visitors/stats");
      return response;
    } catch (error) {
      console.error("Get visitor stats error:", error);
      throw error;
    }
  }

  // ================= ADMIN METHODS =================

  async getAdminStats() {
    try {
      const response = await this.fetch("/admin/stats");
      return response;
    } catch (error) {
      console.error("Get admin stats error:", error);
      throw error;
    }
  }

  async getRecentActivities(limit = 10) {
    try {
      const response = await this.fetch(`/admin/activities?limit=${limit}`);
      return response;
    } catch (error) {
      console.error("Get recent activities error:", error);
      throw error;
    }
  }

  async getAllUsers(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await this.fetch(`/admin/users${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error("Get all users error:", error);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const response = await this.fetch(`/admin/users/${userId}`);
      return response;
    } catch (error) {
      console.error("Get user by ID error:", error);
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      const response = await this.fetch(`/admin/users/${userId}`, {
        method: "PUT",
        body: userData,
      });
      return response;
    } catch (error) {
      console.error("Update user error:", error);
      throw error;
    }
  }

  async updateUserRole(userId, role) {
    try {
      const response = await this.fetch(`/admin/users/${userId}/role`, {
        method: "PUT",
        body: { role },
      });
      return response;
    } catch (error) {
      console.error("Update user role error:", error);
      throw error;
    }
  }

  async deactivateUser(userId) {
    try {
      const response = await this.fetch(`/admin/users/${userId}/deactivate`, {
        method: "PUT",
      });
      return response;
    } catch (error) {
      console.error("Deactivate user error:", error);
      throw error;
    }
  }

  async activateUser(userId) {
    try {
      const response = await this.fetch(`/admin/users/${userId}/activate`, {
        method: "PUT",
      });
      return response;
    } catch (error) {
      console.error("Activate user error:", error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const response = await this.fetch(`/admin/users/${userId}`, {
        method: "DELETE",
      });
      return response;
    } catch (error) {
      console.error("Delete user error:", error);
      throw error;
    }
  }

  async updateUserAccess(userId, accessData) {
    try {
      const response = await this.fetch(`/admin/users/${userId}/access`, {
        method: "PUT",
        body: accessData,
      });
      return response;
    } catch (error) {
      console.error("Update user access error:", error);
      throw error;
    }
  }

  async getAllNfcCards(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await this.fetch(`/admin/nfc-cards${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error("Get all NFC cards error:", error);
      throw error;
    }
  }

  async issueNfcCard(userId) {
    try {
      const response = await this.fetch("/admin/nfc-cards/issue", {
        method: "POST",
        body: { userId },
      });
      return response;
    } catch (error) {
      console.error("Issue NFC card error:", error);
      throw error;
    }
  }

  async revokeNfcCard(cardId) {
    try {
      const response = await this.fetch(`/admin/nfc-cards/${cardId}/revoke`, {
        method: "PUT",
      });
      return response;
    } catch (error) {
      console.error("Revoke NFC card error:", error);
      throw error;
    }
  }

  async getAccessReports(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await this.fetch(`/admin/reports/access${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error("Get access reports error:", error);
      throw error;
    }
  }

  // ================= SECURITY GUARD MANAGEMENT =================

// Create a new security guard
async createSecurityGuard(guardData) {
  try {
    console.log('👮 Creating security guard:', guardData);
    
    // Generate a random password if not provided
    const password = guardData.password || this.generateRandomPassword();
    
    const response = await this.fetch("/admin/security/create", {
      method: "POST",
      body: {
        ...guardData,
        password,
        role: 'guard',
        status: 'active'
      }
    });
    
    console.log('📥 Create guard response:', response);
    return response;
  } catch (error) {
    console.error("❌ Create security guard error:", error);
    const isDuplicateEmail =
      error?.status === 409 ||
      String(error?.message || "").toLowerCase().includes("email already");
    const message = isDuplicateEmail
      ? "Email already registered. Please use another email address."
      : (error?.message || "Failed to create security account");
    throw new Error(message);
  }
}

// Get all security guards
async getAllSecurityGuards(filters = {}) {
  try {
    const queryString = new URLSearchParams(filters).toString();
    const response = await this.fetch(`/admin/security${queryString ? `?${queryString}` : ''}`);
    return response;
  } catch (error) {
    console.error("Get security guards error:", error);
    throw error;
  }
}

// Get security guard by ID
async getSecurityGuardById(guardId) {
  try {
    const response = await this.fetch(`/admin/security/${guardId}`);
    return response;
  } catch (error) {
    console.error("Get security guard error:", error);
    throw error;
  }
}

// Update security guard
async updateSecurityGuard(guardId, guardData) {
  try {
    const response = await this.fetch(`/admin/security/${guardId}`, {
      method: "PUT",
      body: guardData,
    });
    return response;
  } catch (error) {
    console.error("Update security guard error:", error);
    throw error;
  }
}

// Delete security guard
async deleteSecurityGuard(guardId) {
  try {
    const response = await this.fetch(`/admin/security/${guardId}`, {
      method: "DELETE",
    });
    return response;
  } catch (error) {
    console.error("Delete security guard error:", error);
    throw error;
  }
}

// Assign shift to security guard
async assignShift(guardId, shiftData) {
  try {
    const response = await this.fetch(`/admin/security/${guardId}/shift`, {
      method: "PUT",
      body: shiftData,
    });
    return response;
  } catch (error) {
    console.error("Assign shift error:", error);
    throw error;
  }
}

// Get guard attendance logs
async getGuardAttendance(guardId, dateRange = {}) {
  try {
    const queryString = new URLSearchParams(dateRange).toString();
    const response = await this.fetch(`/admin/security/${guardId}/attendance${queryString ? `?${queryString}` : ''}`);
    return response;
  } catch (error) {
    console.error("Get guard attendance error:", error);
    throw error;
  }
}

// Generate random password helper
generateRandomPassword(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

  async getSecurityLogs(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await this.fetch(`/admin/security-logs${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error("Get security logs error:", error);
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      const response = await this.fetch("/admin/health");
      return response;
    } catch (error) {
      console.error("Get system health error:", error);
      throw error;
    }
  }

  async createBackup() {
    try {
      const response = await this.fetch("/admin/backup", {
        method: "POST",
      });
      return response;
    } catch (error) {
      console.error("Create backup error:", error);
      throw error;
    }
  }

  async updateSystemSettings(settings) {
    try {
      const response = await this.fetch("/admin/settings", {
        method: "PUT",
        body: settings,
      });
      return response;
    } catch (error) {
      console.error("Update system settings error:", error);
      throw error;
    }
  }

  async getSystemSettings() {
    try {
      const response = await this.fetch("/admin/settings");
      return response;
    } catch (error) {
      console.error("Get system settings error:", error);
      throw error;
    }
  }

  async getNotifications(filters = {}) {
    try {
      const queryString = new URLSearchParams(filters).toString();
      const response = await this.fetch(`/notifications${queryString ? `?${queryString}` : ''}`);
      return response;
    } catch (error) {
      console.error("Get notifications error:", error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId) {
    try {
      const response = await this.fetch(`/notifications/${notificationId}/read`, {
        method: "PUT",
      });
      return response;
    } catch (error) {
      console.error("Mark notification error:", error);
      throw error;
    }
  }

  async markAllNotificationsAsRead() {
    try {
      const response = await this.fetch("/notifications/read-all", {
        method: "PUT",
      });
      return response;
    } catch (error) {
      console.error("Mark all notifications error:", error);
      throw error;
    }
  }

  // ================= COMPATIBILITY METHODS =================
  async changePassword(payload) {
    try {
      return await this.fetch("/auth/change-password", {
        method: "PUT",
        body: payload,
      });
    } catch (error) {
      console.error("Change password error:", error);
      throw error;
    }
  }

  async getActiveUserCount() {
    try {
      const response = await this.getAllUsers({ status: "active", limit: 1 });
      return response?.total ?? response?.users?.length ?? 0;
    } catch (error) {
      console.error("Get active user count error:", error);
      return 0;
    }
  }

  async getSecurityReports() {
    try {
      const response = await this.getSecurityLogs({ limit: 100 });
      const reports = (response?.logs || [])
        .filter((log) => log?.notes || log?.status === "denied")
        .map((log) => ({
          ...log,
          resolved: false,
          reason: log.notes || "Security incident",
        }));
      return { success: true, reports };
    } catch (error) {
      console.error("Get security reports error:", error);
      return { success: false, reports: [] };
    }
  }

  async resolveAlert(alertId) {
    try {
      const result = await this.markNotificationAsRead(alertId);
      return { success: !!result?.success };
    } catch (error) {
      console.error("Resolve alert error:", error);
      return { success: false };
    }
  }

  async reportVisitor(visitorId, reportData) {
    try {
      return await this.fetch(`/visitors/${visitorId}/report`, {
        method: "POST",
        body: reportData,
      });
    } catch (error) {
      console.error("Report visitor error:", error);
      throw error;
    }
  }

  async updateVisitor(visitorId, data) {
    try {
      return await this.fetch(`/visitors/${visitorId}`, {
        method: "PUT",
        body: data,
      });
    } catch (error) {
      // Let VisitorManagementScreen fall back to local demo-mode update path.
      console.error("Update visitor error:", error);
      return { success: false, message: error.message };
    }
  }

  async deleteVisitor(visitorId) {
    try {
      return await this.fetch(`/visitors/${visitorId}`, {
        method: "DELETE",
      });
    } catch (error) {
      // Let VisitorManagementScreen fall back to local demo-mode delete path.
      console.error("Delete visitor error:", error);
      return { success: false, message: error.message };
    }
  }

  async testConnection() {
    try {
      const controller =
        typeof AbortController !== "undefined" ? new AbortController() : null;
      const timeoutId = controller
        ? setTimeout(() => controller.abort(), 5000)
        : null;

      const response = await fetch(`${API_BASE_URL}/health`, {
        signal: controller?.signal,
      });

      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const data = await response.json();
      return data.status === "OK";
    } catch {
      return false;
    }
  }
}

export default new ApiService();
