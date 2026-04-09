import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ============ ONLY VISITOR, SECURITY, ADMIN SCREENS ============
import LoginScreen from "./screens/LoginScreen";
import VisitorRegisterScreen from "./screens/VisitorRegisterScreen";

// Dashboard Screens
import AdminDashboardScreen from "./screens/AdminDashboardScreen";
import SecurityDashboardScreen from "./screens/SecurityDashboardScreen";
import VisitorDashboardScreen from "./screens/VisitorDashboardScreen";

// Common Screens
import ProfileScreen from "./screens/ProfileScreenV2";
import AccessLogScreen from "./screens/AccessLogScreen";
import NFCScanScreen from "./screens/NFCScanScreen";
import HelpScreen from "./screens/HelpScreen";
import VerificationScreen from "./screens/VerificationScreen";

// Visitor Screens
import VisitorPassScreen from "./screens/VisitorPassScreen";
import WebMapScreen from "./screens/WebMapScreen";

// Admin Management Screens
import VisitorManagementScreen from "./screens/VisitorManagementScreen";
import NFCManagementScreen from "./screens/NFCManagementScreen";
import ReportsScreen from "./screens/ReportsScreen";
import SecurityLogsScreen from "./screens/SecurityLogsScreen";
import SettingsScreen from "./screens/SettingsScreen";

// Role Selection
import RoleSelectScreen from "./screens/RoleSelectScreen";

import ApiService from "./utils/ApiService";
import { getDashboardRoute, isRecognizedRole, normalizeRole } from "./utils/authFlow";

const Storage = Platform.OS === "web"
  ? require("./utils/webStorage").default
  : require("@react-native-async-storage/async-storage");


const Stack = createNativeStackNavigator();
const APP_NAME = "SafePass";
const APP_ORGANIZATION = "Sapphire International Aviation Academy";
const WEB_ROUTE_TITLES = {
  RoleSelect: `Access Portal | ${APP_ORGANIZATION}`,
  Login: `Login | ${APP_ORGANIZATION}`,
  VisitorRegister: `Visitor Registration | ${APP_ORGANIZATION}`,
  Verification: `Account Verification | ${APP_ORGANIZATION}`,
  Help: `Help Center | ${APP_ORGANIZATION}`,
  AdminDashboard: `Admin Dashboard | ${APP_ORGANIZATION}`,
  SecurityDashboard: `Security Operations | ${APP_ORGANIZATION}`,
  VisitorDashboard: `Visitor Dashboard | ${APP_ORGANIZATION}`,
  VisitorPass: `Visitor Pass | ${APP_ORGANIZATION}`,
  WebMapScreen: `Campus Map | ${APP_ORGANIZATION}`,
  Profile: `Profile | ${APP_ORGANIZATION}`,
  AccessLog: `Access Logs | ${APP_ORGANIZATION}`,
  NFCScan: `NFC Scanner | ${APP_ORGANIZATION}`,
  VisitorManagement: `Visitor Management | ${APP_ORGANIZATION}`,
  NFCManagement: `NFC Management | ${APP_ORGANIZATION}`,
  Reports: `Reports | ${APP_ORGANIZATION}`,
  SecurityLogs: `Security Logs | ${APP_ORGANIZATION}`,
  Settings: `Settings | ${APP_ORGANIZATION}`,
};

let logoutCallback = null;

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewRegistration, setIsNewRegistration] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    
    logoutCallback = () => {
      console.log("Global logout triggered from App.js");
      setCurrentUser(null);
      setIsLoading(false);
    };
    
    return () => {
      logoutCallback = null;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined" && isLoading) {
      document.title = `${APP_NAME} Portal | ${APP_ORGANIZATION}`;
    }
  }, [isLoading]);

  const checkAuthStatus = async () => {
    try {
      const registrationFlag = await Storage.getItem('isNewRegistration');
      
      if (registrationFlag === 'true') {
        console.log("New registration flow detected - staying on auth screens");
        setIsNewRegistration(true);
        setCurrentUser(null);
        await Storage.removeItem('isNewRegistration');
        setIsLoading(false);
        return;
      }
      
      const [user, token] = await Promise.all([
        ApiService.getCurrentUser(),
        ApiService.getToken(),
      ]);
      console.log("App.js checkAuthStatus - User found:", user ? "Yes" : "No");
      
      if (user) {
        if (!token) {
          console.log("User cache exists but auth token is missing. Clearing stale auth state.");
          await ApiService.clearAuth();
          setCurrentUser(null);
          return;
        }

        const normalizedRole = normalizeRole(user.role);
        const normalizedUser = { ...user, role: normalizedRole };
        if (isRecognizedRole(normalizedRole)) {
          setCurrentUser(normalizedUser);
        } else {
          console.log("Invalid user role detected:", user.role);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#F5F7FA",
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 360,
            backgroundColor: "#FFFFFF",
            borderRadius: 24,
            paddingVertical: 28,
            paddingHorizontal: 24,
            alignItems: "center",
            shadowColor: "#0F172A",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.08,
            shadowRadius: 24,
            elevation: 4,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: "#0F172A",
              textAlign: "center",
            }}
          >
            {APP_NAME}
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontSize: 13,
              lineHeight: 19,
              color: "#475569",
              textAlign: "center",
            }}
          >
            {APP_ORGANIZATION}
          </Text>
          <View
            style={{
              width: 56,
              height: 4,
              borderRadius: 999,
              backgroundColor: "#0A3D91",
              marginTop: 16,
              marginBottom: 20,
            }}
          />
          <ActivityIndicator size="large" color="#0A3D91" />
          <Text
            style={{
              marginTop: 16,
              fontSize: 14,
              fontWeight: "600",
              color: "#1E293B",
              textAlign: "center",
            }}
          >
            Preparing your secure access portal
          </Text>
          <Text
            style={{
              marginTop: 6,
              fontSize: 12,
              lineHeight: 18,
              color: "#64748B",
              textAlign: "center",
            }}
          >
            Verifying your session and loading the appropriate dashboard.
          </Text>
        </View>
      </View>
    );
  }

  let initialRoute = "RoleSelect";
  if (!isNewRegistration && currentUser) {
    initialRoute = getDashboardRoute(currentUser);
  }
  
  console.log("App.js initialRoute:", initialRoute);
  console.log("Current user:", currentUser ? `${currentUser.role}` : "None");

  return (
    <NavigationContainer
      documentTitle={{
        enabled: Platform.OS === "web",
        formatter: (_options, route) =>
          WEB_ROUTE_TITLES[route?.name] || `${APP_NAME} | ${APP_ORGANIZATION}`,
      }}
    >
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ 
          headerShown: false, 
          animation: Platform.OS === "web" ? "none" : "slide_from_right" 
        }}
      >
        {/* Auth & Role Selection */}
        <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="VisitorRegister" component={VisitorRegisterScreen} />
        <Stack.Screen name="Verification" component={VerificationScreen} />
        
        {/* Help Screen */}
        <Stack.Screen name="Help" component={HelpScreen} />
        
        {/* Dashboard Screens */}
        <Stack.Screen name="AdminDashboard">
          {(props) => <AdminDashboardScreen {...props} onLogout={() => setCurrentUser(null)} />}
        </Stack.Screen>
        <Stack.Screen name="SecurityDashboard">
          {(props) => <SecurityDashboardScreen {...props} onLogout={() => setCurrentUser(null)} />}
        </Stack.Screen>
        <Stack.Screen name="VisitorDashboard">
          {(props) => <VisitorDashboardScreen {...props} onLogout={() => setCurrentUser(null)} />}
        </Stack.Screen>
        
        {/* Visitor Screens */}
        <Stack.Screen name="VisitorPass" component={VisitorPassScreen} />
        <Stack.Screen name="WebMapScreen" component={WebMapScreen} />
        
        {/* Common Screens */}
        <Stack.Screen name="Profile">
          {(props) => <ProfileScreen {...props} onLogout={() => setCurrentUser(null)} />}
        </Stack.Screen>
        <Stack.Screen name="AccessLog" component={AccessLogScreen} />
        <Stack.Screen name="NFCScan" component={NFCScanScreen} />
        
        {/* Admin Management Screens */}
        <Stack.Screen name="VisitorManagement" component={VisitorManagementScreen} />
        <Stack.Screen name="NFCManagement" component={NFCManagementScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
        <Stack.Screen name="SecurityLogs" component={SecurityLogsScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export const triggerGlobalLogout = () => {
  if (logoutCallback) {
    logoutCallback();
  }
};
