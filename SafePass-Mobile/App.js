import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============ ONLY VISITOR, SECURITY, ADMIN SCREENS ============
import LoginScreen from "./screens/LoginScreen";
import VisitorRegisterScreen from "./screens/VisitorRegisterScreen";

// Dashboard Screens
import AdminDashboardScreen from "./screens/AdminDashboardScreen";
import SecurityDashboardScreen from "./screens/SecurityDashboardScreen";
import VisitorDashboardScreen from "./screens/VisitorDashboardScreen";

// Common Screens
import ProfileScreen from "./screens/ProfileScreen";
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


const Stack = createNativeStackNavigator();

const getInitialRoute = (user) => {
  if (!user) return "RoleSelect";
  const role = String(user.role || "").toLowerCase();
  
  switch (role) {
    case "security":
    case "guard":
      return "SecurityDashboard";
    case "admin":
      return "AdminDashboard";
    case "visitor":
      return "VisitorDashboard";
    default:
      return "RoleSelect";
  }
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

  const checkAuthStatus = async () => {
    try {
      const registrationFlag = await AsyncStorage.getItem('isNewRegistration');
      
      if (registrationFlag === 'true') {
        console.log("New registration flow detected - staying on auth screens");
        setIsNewRegistration(true);
        setCurrentUser(null);
        await AsyncStorage.removeItem('isNewRegistration');
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

        const normalizedRole = String(user.role || "").toLowerCase();
        const normalizedUser = { ...user, role: normalizedRole };
        const validRoles = ['visitor', 'security', 'guard', 'admin'];
        if (validRoles.includes(normalizedRole)) {
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5F7FA" }}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={{ marginTop: 10, color: "#6B7280" }}>Loading SafePass...</Text>
      </View>
    );
  }

  let initialRoute = "RoleSelect";
  if (!isNewRegistration && currentUser) {
    initialRoute = getInitialRoute(currentUser);
  }
  
  console.log("App.js initialRoute:", initialRoute);
  console.log("Current user:", currentUser ? `${currentUser.role}` : "None");

  return (
    <NavigationContainer>
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
