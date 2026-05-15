import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import ApiService from "../utils/ApiService";
import { describeRfidReaderInput, normalizeRfidReaderInput } from "../utils/rfidReaderUtils";

const CHECKPOINTS = [
  { key: "main-gate", label: "Main Gate", floor: "ground", office: "Main Gate", icon: "log-in-outline" },
  { key: "registrar", label: "Registrar", floor: "ground", office: "Registrar", icon: "document-text-outline" },
  { key: "admin-office", label: "Administration", floor: "ground", office: "Administration", icon: "business-outline" },
  { key: "library", label: "Library", floor: "third", office: "Library", icon: "library-outline" },
  { key: "training", label: "Training", floor: "first", office: "Training", icon: "school-outline" },
  { key: "security-office", label: "Security Office", floor: "ground", office: "Security Office", icon: "shield-outline" },
];

const ACTION_OPTIONS = [
  { key: "auto", label: "Auto", subtitle: "Gate decides", icon: "sync-outline", color: "#0A3D91" },
  { key: "check_in", label: "Check In", subtitle: "Force arrival", icon: "log-in-outline", color: "#16A34A" },
  { key: "check_out", label: "Check Out", subtitle: "Force departure", icon: "log-out-outline", color: "#DC2626" },
  { key: "location", label: "Location", subtitle: "Track movement", icon: "location-outline", color: "#7C3AED" },
];

const ALLOWED_ROLES = new Set(["admin", "security", "guard", "staff"]);

const formatDateTime = (value) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatRoleLabel = (role = "") =>
  String(role || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase()) || "User";

const getActionMeta = (actionKey = "auto") =>
  ACTION_OPTIONS.find((item) => item.key === actionKey) || ACTION_OPTIONS[0];

const getResultTone = (result) => {
  if (!result) return { background: "#EFF6FF", border: "#BFDBFE", icon: "#0A3D91", label: "Ready" };
  if (!result.success) return { background: "#FEF2F2", border: "#FCA5A5", icon: "#B91C1C", label: "Blocked" };
  if (String(result.action || "").includes("check_out")) {
    return { background: "#FFF7ED", border: "#FDBA74", icon: "#C2410C", label: "Checked Out" };
  }
  if (String(result.action || "").includes("location")) {
    return { background: "#F5F3FF", border: "#C4B5FD", icon: "#7C3AED", label: "Location Updated" };
  }
  return { background: "#F0FDF4", border: "#86EFAC", icon: "#166534", label: "Checked In" };
};

export default function NFCScanScreen({ navigation }) {
  const cardInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selectedCheckpointKey, setSelectedCheckpointKey] = useState(CHECKPOINTS[0].key);
  const [selectedAction, setSelectedAction] = useState("auto");
  const [cardId, setCardId] = useState("");
  const [stationEvents, setStationEvents] = useState([]);
  const [latestResult, setLatestResult] = useState(null);

  const selectedCheckpoint = useMemo(
    () => CHECKPOINTS.find((checkpoint) => checkpoint.key === selectedCheckpointKey) || CHECKPOINTS[0],
    [selectedCheckpointKey],
  );
  const selectedActionMeta = useMemo(() => getActionMeta(selectedAction), [selectedAction]);
  const latestTone = useMemo(() => getResultTone(latestResult), [latestResult]);

  const loadUser = async () => {
    try {
      const currentUser =
        (await ApiService.getCurrentUser()) ||
        (await ApiService.restoreCurrentUserFromToken());
      if (!currentUser) {
        navigation.replace("Login");
        return;
      }
      setUser(currentUser);
    } catch (error) {
      console.error("Load checkpoint user error:", error);
      Alert.alert("Error", "Failed to load checkpoint station user.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (loading) return undefined;
    const timer = setTimeout(() => cardInputRef.current?.focus?.(), 350);
    return () => clearTimeout(timer);
  }, [loading]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadUser();
    } finally {
      setRefreshing(false);
    }
  };

  const recordLocalEvent = (event) => {
    setStationEvents((currentEvents) => [event, ...currentEvents].slice(0, 8));
  };

  const focusReader = () => cardInputRef.current?.focus?.();

  const handleSubmitTap = async (scannedValue = cardId) => {
    const normalizedCardId = normalizeRfidReaderInput(scannedValue);
    if (!normalizedCardId) {
      Alert.alert("Card Required", "Enter or scan the NFC card UID first.");
      return;
    }

    setBusy(true);
    try {
      const response = await ApiService.submitCheckpointTap({
        nfcCardId: normalizedCardId,
        action: selectedAction,
        floor: selectedCheckpoint.floor,
        office: selectedCheckpoint.office,
        checkpointId: selectedCheckpoint.key,
        checkpointName: selectedCheckpoint.label,
        deviceId: "mobile-checkpoint-station",
      });

      const event = {
        success: true,
        message: response?.message || "Checkpoint tap processed.",
        timestamp: new Date().toISOString(),
        checkpoint: selectedCheckpoint.label,
        action: response?.action || selectedAction,
        userType: response?.userType || response?.user?.role || "visitor",
        name:
          response?.user?.name ||
          response?.visitor?.fullName ||
          response?.attendance?.name ||
          "Campus user",
        status:
          response?.attendance?.status ||
          response?.visitor?.status ||
          response?.currentLocation?.statusLabel ||
          "processed",
        raw: response,
      };

      setLatestResult(event);
      recordLocalEvent(event);
      setCardId("");
      focusReader();
    } catch (error) {
      const failedEvent = {
        success: false,
        message: error?.message || "Checkpoint tap failed.",
        timestamp: new Date().toISOString(),
        checkpoint: selectedCheckpoint.label,
        action: selectedAction,
        userType: "unknown",
        name: normalizedCardId,
        status: "denied",
      };
      setLatestResult(failedEvent);
      recordLocalEvent(failedEvent);
      Alert.alert("Tap Failed", failedEvent.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0A3D91" />
        <Text style={styles.loadingText}>Loading checkpoint station...</Text>
      </SafeAreaView>
    );
  }

  if (!user) return null;

  const isAllowed = ALLOWED_ROLES.has(String(user.role || "").toLowerCase());

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#0A3D91" />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>Checkpoint Station</Text>
            <Text style={styles.headerTitle}>NFC Tap Console</Text>
            <Text style={styles.headerSubtitle}>
              Process check-in, check-out, and checkpoint movement using the same campus attendance
              and visitor logic as the NFC hardware flow.
            </Text>
          </View>
        </View>

        <View style={styles.operatorCard}>
          <View>
            <Text style={styles.operatorLabel}>Operator</Text>
            <Text style={styles.operatorName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.operatorMeta}>{formatRoleLabel(user.role)}</Text>
          </View>
          <View style={[styles.operatorStatusBadge, !isAllowed && styles.operatorStatusBadgeWarning]}>
            <Text style={[styles.operatorStatusText, !isAllowed && styles.operatorStatusTextWarning]}>
              {isAllowed ? "Authorized" : "Read Only"}
            </Text>
          </View>
        </View>

        {!isAllowed ? (
          <View style={styles.warningCard}>
            <Ionicons name="warning-outline" size={20} color="#B45309" />
            <Text style={styles.warningText}>
              This screen is meant for admin, staff, and security checkpoint operators. Your account
              can open it, but station taps will be blocked by the backend.
            </Text>
          </View>
        ) : null}

        <View style={styles.stationLayout}>
          <View style={styles.stationPrimary}>
            <View
              style={[
                styles.tapPad,
                { backgroundColor: latestTone.background, borderColor: latestTone.border },
                busy && styles.tapPadBusy,
              ]}
            >
              <View style={[styles.tapPadIcon, { backgroundColor: `${latestTone.icon}18` }]}>
                {busy ? (
                  <ActivityIndicator size="large" color={latestTone.icon} />
                ) : (
                  <Ionicons
                    name={latestResult?.success === false ? "alert-circle-outline" : "radio-outline"}
                    size={44}
                    color={latestTone.icon}
                  />
                )}
              </View>
              <Text style={[styles.tapPadTitle, { color: latestTone.icon }]}>
                {busy ? "Processing Tap" : latestResult ? latestTone.label : "Ready To Tap"}
              </Text>
              <Text style={styles.tapPadSubtitle}>
                {latestResult?.message ||
                  "Place the card on the USB reader. The station will record the selected action immediately."}
              </Text>
              <View style={styles.tapPadMetaRow}>
                <View style={styles.tapPadMetaCard}>
                  <Text style={styles.tapPadMetaLabel}>Mode</Text>
                  <Text style={styles.tapPadMetaValue}>{selectedActionMeta.label}</Text>
                </View>
                <View style={styles.tapPadMetaCard}>
                  <Text style={styles.tapPadMetaLabel}>Checkpoint</Text>
                  <Text style={styles.tapPadMetaValue}>{selectedCheckpoint.label}</Text>
                </View>
              </View>
            </View>

            <View style={styles.readerPanel}>
              <View style={styles.readerPanelHeader}>
                <View>
                  <Text style={styles.readerPanelLabel}>USB Reader</Text>
                  <Text style={styles.readerPanelTitle}>{describeRfidReaderInput(cardId)}</Text>
                </View>
                <TouchableOpacity style={styles.focusButton} onPress={focusReader}>
                  <Ionicons name="locate-outline" size={16} color="#0A3D91" />
                  <Text style={styles.focusButtonText}>Arm</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                ref={cardInputRef}
                style={[styles.cardInput, busy && styles.cardInputBusy]}
                placeholder="Tap card on USB reader"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                autoCorrect={false}
                value={cardId}
                onChangeText={(value) => setCardId(normalizeRfidReaderInput(value))}
                onSubmitEditing={(event) => handleSubmitTap(event?.nativeEvent?.text)}
                returnKeyType="done"
                blurOnSubmit={false}
                showSoftInputOnFocus={false}
              />
              <View style={styles.readerHintCard}>
                <Ionicons name="information-circle-outline" size={16} color="#0A3D91" />
                <Text style={styles.readerHintText}>
                  Keep this field armed, then tap a card. Most USB readers type the UID and press Enter.
                </Text>
              </View>
              <View style={styles.inlineActions}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    setCardId(String(user.nfcCardId || "").toUpperCase());
                    setTimeout(focusReader, 80);
                  }}
                >
                  <Ionicons name="card-outline" size={16} color="#0A3D91" />
                  <Text style={styles.secondaryButtonText}>Use My Card</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, busy && styles.buttonDisabled]}
                  onPress={handleSubmitTap}
                  disabled={busy || !isAllowed}
                >
                  {busy ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="radio-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.primaryButtonText}>Process Tap</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.stationSide}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Check Flow</Text>
              <View style={styles.actionGrid}>
                {ACTION_OPTIONS.map((option) => {
                  const selected = option.key === selectedAction;
                  return (
                    <TouchableOpacity
                      key={option.key}
                      style={[
                        styles.actionCard,
                        selected && styles.actionCardActive,
                        selected && { borderColor: option.color },
                      ]}
                      onPress={() => {
                        setSelectedAction(option.key);
                        setTimeout(focusReader, 80);
                      }}
                    >
                      <View
                        style={[
                          styles.actionIcon,
                          { backgroundColor: selected ? option.color : "#E2E8F0" },
                        ]}
                      >
                        <Ionicons
                          name={option.icon}
                          size={18}
                          color={selected ? "#FFFFFF" : "#475569"}
                        />
                      </View>
                      <View style={styles.actionCopy}>
                        <Text style={[styles.actionLabel, selected && { color: option.color }]}>
                          {option.label}
                        </Text>
                        <Text style={styles.actionMeta}>{option.subtitle}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Checkpoint</Text>
              <View style={styles.checkpointGrid}>
                {CHECKPOINTS.map((checkpoint) => {
                  const selected = checkpoint.key === selectedCheckpointKey;
                  return (
                    <TouchableOpacity
                      key={checkpoint.key}
                      style={[styles.checkpointCard, selected && styles.checkpointCardActive]}
                      onPress={() => {
                        setSelectedCheckpointKey(checkpoint.key);
                        setTimeout(focusReader, 80);
                      }}
                    >
                      <Ionicons
                        name={checkpoint.icon}
                        size={18}
                        color={selected ? "#FFFFFF" : "#0A3D91"}
                      />
                      <View style={styles.checkpointCopy}>
                        <Text style={[styles.checkpointLabel, selected && styles.checkpointLabelActive]}>
                          {checkpoint.label}
                        </Text>
                        <Text style={[styles.checkpointMeta, selected && styles.checkpointMetaActive]}>
                          {checkpoint.floor}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={[styles.resultCard, { backgroundColor: latestTone.background, borderColor: latestTone.border }]}>
              <View style={styles.resultHeader}>
                <View style={styles.resultIconWrap}>
                  <Ionicons
                    name={latestResult?.success === false ? "close-circle" : "checkmark-circle"}
                    size={26}
                    color={latestTone.icon}
                  />
                </View>
                <View style={styles.resultCopy}>
                  <Text style={styles.resultTitle}>{latestResult?.name || "No tap recorded"}</Text>
                  <Text style={styles.resultSubtitle}>
                    {latestResult?.message || "The next check-in or check-out result will appear here."}
                  </Text>
                </View>
              </View>
              <View style={styles.resultMetaGrid}>
                <View style={styles.resultMetaCard}>
                  <Text style={styles.resultMetaLabel}>User Type</Text>
                  <Text style={styles.resultMetaValue}>
                    {latestResult ? formatRoleLabel(latestResult.userType) : "Waiting"}
                  </Text>
                </View>
                <View style={styles.resultMetaCard}>
                  <Text style={styles.resultMetaLabel}>Action</Text>
                  <Text style={styles.resultMetaValue}>
                    {latestResult ? formatRoleLabel(latestResult.action) : selectedActionMeta.label}
                  </Text>
                </View>
                <View style={styles.resultMetaCard}>
                  <Text style={styles.resultMetaLabel}>Status</Text>
                  <Text style={styles.resultMetaValue}>
                    {latestResult ? formatRoleLabel(latestResult.status) : "Ready"}
                  </Text>
                </View>
                <View style={styles.resultMetaCard}>
                  <Text style={styles.resultMetaLabel}>Time</Text>
                  <Text style={styles.resultMetaValue}>
                    {latestResult ? formatDateTime(latestResult.timestamp) : "N/A"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.flowStrip}>
          <View style={styles.flowStep}>
            <Ionicons name="options-outline" size={18} color="#0A3D91" />
            <Text style={styles.flowText}>Select mode</Text>
          </View>
          <View style={styles.flowStep}>
            <Ionicons name="radio-outline" size={18} color="#0A3D91" />
            <Text style={styles.flowText}>Tap card</Text>
          </View>
          <View style={styles.flowStep}>
            <Ionicons name="checkmark-done-outline" size={18} color="#0A3D91" />
            <Text style={styles.flowText}>Record event</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Station Feed</Text>
            <Text style={styles.sectionHint}>Current session</Text>
          </View>
          {stationEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="pulse-outline" size={34} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No checkpoint events yet</Text>
              <Text style={styles.emptyText}>
                Process a card tap to see check-in, check-out, or movement results here.
              </Text>
            </View>
          ) : (
            stationEvents.map((event, index) => (
              <View
                key={`${event.timestamp}-${index}`}
                style={[styles.feedRow, index > 0 && styles.feedRowBorder]}
              >
                <View
                  style={[
                    styles.feedIconWrap,
                    event.success ? styles.feedIconWrapSuccess : styles.feedIconWrapError,
                  ]}
                >
                  <Ionicons
                    name={event.success ? "checkmark" : "close"}
                    size={16}
                    color={event.success ? "#166534" : "#B91C1C"}
                  />
                </View>
                <View style={styles.feedCopy}>
                  <Text style={styles.feedTitle}>{event.name}</Text>
                  <Text style={styles.feedSubtitle}>
                    {formatRoleLabel(event.userType)} | {formatRoleLabel(event.action)} | {event.checkpoint}
                  </Text>
                  <Text style={styles.feedTimestamp}>{formatDateTime(event.timestamp)}</Text>
                </View>
                <View style={styles.feedStatusBadge}>
                  <Text style={styles.feedStatusText}>
                    {event.success ? "OK" : "BLOCKED"}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F4F7FB",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
  content: {
    padding: 18,
    paddingBottom: 28,
  },
  headerCard: {
    flexDirection: "row",
    gap: 14,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#EEF5FF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
  },
  headerEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0A3D91",
    textTransform: "uppercase",
  },
  headerTitle: {
    marginTop: 4,
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#475569",
  },
  operatorCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  operatorLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
  },
  operatorName: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  operatorMeta: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748B",
  },
  operatorStatusBadge: {
    borderRadius: 999,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  operatorStatusBadgeWarning: {
    backgroundColor: "#FEF3C7",
  },
  operatorStatusText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
  },
  operatorStatusTextWarning: {
    color: "#92400E",
  },
  warningCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#92400E",
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
  },
  optionRow: {
    gap: 10,
    paddingBottom: 4,
  },
  optionCard: {
    minWidth: 128,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DCE5F0",
    padding: 12,
    backgroundColor: "#F8FAFC",
    gap: 8,
  },
  optionCardActive: {
    backgroundColor: "#0A3D91",
    borderColor: "#0A3D91",
  },
  optionLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  optionLabelActive: {
    color: "#FFFFFF",
  },
  optionMeta: {
    fontSize: 12,
    color: "#64748B",
  },
  optionMetaActive: {
    color: "#D8E8FF",
  },
  actionGrid: {
    gap: 10,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DCE5F0",
    padding: 12,
    backgroundColor: "#F8FAFC",
  },
  actionCardActive: {
    borderColor: "#0A3D91",
    backgroundColor: "#EEF5FF",
  },
  actionIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCopy: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  actionLabelActive: {
    color: "#0A3D91",
  },
  actionMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },
  actionMetaActive: {
    color: "#1E40AF",
  },
  cardInput: {
    borderWidth: 1,
    borderColor: "#DCE5F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  cardInputBusy: {
    opacity: 0.7,
  },
  readerHintCard: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 12,
    backgroundColor: "#EEF5FF",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  readerHintText: {
    flex: 1,
    minWidth: 180,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
    color: "#0A3D91",
  },
  readerHintMeta: {
    fontSize: 11,
    fontWeight: "900",
    color: "#475569",
  },
  inlineActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    backgroundColor: "#EEF5FF",
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0A3D91",
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    backgroundColor: "#0A3D91",
    paddingVertical: 12,
  },
  primaryButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  resultCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  resultCardSuccess: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },
  resultCardError: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },
  resultHeader: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  resultIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  resultCopy: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  resultSubtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: "#475569",
  },
  resultMetaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  resultMetaCard: {
    flexGrow: 1,
    flexBasis: 140,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
  },
  resultMetaLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
  },
  resultMetaValue: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
    paddingHorizontal: 18,
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
    textAlign: "center",
  },
  feedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  feedRowBorder: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  feedIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  feedIconWrapSuccess: {
    backgroundColor: "#DCFCE7",
  },
  feedIconWrapError: {
    backgroundColor: "#FEE2E2",
  },
  feedCopy: {
    flex: 1,
  },
  feedTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },
  feedSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },
  feedTimestamp: {
    marginTop: 4,
    fontSize: 12,
    color: "#94A3B8",
  },
  feedStatusBadge: {
    borderRadius: 999,
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  feedStatusText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0A3D91",
  },
  stationLayout: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  stationPrimary: {
    flex: 1,
    flexBasis: 340,
    gap: 16,
  },
  stationSide: {
    flex: 1,
    flexBasis: 300,
  },
  tapPad: {
    minHeight: 310,
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  tapPadBusy: {
    opacity: 0.88,
  },
  tapPadIcon: {
    width: 92,
    height: 92,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  tapPadTitle: {
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },
  tapPadSubtitle: {
    marginTop: 10,
    maxWidth: 420,
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
    textAlign: "center",
  },
  tapPadMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
    alignSelf: "stretch",
  },
  tapPadMetaCard: {
    flex: 1,
    minWidth: 130,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.78)",
    padding: 12,
  },
  tapPadMetaLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
  },
  tapPadMetaValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "900",
    color: "#0F172A",
  },
  readerPanel: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
  },
  readerPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  readerPanelLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
  },
  readerPanelTitle: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: "900",
    color: "#0F172A",
  },
  focusButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    backgroundColor: "#EEF5FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  focusButtonText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0A3D91",
  },
  checkpointGrid: {
    gap: 10,
  },
  checkpointCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#DCE5F0",
    backgroundColor: "#F8FAFC",
    padding: 12,
  },
  checkpointCardActive: {
    backgroundColor: "#0A3D91",
    borderColor: "#0A3D91",
  },
  checkpointCopy: {
    flex: 1,
  },
  checkpointLabel: {
    fontSize: 13,
    fontWeight: "900",
    color: "#0F172A",
  },
  checkpointLabelActive: {
    color: "#FFFFFF",
  },
  checkpointMeta: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },
  checkpointMetaActive: {
    color: "#D8E8FF",
  },
  flowStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 12,
    marginBottom: 16,
  },
  flowStep: {
    flex: 1,
    minWidth: 110,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  flowText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0F172A",
  },
});
