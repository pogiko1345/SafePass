import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const BRAND = {
  blue: "#0A3D91",
  ink: "#0F172A",
  muted: "#64748B",
  line: "#E2E8F0",
  surface: "#FFFFFF",
  page: "#F4F7FB",
  success: "#047857",
  warning: "#B45309",
  danger: "#DC2626",
};

export const getStatusTone = (status = "") => {
  const normalized = String(status || "").toLowerCase();
  if (["inside", "present", "approved", "checked_in", "active", "granted"].includes(normalized)) {
    return { backgroundColor: "#DCFCE7", color: "#166534" };
  }
  if (["late", "pending", "adjusted", "rescheduled"].includes(normalized)) {
    return { backgroundColor: "#FEF3C7", color: "#B45309" };
  }
  if (["rejected", "expired", "denied", "no_show", "alert", "flagged"].includes(normalized)) {
    return { backgroundColor: "#FEE2E2", color: "#B91C1C" };
  }
  if (["checked_out", "completed", "cancelled", "resolved"].includes(normalized)) {
    return { backgroundColor: "#E2E8F0", color: "#475569" };
  }
  return { backgroundColor: "#EEF5FF", color: BRAND.blue };
};

export const MobileStatusBadge = ({ status, label, style }) => {
  const tone = getStatusTone(status || label);
  return (
    <View style={[mobileStyles.statusBadge, { backgroundColor: tone.backgroundColor }, style]}>
      <Text style={[mobileStyles.statusBadgeText, { color: tone.color }]}>
        {String(label || status || "Status").replace(/_/g, " ")}
      </Text>
    </View>
  );
};

export const MobileEmptyState = ({ icon = "file-tray-outline", title, message, actionLabel, onAction }) => (
  <View style={mobileStyles.emptyState}>
    <Ionicons name={icon} size={34} color="#94A3B8" />
    <Text style={mobileStyles.emptyTitle}>{title}</Text>
    {message ? <Text style={mobileStyles.emptyMessage}>{message}</Text> : null}
    {actionLabel && onAction ? (
      <TouchableOpacity style={mobileStyles.emptyAction} onPress={onAction}>
        <Text style={mobileStyles.emptyActionText}>{actionLabel}</Text>
      </TouchableOpacity>
    ) : null}
  </View>
);

export const MobileLoadingState = ({ message = "Loading..." }) => (
  <View style={mobileStyles.loadingState}>
    <ActivityIndicator size="large" color={BRAND.blue} />
    <Text style={mobileStyles.loadingText}>{message}</Text>
  </View>
);

export const MobileSearchField = ({ value, onChangeText, placeholder = "Search", onClear }) => (
  <View style={mobileStyles.searchField}>
    <Ionicons name="search-outline" size={18} color="#64748B" />
    <TextInput
      style={mobileStyles.searchInput}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      autoCapitalize="none"
    />
    {value ? (
      <TouchableOpacity onPress={onClear || (() => onChangeText(""))}>
        <Ionicons name="close-circle" size={18} color="#94A3B8" />
      </TouchableOpacity>
    ) : null}
  </View>
);

export const MobileFilterChips = ({ options = [], value, onChange }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={mobileStyles.chipScroll}
  >
    {options.map((option) => {
      const key = option.key || option.value || option;
      const label = option.label || option;
      const active = value === key;
      return (
        <TouchableOpacity
          key={key}
          style={[mobileStyles.filterChip, active && mobileStyles.filterChipActive]}
          onPress={() => onChange(key)}
        >
          <Text style={[mobileStyles.filterChipText, active && mobileStyles.filterChipTextActive]}>
            {label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
);

export const MobileBottomNav = ({ tabs = [], activeTab, onChange }) => (
  <View style={mobileStyles.bottomNav}>
    {tabs.map((tab) => {
      const active = activeTab === tab.key;
      return (
        <TouchableOpacity
          key={tab.key}
          style={mobileStyles.bottomNavItem}
          onPress={() => onChange(tab.key)}
          activeOpacity={0.82}
        >
          <Ionicons name={active ? tab.activeIcon || tab.icon : tab.icon} size={21} color={active ? BRAND.blue : "#94A3B8"} />
          <Text style={[mobileStyles.bottomNavLabel, active && mobileStyles.bottomNavLabelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

export const mobileStyles = StyleSheet.create({
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BRAND.page,
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 18,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "900",
    color: BRAND.ink,
    textAlign: "center",
  },
  emptyMessage: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: BRAND.muted,
    textAlign: "center",
  },
  emptyAction: {
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#EEF5FF",
  },
  emptyActionText: {
    fontSize: 12,
    fontWeight: "900",
    color: BRAND.blue,
  },
  searchField: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DCE5F1",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 13,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: BRAND.ink,
    paddingVertical: 10,
  },
  chipScroll: {
    gap: 8,
    paddingRight: 4,
  },
  filterChip: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE5F1",
  },
  filterChipActive: {
    backgroundColor: BRAND.blue,
    borderColor: BRAND.blue,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#475569",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  bottomNavItem: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  bottomNavLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: "#94A3B8",
  },
  bottomNavLabelActive: {
    color: BRAND.blue,
  },
});
