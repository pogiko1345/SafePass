import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TOAST_META = {
  success: { icon: "checkmark-circle", color: "#047857", background: "#ECFDF5" },
  error: { icon: "close-circle", color: "#DC2626", background: "#FEF2F2" },
  warning: { icon: "alert-circle", color: "#D97706", background: "#FFFBEB" },
  info: { icon: "information-circle", color: "#0A3D91", background: "#EEF5FF" },
};

export default function ToastNotice({
  visible,
  title = "Notice",
  message = "",
  type = "info",
  timestamp,
  onClose,
  duration = 4500,
  style,
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const meta = TOAST_META[type] || TOAST_META.info;

  useEffect(() => {
    if (!visible) {
      Animated.timing(anim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: Platform.OS !== "web",
      }).start();
      return undefined;
    }

    Animated.timing(anim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: Platform.OS !== "web",
    }).start();

    const timeout = setTimeout(() => {
      onClose?.();
    }, duration);

    return () => clearTimeout(timeout);
  }, [anim, duration, onClose, visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        style,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [-10, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: meta.background }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {timestamp ? <Text style={styles.timestamp}>{timestamp}</Text> : null}
        </View>
        {message ? (
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        ) : null}
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.72}>
        <Ionicons name="close" size={16} color="#64748B" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 999,
    width: "100%",
    maxWidth: 390,
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Platform.select({
      web: { boxShadow: "0px 18px 40px rgba(15, 23, 42, 0.16)" },
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.14,
        shadowRadius: 22,
      },
      android: { elevation: 5 },
    }),
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
  },
  timestamp: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
  },
  message: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: "#64748B",
  },
  closeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
});
