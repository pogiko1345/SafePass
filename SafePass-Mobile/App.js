import React, { useCallback, useEffect, useRef, useState } from "react";
import { AppState, View, Text, ActivityIndicator, Platform } from "react-native";
import { CommonActions, NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ============ ONLY VISITOR, SECURITY, ADMIN SCREENS ============
import LoginScreen from "./screens/LoginScreen";
import VisitorRegisterScreen from "./screens/VisitorRegisterScreen";

// Dashboard Screens
import AdminDashboardScreen from "./screens/AdminDashboardScreen";
import SecurityDashboardScreen from "./screens/SecurityDashboardScreen";
import VisitorDashboardScreen from "./screens/VisitorDashboardScreen";
import StaffDashboardScreen from "./screens/StaffDashboardScreen";

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
import {
  getDashboardRoute,
  isRecognizedRole,
  normalizeRole,
} from "./utils/authFlow";
import {
  APP_DISPLAY_NAME,
  APP_ORGANIZATION_NAME,
  IS_VISITOR_ONLY_APP,
  getVariantBlockedRoleMessage,
  getVariantInitialRoute,
  getVisitorBuildNavigationParams,
  isRoleAllowedInCurrentVariant,
} from "./utils/appVariant";

const Storage =
  Platform.OS === "web"
    ? require("./utils/webStorage").default
    : require("@react-native-async-storage/async-storage").default;

const Stack = createNativeStackNavigator();
const APP_NAME = APP_DISPLAY_NAME;
const APP_ORGANIZATION = APP_ORGANIZATION_NAME;
const IDLE_LOGOUT_MS = 15 * 60 * 1000;
const LAST_ACTIVITY_AT_KEY = "lastActivityAt";
const AUTH_NOTICE_KEY = "authNotice";
const SESSION_EXPIRED_MESSAGE = "Your session expired. Please sign in again.";
const WEB_ROUTE_TITLES = {
  RoleSelect: `Access Portal | ${APP_ORGANIZATION}`,
  Login: `Login | ${APP_ORGANIZATION}`,
  VisitorRegister: `Visitor Registration | ${APP_ORGANIZATION}`,
  Verification: `Account Verification | ${APP_ORGANIZATION}`,
  Help: `Help Center | ${APP_ORGANIZATION}`,
  AdminDashboard: `Admin Dashboard | ${APP_ORGANIZATION}`,
  StaffDashboard: `Staff Dashboard | ${APP_ORGANIZATION}`,
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

const DEFAULT_STACK_TRANSITION = {
  animation: "slide_from_right",
  animationDuration: 320,
  animationTypeForReplace: "push",
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
  contentStyle: { backgroundColor: "#F4F7FB" },
};

const VISITOR_STACK_TRANSITION = {
  ...DEFAULT_STACK_TRANSITION,
  animationDuration: 300,
};

let logoutCallback = null;

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const idleTimerRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewRegistration, setIsNewRegistration] = useState(false);

  const resetToAuthRoute = useCallback(() => {
    const routeName = IS_VISITOR_ONLY_APP ? "Login" : "RoleSelect";
    if (navigationRef.isReady()) {
      navigationRef.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: routeName }],
        }),
      );
    }
  }, [navigationRef]);

  const performAppLogout = useCallback(async ({ resetNavigation = true } = {}) => {
    try {
      await ApiService.logout();
    } catch (error) {
      console.log("App logout API error ignored:", error);
      await ApiService.clearAuth();
    } finally {
      await Storage.removeItem(LAST_ACTIVITY_AT_KEY);
      setCurrentUser(null);
      setIsLoading(false);
      if (resetNavigation) {
        resetToAuthRoute();
      }
    }
  }, [resetToAuthRoute]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    if (!currentUser) return;

    Storage.setItem(LAST_ACTIVITY_AT_KEY, String(Date.now())).catch((error) => {
      console.log("Persist last activity error:", error);
    });

    idleTimerRef.current = setTimeout(() => {
      performAppLogout({ resetNavigation: true });
    }, IDLE_LOGOUT_MS);
  }, [currentUser, performAppLogout]);

  useEffect(() => {
    checkAuthStatus();

    logoutCallback = () => {
      console.log("Global logout triggered from App.js");
      performAppLogout({ resetNavigation: true });
    };

    return () => {
      logoutCallback = null;
    };
  }, [performAppLogout]);

  useEffect(() => {
    if (!currentUser) {
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
      return undefined;
    }

    resetIdleTimer();

    const appStateSubscription = AppState.addEventListener("change", (nextState) => {
      const wasBackground = /inactive|background/.test(appStateRef.current);
      appStateRef.current = nextState;
      if (nextState === "active" && wasBackground) {
        resetIdleTimer();
      }
    });

    if (Platform.OS === "web" && typeof window !== "undefined") {
      const activityEvents = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"];
      activityEvents.forEach((eventName) => {
        window.addEventListener(eventName, resetIdleTimer, { passive: true });
      });

      return () => {
        appStateSubscription.remove();
        activityEvents.forEach((eventName) => {
          window.removeEventListener(eventName, resetIdleTimer);
        });
        if (idleTimerRef.current) {
          clearTimeout(idleTimerRef.current);
          idleTimerRef.current = null;
        }
      };
    }

    return () => {
      appStateSubscription.remove();
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
        idleTimerRef.current = null;
      }
    };
  }, [currentUser, resetIdleTimer]);

  useEffect(() => {
    if (Platform.OS === "web" && typeof document !== "undefined" && isLoading) {
      document.title = `${APP_NAME} Portal | ${APP_ORGANIZATION}`;
    }
  }, [isLoading]);

  const checkAuthStatus = async () => {
    try {
      const registrationFlag = await Storage.getItem("isNewRegistration");

      if (registrationFlag === "true") {
        console.log("New registration flow detected - staying on auth screens");
        setIsNewRegistration(true);
        setCurrentUser(null);
        await Storage.removeItem("isNewRegistration");
        setIsLoading(false);
        return;
      }

      const token = await ApiService.getToken();
      const user = token ? await ApiService.restoreCurrentUserFromToken() : null;
      console.log("App.js checkAuthStatus - User found:", user ? "Yes" : "No");

      if (user) {
        const rememberedSessionActive = await ApiService.isRememberedSessionActive();
        if (!rememberedSessionActive) {
          console.log("Remembered login expired. Asking user to sign in again.");
          await ApiService.clearAuth();
          await Storage.setItem(AUTH_NOTICE_KEY, SESSION_EXPIRED_MESSAGE);
          setCurrentUser(null);
          return;
        }

        const normalizedRole = normalizeRole(user.role);
        const normalizedUser = { ...user, role: normalizedRole };
        if (
          isRecognizedRole(normalizedRole) &&
          isRoleAllowedInCurrentVariant(normalizedRole)
        ) {
          await Storage.setItem(LAST_ACTIVITY_AT_KEY, String(Date.now()));
          setCurrentUser(normalizedUser);
        } else {
          console.log(
            "User role is not available in this app build:",
            user.role,
          );
          if (
            normalizedRole &&
            !isRoleAllowedInCurrentVariant(normalizedRole)
          ) {
            console.log(getVariantBlockedRoleMessage(normalizedRole));
          }
          await ApiService.clearAuth();
          setCurrentUser(null);
        }
      } else {
        const cachedUser = await ApiService.getCurrentUser();
        if (cachedUser && !token) {
          console.log(
            "User cache exists but auth token is missing. Clearing stale auth state.",
          );
          await ApiService.clearAuth();
        }
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      const message = String(error?.message || "").toLowerCase();
      if (
        error?.status === 401 ||
        message.includes("401") ||
        message.includes("authenticate")
      ) {
        await ApiService.clearAuth();
        await Storage.setItem(AUTH_NOTICE_KEY, SESSION_EXPIRED_MESSAGE);
      }
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
            Restoring your session
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
            Keeping you signed in and opening the right dashboard.
          </Text>
        </View>
      </View>
    );
  }

  let initialRoute = getVariantInitialRoute({
    currentUser: null,
    isNewRegistration,
  });
  const passwordResetLinkParams =
    Platform.OS === "web" && typeof window !== "undefined"
      ? {
          resetEmail: new URLSearchParams(window.location.search || "").get("resetEmail") || "",
          resetToken: new URLSearchParams(window.location.search || "").get("resetToken") || "",
        }
      : { resetEmail: "", resetToken: "" };
  const hasPasswordResetLink =
    passwordResetLinkParams.resetEmail && passwordResetLinkParams.resetToken;
  if (!isNewRegistration && currentUser) {
    initialRoute = IS_VISITOR_ONLY_APP
      ? "VisitorDashboard"
      : getDashboardRoute(currentUser);
  } else if (hasPasswordResetLink) {
    initialRoute = "Login";
  }

  console.log("App.js initialRoute:", initialRoute);
  console.log("Current user:", currentUser ? `${currentUser.role}` : "None");

  return (
    <View style={{ flex: 1 }} onTouchStart={resetIdleTimer}>
      <NavigationContainer
        ref={navigationRef}
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
          ...DEFAULT_STACK_TRANSITION,
        }}
      >
        {/* Auth & Role Selection */}
        {!IS_VISITOR_ONLY_APP && (
          <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
        )}
        <Stack.Screen name="Login" initialParams={passwordResetLinkParams}>
          {(props) => (
            <LoginScreen
              {...props}
              route={{
                ...props.route,
                params: {
                  ...(props.route?.params || {}),
                  ...(hasPasswordResetLink ? passwordResetLinkParams : {}),
                  ...(IS_VISITOR_ONLY_APP
                    ? getVisitorBuildNavigationParams()
                    : {}),
                },
              }}
            />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="VisitorRegister"
          component={VisitorRegisterScreen}
          options={VISITOR_STACK_TRANSITION}
        />
        <Stack.Screen
          name="Verification"
          component={VerificationScreen}
          options={VISITOR_STACK_TRANSITION}
        />

        {/* Help Screen */}
        <Stack.Screen
          name="Help"
          component={HelpScreen}
          options={VISITOR_STACK_TRANSITION}
        />

        {/* Dashboard Screens */}
        {!IS_VISITOR_ONLY_APP && (
          <Stack.Screen name="AdminDashboard">
            {(props) => (
              <AdminDashboardScreen
                {...props}
                onLogout={() => setCurrentUser(null)}
              />
            )}
          </Stack.Screen>
        )}
        {!IS_VISITOR_ONLY_APP && (
          <Stack.Screen name="StaffDashboard">
            {(props) => (
              <StaffDashboardScreen
                {...props}
                onLogout={() => setCurrentUser(null)}
              />
            )}
          </Stack.Screen>
        )}
        {!IS_VISITOR_ONLY_APP && (
          <Stack.Screen name="SecurityDashboard">
            {(props) => (
              <SecurityDashboardScreen
                {...props}
                onLogout={() => setCurrentUser(null)}
              />
            )}
          </Stack.Screen>
        )}
        <Stack.Screen name="VisitorDashboard" options={VISITOR_STACK_TRANSITION}>
          {(props) => (
            <VisitorDashboardScreen
              {...props}
              onLogout={() => setCurrentUser(null)}
            />
          )}
        </Stack.Screen>

        {/* Visitor Screens */}
        <Stack.Screen
          name="VisitorPass"
          component={VisitorPassScreen}
          options={VISITOR_STACK_TRANSITION}
        />
        <Stack.Screen
          name="WebMapScreen"
          component={WebMapScreen}
          options={VISITOR_STACK_TRANSITION}
        />

        {/* Common Screens */}
        <Stack.Screen name="Profile" options={VISITOR_STACK_TRANSITION}>
          {(props) => (
            <ProfileScreen {...props} onLogout={() => setCurrentUser(null)} />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="AccessLog"
          component={AccessLogScreen}
          options={VISITOR_STACK_TRANSITION}
        />
        <Stack.Screen
          name="NFCScan"
          component={NFCScanScreen}
          options={VISITOR_STACK_TRANSITION}
        />

        {/* Admin Management Screens */}
        {!IS_VISITOR_ONLY_APP && (
          <Stack.Screen
            name="VisitorManagement"
            component={VisitorManagementScreen}
          />
        )}
        {!IS_VISITOR_ONLY_APP && (
          <Stack.Screen name="NFCManagement" component={NFCManagementScreen} />
        )}
        {!IS_VISITOR_ONLY_APP && (
          <Stack.Screen name="Reports" component={ReportsScreen} />
        )}
        {!IS_VISITOR_ONLY_APP && (
          <Stack.Screen name="SecurityLogs" component={SecurityLogsScreen} />
        )}
        {!IS_VISITOR_ONLY_APP && (
          <Stack.Screen name="Settings" component={SettingsScreen} />
        )}
      </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

export const triggerGlobalLogout = () => {
  if (logoutCallback) {
    logoutCallback();
  }
};
