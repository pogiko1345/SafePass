import React from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ICON_BY_TYPE = {
  success: "checkmark-circle-outline",
  error: "close-circle-outline",
  warning: "alert-circle-outline",
  info: "information-circle-outline",
};

const COLOR_BY_TYPE = {
  success: "#047857",
  error: "#DC2626",
  warning: "#D97706",
  info: "#0A3D91",
};

export default function ConfirmModal({
  visible,
  title = "Confirm action",
  message = "",
  type = "info",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) {
  const accent = COLOR_BY_TYPE[type] || COLOR_BY_TYPE.info;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: `${accent}12`, borderColor: `${accent}30` }]}>
            <Ionicons name={ICON_BY_TYPE[type] || ICON_BY_TYPE.info} size={28} color={accent} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onCancel}
              disabled={loading}
              activeOpacity={0.84}
            >
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.confirmButton, { backgroundColor: accent }]}
              onPress={onConfirm}
              disabled={loading}
              activeOpacity={0.84}
            >
              <Text style={styles.confirmText}>{loading ? "Please wait..." : confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.42)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 22,
    alignItems: "center",
    ...Platform.select({
      web: { boxShadow: "0px 24px 60px rgba(15, 23, 42, 0.18)" },
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.16,
        shadowRadius: 28,
      },
      android: { elevation: 6 },
    }),
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#64748B",
    textAlign: "center",
  },
  actions: {
    width: "100%",
    marginTop: 20,
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    minHeight: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  cancelButton: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  confirmButton: {},
  cancelText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#475569",
  },
  confirmText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#FFFFFF",
  },
});
