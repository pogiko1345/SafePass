import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { AppState, View, Text, ActivityIndicator, Platform, Image } from "react-native";
import {
  CommonActions,
  DefaultTheme,
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { brandColors } from "./styles/brandColors";

// ============ ONLY VISITOR, SECURITY, ADMIN SCREENS ============
import LoginScreen from "./screens/LoginScreen";

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
const SCHOOL_LOGO = require("./assets/LogoSapphire.jpg");
const AdminDashboardScreen = lazy(() => import("./screens/AdminDashboardScreen"));
const SecurityDashboardScreen = lazy(() => import("./screens/SecurityDashboardScreen"));
const VisitorDashboardScreen = lazy(() => import("./screens/VisitorDashboardScreen"));
const StaffDashboardScreen = lazy(() => import("./screens/StaffDashboardScreen"));
const StudentDashboardScreen = lazy(() => import("./screens/StudentDashboardScreen"));
const ProfileScreen = lazy(() => import("./screens/ProfileScreenV2"));
const AccessLogScreen = lazy(() => import("./screens/AccessLogScreen"));
const NFCScanScreen = lazy(() => import("./screens/NFCScanScreen"));
const VisitorRegisterScreen = lazy(() => import("./screens/VisitorRegisterScreen"));
const HelpScreen = lazy(() => import("./screens/HelpScreen"));
const VerificationScreen = lazy(() => import("./screens/VerificationScreen"));
const VisitorPassScreen = lazy(() => import("./screens/VisitorPassScreen"));
const WebMapScreen = lazy(() => import("./screens/WebMapScreen"));
const VisitorManagementScreen = lazy(() => import("./screens/VisitorManagementScreen"));
const NFCManagementScreen = lazy(() => import("./screens/NFCManagementScreen"));
const AttendanceRecordsScreen = lazy(() => import("./screens/AttendanceRecordsScreen"));
const ReportsScreen = lazy(() => import("./screens/ReportsScreen"));
const SecurityLogsScreen = lazy(() => import("./screens/SecurityLogsScreen"));
const SettingsScreen = lazy(() => import("./screens/SettingsScreen"));
const APP_NAME = APP_DISPLAY_NAME;
const APP_ORGANIZATION = APP_ORGANIZATION_NAME;
const MOBILE_IDLE_LOGOUT_MS = 30 * 60 * 1000;
const WEB_SESSION_LOGOUT_MS = 7 * 24 * 60 * 60 * 1000;
const IDLE_LOGOUT_MS =
  Platform.OS === "web" ? WEB_SESSION_LOGOUT_MS : MOBILE_IDLE_LOGOUT_MS;
const LAST_ACTIVITY_AT_KEY = "lastActivityAt";
const AUTH_NOTICE_KEY = "authNotice";
const SESSION_EXPIRED_MESSAGE =
  Platform.OS === "web"
    ? "Your web session has expired after 7 days. Please login again."
    : "You were inactive for 30 minutes. Please login again.";
const WEB_ROUTE_TITLES = {
  RoleSelect: `Access Portal | ${APP_ORGANIZATION}`,
  Login: `Login | ${APP_ORGANIZATION}`,
  VisitorRegister: `Visitor Registration | ${APP_ORGANIZATION}`,
  Verification: `Account Verification | ${APP_ORGANIZATION}`,
  Help: `Help Center | ${APP_ORGANIZATION}`,
  AdminDashboard: `Admin Dashboard | ${APP_ORGANIZATION}`,
  StaffDashboard: `Staff Dashboard | ${APP_ORGANIZATION}`,
  SecurityDashboard: `Security Operations | ${APP_ORGANIZATION}`,
  StudentDashboard: `Student Dashboard | ${APP_ORGANIZATION}`,
  VisitorDashboard: `Visitor Dashboard | ${APP_ORGANIZATION}`,
  VisitorPass: `Visitor Pass | ${APP_ORGANIZATION}`,
  WebMapScreen: `Campus Map | ${APP_ORGANIZATION}`,
  Profile: `Profile | ${APP_ORGANIZATION}`,
  AccessLog: `Access Logs | ${APP_ORGANIZATION}`,
  NFCScan: `NFC Scanner | ${APP_ORGANIZATION}`,
  VisitorManagement: `Visitor Management | ${APP_ORGANIZATION}`,
  NFCManagement: `NFC Management | ${APP_ORGANIZATION}`,
  AttendanceRecords: `Attendance Records | ${APP_ORGANIZATION}`,
  Reports: `Reports | ${APP_ORGANIZATION}`,
  SecurityLogs: `Security Logs | ${APP_ORGANIZATION}`,
  Settings: `Settings | ${APP_ORGANIZATION}`,
};
const SAFE_PASS_NAV_THEME = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: brandColors.background,
    card: brandColors.background,
  },
};
const WEB_LINKING = {
  prefixes:
    Platform.OS === "web" && typeof window !== "undefined"
      ? [window.location.origin]
      : [],
  config: {
    initialRouteName: IS_VISITOR_ONLY_APP ? "Login" : "RoleSelect",
    screens: {
      ...(!IS_VISITOR_ONLY_APP ? { RoleSelect: "" } : {}),
      Login: IS_VISITOR_ONLY_APP ? "" : "login",
      VisitorRegister: "visitor-register",
      Verification: "verification",
      Help: "help",
      AdminDashboard: "admin",
      StaffDashboard: "staff",
      SecurityDashboard: "security",
      StudentDashboard: "student",
      VisitorDashboard: "visitor",
      VisitorPass: "visitor-pass",
      WebMapScreen: "campus-map",
      Profile: "profile",
      AccessLog: "access-log",
      NFCScan: "nfc-scan",
      VisitorManagement: "visitor-management",
      NFCManagement: "nfc-management",
      AttendanceRecords: "attendance-records",
      Reports: "reports",
      SecurityLogs: "security-logs",
      Settings: "settings",
    },
  },
};

const CHUNK_RELOAD_STORAGE_KEY = "safepass:lastChunkReloadAt";
const CHUNK_RELOAD_COOLDOWN_MS = 2 * 60 * 1000;

const isChunkLoadFailure = (error) => {
  const message = `${error?.name || ""} ${error?.message || ""}`;
  return (
    /ChunkLoadError/i.test(message) ||
    /Loading chunk \d+ failed/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message)
  );
};

class ChunkLoadRecoveryBoundary extends React.Component {
  state = { hasChunkError: false };

  static getDerivedStateFromError(error) {
    return isChunkLoadFailure(error) ? { hasChunkError: true } : null;
  }

  componentDidCatch(error) {
    if (
      Platform.OS !== "web" ||
      typeof window === "undefined" ||
      !isChunkLoadFailure(error)
    ) {
      throw error;
    }

    const lastReloadAt = Number(
      window.sessionStorage?.getItem(CHUNK_RELOAD_STORAGE_KEY) || 0,
    );
    const canReload =
      !Number.isFinite(lastReloadAt) ||
      Date.now() - lastReloadAt > CHUNK_RELOAD_COOLDOWN_MS;

    if (canReload) {
      window.sessionStorage?.setItem(CHUNK_RELOAD_STORAGE_KEY, String(Date.now()));
      window.location.reload();
    }
  }

  render() {
    if (!this.state.hasChunkError) {
      return this.props.children;
    }

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: brandColors.background,
          paddingHorizontal: 24,
        }}
      >
        <Image
          source={SCHOOL_LOGO}
          resizeMode="contain"
          style={{ width: 116, height: 54, marginBottom: 18 }}
        />
        <Text
          style={{
            color: brandColors.text,
            fontSize: 16,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          SafePass was updated
        </Text>
        <Text
          style={{
            color: brandColors.textMuted,
            fontSize: 14,
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          Refresh this page to load the latest staff dashboard.
        </Text>
        <Text
          accessibilityRole="button"
          onPress={() => window.location.reload()}
          style={{
            color: brandColors.blue,
            fontSize: 14,
            fontWeight: "700",
            paddingHorizontal: 18,
            paddingVertical: 10,
          }}
        >
          Refresh now
        </Text>
      </View>
    );
  }
}

const ScreenFallback = () => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: brandColors.background,
      paddingHorizontal: 24,
    }}
  >
    <Image
      source={SCHOOL_LOGO}
      resizeMode="contain"
      style={{
        width: 116,
        height: 54,
        marginBottom: 18,
      }}
    />
    <ActivityIndicator size="large" color={brandColors.blue} />
  </View>
);

const DEFAULT_STACK_TRANSITION = {
  animation: "slide_from_right",
  animationDuration: 320,
  animationTypeForReplace: "push",
  gestureEnabled: true,
  fullScreenGestureEnabled: true,
  contentStyle: { backgroundColor: brandColors.background },
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

  const getStoredIdleState = useCallback(async () => {
    const lastActivityRaw = await Storage.getItem(LAST_ACTIVITY_AT_KEY);
    const lastActivityAt = Number(lastActivityRaw);

    if (!Number.isFinite(lastActivityAt) || lastActivityAt <= 0) {
      return {
        expired: false,
        lastActivityAt: Date.now(),
        remainingMs: IDLE_LOGOUT_MS,
      };
    }

    const elapsedMs = Date.now() - lastActivityAt;
    return {
      expired: elapsedMs >= IDLE_LOGOUT_MS,
      lastActivityAt,
      remainingMs: Math.max(IDLE_LOGOUT_MS - elapsedMs, 0),
    };
  }, []);

  const performAppLogout = useCallback(async ({
    resetNavigation = true,
    notice = "",
  } = {}) => {
    try {
      await ApiService.logout();
    } catch (error) {
      console.log("App logout API error ignored:", error);
      await ApiService.clearAuth();
    } finally {
      await Storage.removeItem(LAST_ACTIVITY_AT_KEY);
      if (notice) {
        await Storage.setItem(AUTH_NOTICE_KEY, notice);
      }
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
      performAppLogout({
        resetNavigation: true,
        notice: SESSION_EXPIRED_MESSAGE,
      });
    }, IDLE_LOGOUT_MS);
  }, [currentUser, performAppLogout]);

  const scheduleIdleTimerFromStoredActivity = useCallback(async () => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    if (!currentUser) return;

    const idleState = await getStoredIdleState();
    if (idleState.expired) {
      await performAppLogout({
        resetNavigation: true,
        notice: SESSION_EXPIRED_MESSAGE,
      });
      return;
    }

    idleTimerRef.current = setTimeout(() => {
      performAppLogout({
        resetNavigation: true,
        notice: SESSION_EXPIRED_MESSAGE,
      });
    }, idleState.remainingMs || IDLE_LOGOUT_MS);
  }, [currentUser, getStoredIdleState, performAppLogout]);

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
        scheduleIdleTimerFromStoredActivity();
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
  }, [currentUser, resetIdleTimer, scheduleIdleTimerFromStoredActivity]);

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

        const idleState = await getStoredIdleState();
        if (idleState.expired) {
          console.log("Idle session expired. Asking user to sign in again.");
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
          backgroundColor: brandColors.navy,
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 360,
            backgroundColor: brandColors.surface,
            borderRadius: 8,
            paddingVertical: 28,
            paddingHorizontal: 24,
            alignItems: "center",
            shadowColor: brandColors.text,
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.08,
            shadowRadius: 24,
            elevation: 4,
          }}
        >
          <View
            style={{
              width: 116,
              height: 116,
              borderRadius: 28,
              backgroundColor: "#FFFFFF",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
              shadowColor: brandColors.text,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 18,
              elevation: 3,
            }}
          >
            <Image
              source={SCHOOL_LOGO}
              resizeMode="contain"
              style={{
                width: 96,
                height: 54,
              }}
            />
          </View>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "800",
              color: brandColors.text,
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
              color: brandColors.textMuted,
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
              backgroundColor: brandColors.blue,
              marginTop: 16,
              marginBottom: 20,
            }}
          />
          <ActivityIndicator size="large" color={brandColors.blue} />
          <Text
            style={{
              marginTop: 16,
              fontSize: 14,
              fontWeight: "600",
              color: brandColors.text,
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
              color: brandColors.textMuted,
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
    <View style={{ flex: 1, backgroundColor: brandColors.background }} onTouchStart={resetIdleTimer}>
      <NavigationContainer
        ref={navigationRef}
        theme={SAFE_PASS_NAV_THEME}
        linking={Platform.OS === "web" ? WEB_LINKING : undefined}
        documentTitle={{
          enabled: Platform.OS === "web",
          formatter: (_options, route) =>
            WEB_ROUTE_TITLES[route?.name] || `${APP_NAME} | ${APP_ORGANIZATION}`,
        }}
      >
      <ChunkLoadRecoveryBoundary>
      <Suspense fallback={<ScreenFallback />}>
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
        {!IS_VISITOR_ONLY_APP && (
          <Stack.Screen name="StudentDashboard">
            {(props) => (
              <StudentDashboardScreen
                {...props}
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
          <Stack.Screen name="AttendanceRecords" component={AttendanceRecordsScreen} />
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
      </Suspense>
      </ChunkLoadRecoveryBoundary>
      </NavigationContainer>
    </View>
  );
}

export const triggerGlobalLogout = () => {
  if (logoutCallback) {
    logoutCallback();
  }
};
