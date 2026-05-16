import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
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
import {
  MONITORING_MAP_FLOORS,
  MONITORING_MAP_OFFICES,
} from "../utils/monitoringMapConfig";
import { normalizeMapSettingsPayload } from "../utils/mapSettingsUtils";

const ENTRY_CHECKPOINTS = [
  { key: "main-gate", label: "Main Gate", floor: "ground", office: "Main Gate", icon: "log-in-outline" },
];

const ACTION_OPTIONS = [
  { key: "auto", label: "Auto", subtitle: "Gate decides", icon: "sync-outline", color: "#0A3D91" },
  { key: "check_in", label: "Check In", subtitle: "Force arrival", icon: "log-in-outline", color: "#16A34A" },
  { key: "check_out", label: "Check Out", subtitle: "Force departure", icon: "log-out-outline", color: "#DC2626" },
  { key: "location", label: "Location", subtitle: "Track movement", icon: "location-outline", color: "#7C3AED" },
];

const ALLOWED_ROLES = new Set(["admin", "security", "guard", "staff"]);

const CARD_SHADOW = Platform.select({
  web: { boxShadow: "0px 14px 34px rgba(15, 23, 42, 0.08)" },
  ios: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  android: { elevation: 3 },
  default: {},
});

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

const getFloorName = (floorId = "") =>
  MONITORING_MAP_FLOORS.find((floor) => floor.id === floorId)?.name || formatRoleLabel(floorId || "Floor");

const formatRoomCheckpointLabel = (room, duplicateIndexByKey) => {
  const baseName = String(room?.name || "Checkpoint").trim();
  const duplicateKey = `${room?.floor || "floor"}::${baseName.toLowerCase()}`;
  const duplicateIndex = duplicateIndexByKey.get(room?.id);
  return duplicateIndex ? `${baseName} ${duplicateIndex}` : baseName;
};

const buildCheckpointOptions = (rooms = MONITORING_MAP_OFFICES) => {
  const duplicateCounts = rooms.reduce((counts, room) => {
    const duplicateKey = `${room?.floor || "floor"}::${String(room?.name || "").trim().toLowerCase()}`;
    counts.set(duplicateKey, (counts.get(duplicateKey) || 0) + 1);
    return counts;
  }, new Map());

  const duplicateRunningCount = new Map();
  const duplicateIndexByKey = new Map();
  rooms.forEach((room) => {
    const duplicateKey = `${room?.floor || "floor"}::${String(room?.name || "").trim().toLowerCase()}`;
    if ((duplicateCounts.get(duplicateKey) || 0) <= 1) return;
    const nextIndex = (duplicateRunningCount.get(duplicateKey) || 0) + 1;
    duplicateRunningCount.set(duplicateKey, nextIndex);
    duplicateIndexByKey.set(room.id, nextIndex);
  });

  const roomCheckpoints = rooms.map((room) => ({
    key: room.id,
    label: formatRoomCheckpointLabel(room, duplicateIndexByKey),
    floor: room.floor,
    office: room.name,
    icon: room.icon || "business-outline",
  }));

  return [...ENTRY_CHECKPOINTS, ...roomCheckpoints].filter((checkpoint) => checkpoint.key && checkpoint.floor && checkpoint.office);
};

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

const getPersonDetails = (response = {}) => {
  const person = response.user || response.visitor || {};
  const role = response.userType || person.role || person.userType || "visitor";
  const normalizedRole = String(role || "").toLowerCase();
  const name =
    person.name ||
    person.fullName ||
    response.attendance?.name ||
    "Campus user";
  const program =
    person.course ||
    person.program ||
    person.department ||
    person.assignedOffice ||
    person.appointmentDepartment ||
    person.host ||
    "";
  const yearSection =
    [person.yearLevel, person.section].filter(Boolean).join(" - ") ||
    person.position ||
    person.purpose ||
    "";
  const campusId =
    person.studentId ||
    person.teacherId ||
    person.employeeId ||
    "";

  return {
    name,
    role: normalizedRole,
    program,
    yearSection,
    campusId,
    nfcCardId: person.nfcCardId || response.attendance?.nfcCardId || "",
  };
};

export default function NFCScanScreen({ navigation }) {
  const cardInputRef = useRef(null);
  const readerBufferRef = useRef("");
  const readerBufferTimerRef = useRef(null);
  const lastReaderInputAtRef = useRef(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [mapRooms, setMapRooms] = useState(MONITORING_MAP_OFFICES);
  const [selectedFloorKey, setSelectedFloorKey] = useState(MONITORING_MAP_FLOORS[0].id);
  const [selectedCheckpointKey, setSelectedCheckpointKey] = useState(ENTRY_CHECKPOINTS[0].key);
  const [selectedAction, setSelectedAction] = useState("auto");
  const [cardId, setCardId] = useState("");
  const [stationEvents, setStationEvents] = useState([]);
  const [latestResult, setLatestResult] = useState(null);

  const checkpointOptions = useMemo(() => buildCheckpointOptions(mapRooms), [mapRooms]);
  const floorCheckpointCounts = useMemo(
    () =>
      checkpointOptions.reduce((counts, checkpoint) => ({
        ...counts,
        [checkpoint.floor]: (counts[checkpoint.floor] || 0) + 1,
      }), {}),
    [checkpointOptions],
  );
  const visibleCheckpoints = useMemo(
    () => checkpointOptions.filter((checkpoint) => checkpoint.floor === selectedFloorKey),
    [checkpointOptions, selectedFloorKey],
  );
  const selectedCheckpoint = useMemo(
    () => checkpointOptions.find((checkpoint) => checkpoint.key === selectedCheckpointKey) || checkpointOptions[0],
    [checkpointOptions, selectedCheckpointKey],
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
      try {
        const mapResponse = await ApiService.getMapSettings();
        if (mapResponse?.success) {
          const normalizedMapSettings = normalizeMapSettingsPayload(mapResponse.mapSettings);
          setMapRooms(normalizedMapSettings.rooms);
        }
      } catch (mapError) {
        console.log("Checkpoint map settings fallback:", mapError?.message || mapError);
        setMapRooms(MONITORING_MAP_OFFICES);
      }
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

  useEffect(() => {
    if (!checkpointOptions.length) return;
    const currentCheckpoint = checkpointOptions.find((checkpoint) => checkpoint.key === selectedCheckpointKey);
    if (currentCheckpoint) {
      setSelectedFloorKey(currentCheckpoint.floor);
      return;
    }
    const fallbackCheckpoint =
      checkpointOptions.find((checkpoint) => checkpoint.floor === selectedFloorKey) ||
      checkpointOptions[0];
    setSelectedCheckpointKey(fallbackCheckpoint.key);
    setSelectedFloorKey(fallbackCheckpoint.floor);
  }, [checkpointOptions, selectedCheckpointKey, selectedFloorKey]);

  useEffect(() => {
    if (loading || Platform.OS !== "web") return undefined;

    const armReader = () => {
      if (document.activeElement !== cardInputRef.current) {
        cardInputRef.current?.focus?.();
      }
    };

    const handleDocumentPointer = () => {
      window.setTimeout(armReader, 50);
    };

    const handleDocumentKeyDown = (event) => {
      const activeElement = document.activeElement;
      const isTypingTarget =
        activeElement &&
        ["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName) &&
        activeElement !== cardInputRef.current;

      if (isTypingTarget || event.ctrlKey || event.metaKey || event.altKey || busy) return;

      if (event.key === "Enter") {
        const bufferedUid = readerBufferRef.current;
        readerBufferRef.current = "";
        if (bufferedUid) {
          event.preventDefault();
          handleSubmitTap(bufferedUid);
        }
        return;
      }

      if (event.key?.length === 1) {
        readerBufferRef.current += event.key;
        window.clearTimeout(readerBufferTimerRef.current);
        readerBufferTimerRef.current = window.setTimeout(() => {
          readerBufferRef.current = "";
        }, 350);
      }
    };

    armReader();
    window.addEventListener("focus", armReader);
    document.addEventListener("pointerdown", handleDocumentPointer);
    document.addEventListener("keydown", handleDocumentKeyDown);

    return () => {
      window.removeEventListener("focus", armReader);
      document.removeEventListener("pointerdown", handleDocumentPointer);
      document.removeEventListener("keydown", handleDocumentKeyDown);
      window.clearTimeout(readerBufferTimerRef.current);
    };
  }, [loading, busy, selectedAction, selectedCheckpointKey]);

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

  const focusReader = () => {
    globalThis.requestAnimationFrame?.(() => cardInputRef.current?.focus?.());
    setTimeout(() => cardInputRef.current?.focus?.(), 50);
  };

  const handleCardInputChange = (value) => {
    const normalizedValue = normalizeRfidReaderInput(value);
    const now = Date.now();
    const previousValue = cardId;
    const shouldStartFreshScan =
      previousValue &&
      normalizedValue.length > previousValue.length &&
      normalizedValue.startsWith(previousValue) &&
      now - lastReaderInputAtRef.current > 250;
    const nextValue = shouldStartFreshScan
      ? normalizedValue.slice(previousValue.length)
      : normalizedValue;

    lastReaderInputAtRef.current = now;
    setCardId(nextValue);
  };

  const handleSelectFloor = (floorKey) => {
    const firstCheckpointForFloor =
      checkpointOptions.find((checkpoint) => checkpoint.floor === floorKey) ||
      checkpointOptions[0];
    setSelectedFloorKey(floorKey);
    if (firstCheckpointForFloor) {
      setSelectedCheckpointKey(firstCheckpointForFloor.key);
    }
    setTimeout(focusReader, 80);
  };

  const handleSubmitTap = async (scannedValue = cardId) => {
    const normalizedCardId = normalizeRfidReaderInput(scannedValue);
    if (!normalizedCardId) {
      Alert.alert("Card Required", "Enter or scan the NFC card UID first.");
      return;
    }

    readerBufferRef.current = "";
    setCardId("");
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
      const personDetails = getPersonDetails(response);

      const event = {
        success: true,
        message: response?.message || "Checkpoint tap processed.",
        timestamp: new Date().toISOString(),
        checkpoint: selectedCheckpoint.label,
        action: response?.action || selectedAction,
        userType: personDetails.role,
        name: personDetails.name,
        program: personDetails.program,
        yearSection: personDetails.yearSection,
        campusId: personDetails.campusId,
        nfcCardId: personDetails.nfcCardId || normalizedCardId,
        status:
          response?.attendance?.status ||
          response?.visitor?.status ||
          response?.currentLocation?.statusLabel ||
          "processed",
        raw: response,
      };

      setLatestResult(event);
      recordLocalEvent(event);
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
      setCardId("");
      focusReader();
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
          <View style={styles.headerMainRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color="#0A3D91" />
            </TouchableOpacity>
            <View style={styles.headerCopy}>
              <Text style={styles.headerEyebrow}>Checkpoint Station</Text>
              <Text style={styles.headerTitle}>NFC Tap Console</Text>
              <Text style={styles.headerSubtitle}>
                Process campus attendance, visitor arrival, departure, and location taps from one
                dedicated reader station.
              </Text>
            </View>
            <View style={[styles.headerBadge, !isAllowed && styles.headerBadgeWarning]}>
              <Ionicons
                name={isAllowed ? "shield-checkmark-outline" : "alert-circle-outline"}
                size={17}
                color={isAllowed ? "#BBF7D0" : "#FDE68A"}
              />
              <Text style={[styles.headerBadgeText, !isAllowed && styles.headerBadgeTextWarning]}>
                {isAllowed ? "Authorized" : "Read Only"}
              </Text>
            </View>
          </View>

          <View style={styles.headerMetricRow}>
            <View style={styles.headerMetric}>
              <Text style={styles.headerMetricLabel}>Mode</Text>
              <Text style={styles.headerMetricValue}>{selectedActionMeta.label}</Text>
            </View>
            <View style={styles.headerMetric}>
              <Text style={styles.headerMetricLabel}>Checkpoint</Text>
              <Text style={styles.headerMetricValue}>{selectedCheckpoint.label}</Text>
            </View>
            <View style={styles.headerMetric}>
              <Text style={styles.headerMetricLabel}>Session Events</Text>
              <Text style={styles.headerMetricValue}>{stationEvents.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.operatorCard}>
          <View style={styles.operatorIdentity}>
            <View style={styles.operatorAvatar}>
              <Text style={styles.operatorAvatarText}>
                {`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.trim() || "SO"}
              </Text>
            </View>
            <View>
            <Text style={styles.operatorLabel}>Operator</Text>
            <Text style={styles.operatorName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.operatorMeta}>{formatRoleLabel(user.role)}</Text>
            </View>
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
              <View style={styles.tapPadStatusRow}>
                <View style={[styles.tapPadStatusPill, { borderColor: latestTone.border }]}>
                  <View style={[styles.tapPadStatusDot, { backgroundColor: latestTone.icon }]} />
                  <Text style={[styles.tapPadStatusText, { color: latestTone.icon }]}>
                    {busy ? "Reader Processing" : "Reader Armed"}
                  </Text>
                </View>
                <Text style={styles.tapPadTimestamp}>
                  {latestResult ? formatDateTime(latestResult.timestamp) : "No taps yet"}
                </Text>
              </View>
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
                onChangeText={handleCardInputChange}
                onSubmitEditing={(event) => handleSubmitTap(event?.nativeEvent?.text)}
                returnKeyType="done"
                blurOnSubmit={false}
                showSoftInputOnFocus={false}
              />
              <View style={styles.readerHintCard}>
                <Ionicons name="information-circle-outline" size={16} color="#0A3D91" />
                <Text style={styles.readerHintText}>
                  This station auto-arms the reader. Tap a card anywhere on this screen.
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
                  onPress={() => handleSubmitTap()}
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
              <View style={styles.sectionHeaderRow}>
                <View>
                  <Text style={styles.sectionTitle}>Checkpoint</Text>
                  <Text style={styles.sectionSubtitle}>Choose a floor, then select the office reader location.</Text>
                </View>
                <View style={styles.floorCountBadge}>
                  <Text style={styles.floorCountText}>{visibleCheckpoints.length} offices</Text>
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.floorTabRow}
              >
                {MONITORING_MAP_FLOORS.map((floor) => {
                  const selected = floor.id === selectedFloorKey;
                  const count = floorCheckpointCounts[floor.id] || 0;
                  return (
                    <TouchableOpacity
                      key={floor.id}
                      style={[styles.floorTab, selected && styles.floorTabActive]}
                      onPress={() => handleSelectFloor(floor.id)}
                    >
                      <Ionicons
                        name={floor.icon}
                        size={16}
                        color={selected ? "#FFFFFF" : "#0A3D91"}
                      />
                      <Text style={[styles.floorTabText, selected && styles.floorTabTextActive]}>
                        {floor.name}
                      </Text>
                      <View style={[styles.floorTabBadge, selected && styles.floorTabBadgeActive]}>
                        <Text style={[styles.floorTabBadgeText, selected && styles.floorTabBadgeTextActive]}>
                          {count}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <View style={styles.checkpointGrid}>
                {visibleCheckpoints.map((checkpoint) => {
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
                          {getFloorName(checkpoint.floor)}
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
                  {latestResult?.program || latestResult?.yearSection || latestResult?.campusId ? (
                    <Text style={styles.resultPersonMeta}>
                      {[latestResult.program, latestResult.yearSection, latestResult.campusId]
                        .filter(Boolean)
                        .join(" | ")}
                    </Text>
                  ) : null}
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
                <View style={styles.resultMetaCard}>
                  <Text style={styles.resultMetaLabel}>Program / Area</Text>
                  <Text style={styles.resultMetaValue}>
                    {latestResult?.program || "N/A"}
                  </Text>
                </View>
                <View style={styles.resultMetaCard}>
                  <Text style={styles.resultMetaLabel}>Year / Section</Text>
                  <Text style={styles.resultMetaValue}>
                    {latestResult?.yearSection || "N/A"}
                  </Text>
                </View>
                <View style={styles.resultMetaCard}>
                  <Text style={styles.resultMetaLabel}>NFC UID</Text>
                  <Text style={styles.resultMetaValue}>
                    {latestResult?.nfcCardId || "N/A"}
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
                    {[formatRoleLabel(event.userType), event.program, event.yearSection, formatRoleLabel(event.action), event.checkpoint]
                      .filter(Boolean)
                      .join(" | ")}
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
    backgroundColor: "#F3F6FA",
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
    width: "100%",
    maxWidth: 1480,
    alignSelf: "center",
    padding: 22,
    paddingBottom: 34,
  },
  headerCard: {
    backgroundColor: "#071D3A",
    borderRadius: 24,
    padding: 22,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#123C74",
    ...CARD_SHADOW,
  },
  headerMainRow: {
    flexDirection: "row",
    gap: 16,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCopy: {
    flex: 1,
    minWidth: 260,
  },
  headerEyebrow: {
    fontSize: 12,
    fontWeight: "900",
    color: "#93C5FD",
    textTransform: "uppercase",
  },
  headerTitle: {
    marginTop: 4,
    fontSize: 30,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#D8E8FF",
    maxWidth: 760,
  },
  headerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    backgroundColor: "rgba(22, 163, 74, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(187, 247, 208, 0.34)",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  headerBadgeWarning: {
    backgroundColor: "rgba(245, 158, 11, 0.16)",
    borderColor: "rgba(253, 230, 138, 0.36)",
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#DCFCE7",
  },
  headerBadgeTextWarning: {
    color: "#FEF3C7",
  },
  headerMetricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  headerMetric: {
    flex: 1,
    minWidth: 160,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(216, 232, 255, 0.18)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerMetricLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#93C5FD",
    textTransform: "uppercase",
  },
  headerMetricValue: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  operatorCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...CARD_SHADOW,
  },
  operatorIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  operatorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#0A3D91",
    alignItems: "center",
    justifyContent: "center",
  },
  operatorAvatarText: {
    fontSize: 15,
    fontWeight: "900",
    color: "#FFFFFF",
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
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...CARD_SHADOW,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 12,
  },
  sectionSubtitle: {
    marginTop: -6,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    color: "#64748B",
  },
  floorCountBadge: {
    borderRadius: 999,
    backgroundColor: "#EEF5FF",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  floorCountText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#0A3D91",
  },
  floorTabRow: {
    gap: 8,
    paddingBottom: 12,
  },
  floorTab: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9E2EE",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  floorTabActive: {
    backgroundColor: "#0A3D91",
    borderColor: "#0A3D91",
  },
  floorTabText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0F172A",
  },
  floorTabTextActive: {
    color: "#FFFFFF",
  },
  floorTabBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 6,
  },
  floorTabBadgeActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  floorTabBadgeText: {
    fontSize: 11,
    fontWeight: "900",
    color: "#475569",
  },
  floorTabBadgeTextActive: {
    color: "#FFFFFF",
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
    borderColor: "#D9E2EE",
    padding: 12,
    backgroundColor: "#FBFCFE",
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
    borderColor: "#CBD5E1",
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
    backgroundColor: "#F0F7FF",
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
    borderColor: "#C7DAF8",
    backgroundColor: "#F0F7FF",
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
    ...Platform.select({
      web: { boxShadow: "0px 10px 20px rgba(10, 61, 145, 0.22)" },
      android: { elevation: 2 },
      default: {},
    }),
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
    ...CARD_SHADOW,
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
  resultPersonMeta: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "800",
    color: "#0A3D91",
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
    gap: 20,
    marginBottom: 16,
  },
  stationPrimary: {
    flex: 1.15,
    flexBasis: 520,
    gap: 16,
  },
  stationSide: {
    flex: 0.85,
    flexBasis: 360,
  },
  tapPad: {
    minHeight: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 26,
    alignItems: "center",
    justifyContent: "center",
    ...CARD_SHADOW,
  },
  tapPadBusy: {
    opacity: 0.88,
  },
  tapPadIcon: {
    width: 104,
    height: 104,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.72)",
  },
  tapPadTitle: {
    fontSize: 32,
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
  tapPadStatusRow: {
    position: "absolute",
    top: 18,
    left: 18,
    right: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  tapPadStatusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: "rgba(255,255,255,0.74)",
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  tapPadStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  tapPadStatusText: {
    fontSize: 12,
    fontWeight: "900",
  },
  tapPadTimestamp: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748B",
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
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...CARD_SHADOW,
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
    borderColor: "#D9E2EE",
    backgroundColor: "#FBFCFE",
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
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...CARD_SHADOW,
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
