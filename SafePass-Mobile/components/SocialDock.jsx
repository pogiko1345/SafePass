import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { brandColors } from "../styles/brandColors";

const isWeb = Platform.OS === "web";
const shadowColor = brandColors.text;

export default function SocialDock({ links = [], showTray = true }) {
  const entranceAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entranceAnim, {
      toValue: 1,
      duration: 520,
      delay: 180,
      useNativeDriver: Platform.OS !== "web",
    }).start();

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: Platform.OS !== "web",
        }),
      ])
    );
    floatLoop.start();

    return () => floatLoop.stop();
  }, [entranceAnim, floatAnim]);

  const dockStyle = {
    opacity: entranceAnim,
    transform: [
      {
        translateY: entranceAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  };

  const floatStyle = {
    transform: [
      {
        translateY: floatAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[styles.shell, !showTray && styles.shellInline, dockStyle]}>
      <Animated.View style={[styles.track, !showTray && styles.trackTransparent, floatStyle]}>
        {links.filter((link) => !link.hidden).map((link, index) => (
          <SocialDockButton key={link.label} link={link} index={index} />
        ))}
      </Animated.View>
    </Animated.View>
  );
}

function SocialDockButton({ link, index }) {
  const pressAnim = useRef(new Animated.Value(1)).current;
  const hoverAnim = useRef(new Animated.Value(0)).current;

  const animatePress = (toValue) => {
    Animated.spring(pressAnim, {
      toValue,
      friction: 7,
      tension: 120,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const animateHover = (toValue) => {
    Animated.spring(hoverAnim, {
      toValue,
      friction: 8,
      tension: 90,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.buttonLift,
        {
          transform: [
            { translateY: index % 2 === 0 ? -2 : 2 },
            {
              translateY: hoverAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -8],
              }),
            },
            { scale: pressAnim },
            {
              scale: hoverAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.06],
              }),
            },
          ],
        },
      ]}
    >
      <Pressable
        onPress={link.onPress}
        onPressIn={() => animatePress(0.94)}
        onPressOut={() => animatePress(1)}
        onHoverIn={isWeb ? () => animateHover(1) : undefined}
        onHoverOut={isWeb ? () => animateHover(0) : undefined}
        accessibilityRole="link"
        accessibilityLabel={link.label}
        style={({ pressed }) => [
          styles.button,
          isWeb && styles.buttonHoverReady,
          pressed && styles.buttonPressed,
        ]}
      >
        <Ionicons name={link.icon} size={22} color={brandColors.surface} />
        <Text style={styles.tooltip}>{link.label}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: "100%",
    alignItems: "center",
    marginTop: 14,
    marginBottom: 4,
  },
  shellInline: {
    width: "auto",
    marginTop: 0,
    marginBottom: 0,
  },
  track: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: brandColors.surface,
    borderWidth: 1,
    borderColor: brandColors.border,
    ...Platform.select({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
      },
      android: { elevation: 5 },
      web: {
        boxShadow: "0px 14px 30px rgba(15, 23, 42, 0.14)",
      },
    }),
  },
  trackTransparent: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
    ...Platform.select({
      ios: {
        shadowOpacity: 0,
      },
      android: { elevation: 0 },
      web: {
        boxShadow: "none",
      },
    }),
  },
  buttonLift: {
    width: 48,
    height: 54,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: brandColors.blue,
    borderWidth: 1,
    borderColor: brandColors.blueBorder,
    ...Platform.select({
      ios: {
        shadowColor: brandColors.navy,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
      web: {
        cursor: "pointer",
        boxShadow:
          "inset 0px 1px 0px rgba(255,255,255,0.28), 0px 9px 0px #041E42, 0px 14px 22px rgba(4,30,66,0.24)",
      },
    }),
  },
  buttonHoverReady: {
    transition: "filter 0.18s ease, box-shadow 0.18s ease",
    filter: "brightness(1.03)",
  },
  buttonPressed: {
    opacity: 0.92,
  },
  tooltip: {
    marginTop: 3,
    fontSize: 9,
    lineHeight: 11,
    fontWeight: "800",
    color: brandColors.surface,
    textAlign: "center",
  },
});
