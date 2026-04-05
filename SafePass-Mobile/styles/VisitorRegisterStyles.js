import { StyleSheet, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isSmallPhone = width <= 375;
const isMediumPhone = width > 375 && width <= 414;
const isTablet = width >= 768 && width < 1024;

const fontSizes = {
  xs: isSmallPhone ? 11 : 12,
  sm: isSmallPhone ? 12 : 13,
  base: isSmallPhone ? 14 : 15,
  lg: isSmallPhone ? 16 : 18,
  xl: isSmallPhone ? 20 : 22,
  xxl: isSmallPhone ? 24 : 28,
};

const spacing = {
  xs: isSmallPhone ? 4 : 6,
  sm: isSmallPhone ? 8 : 10,
  base: isSmallPhone ? 12 : 16,
  lg: isSmallPhone ? 16 : 20,
  xl: isSmallPhone ? 20 : 24,
  xxl: isSmallPhone ? 24 : 30,
};

export default StyleSheet.create({
  // ============ CONTAINERS ============
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  keyboardView: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },

  // ============ HEADER ============
  header: {
    width: "100%",
    paddingTop: Platform.select({ ios: 50, android: 40, web: 40 }),
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },
  headerButtons: {
    position: "absolute",
    top: Platform.select({ ios: 50, android: 40, web: 40 }),
    left: spacing.base,
    right: spacing.base,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    ...(isWeb && {
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: "rgba(255,255,255,0.3)",
        transform: "scale(1.05)",
      },
    }),
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },
  headerIconContainer: {
    marginBottom: spacing.sm,
    borderRadius: 32,
    overflow: "hidden",
  },
  headerIconGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  headerTitle: {
    fontSize: fontSizes.xxl,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: fontSizes.sm,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "400",
  },

  // ============ PROGRESS ============
  progressContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  progressTitle: {
    fontSize: fontSizes.sm,
    fontWeight: "500",
    color: "#64748B",
  },
  progressPercentage: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: "#059669",
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#059669",
    borderRadius: 2,
  },

  // ============ STEP INDICATORS ============
  stepIndicatorContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  stepWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: {
    backgroundColor: "#059669",
  },
  stepCircleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94A3B8",
  },
  stepCircleTextActive: {
    color: "#FFFFFF",
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: "#E2E8F0",
    marginHorizontal: spacing.xs,
  },
  stepConnectorActive: {
    backgroundColor: "#059669",
  },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94A3B8",
  },
  stepLabelActive: {
    color: "#059669",
  },

  // ============ CONTENT ============
  content: {
    padding: spacing.lg,
    ...(isWeb && { maxWidth: 600, alignSelf: "center", width: "100%" }),
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  sectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: 4,
  },
  sectionBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
    color: "#059669",
  },
  formGrid: {
    gap: spacing.base,
    marginBottom: spacing.xl,
  },

  // ============ ID UPLOAD ============
  idUploadSection: {
    marginBottom: spacing.base,
  },
  idCardContainer: {
    marginBottom: spacing.sm,
  },
  idCardTitle: {
    fontSize: fontSizes.base,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  idCardSubtitle: {
    fontSize: fontSizes.sm,
    color: "#64748B",
  },

  // ============ FORM CARD ============
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  formCardFocused: {
    borderColor: "#059669",
    borderWidth: 2,
  },
  formCardError: {
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  cardIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.xs,
  },
  cardLabel: {
    fontSize: fontSizes.base,
    fontWeight: "600",
    color: "#0F172A",
    flex: 1,
  },
  cardLabelSmall: {
    fontSize: fontSizes.sm,
    fontWeight: "600",
    color: "#0F172A",
    flex: 1,
  },
  requiredBadge: {
    fontSize: 10,
    fontWeight: "600",
    color: "#EF4444",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 12,
  },
  optionalBadge: {
    fontSize: 10,
    fontWeight: "500",
    color: "#64748B",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 12,
  },

  // ============ INPUTS ============
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: spacing.base,
    minHeight: 48,
    gap: spacing.xs,
  },
  inputContainerFocused: {
    borderColor: "#059669",
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
  },
  inputContainerError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  input: {
    flex: 1,
    fontSize: fontSizes.base,
    color: "#0F172A",
    paddingVertical: 12,
  },
  errorText: {
    fontSize: fontSizes.xs,
    color: "#EF4444",
    marginTop: 4,
    marginLeft: spacing.xs,
  },
  inputHint: {
    fontSize: fontSizes.xs,
    color: "#64748B",
    marginTop: 2,
  },

  // ============ UPLOAD AREA ============
  uploadArea: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    minHeight: 160,
    ...(isWeb && {
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        borderColor: "#059669",
        backgroundColor: "#ECFDF5",
      },
    }),
  },
  uploadAreaError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  uploadPlaceholder: {
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  uploadTitle: {
    fontSize: fontSizes.base,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 2,
  },
  uploadSubtitle: {
    fontSize: fontSizes.xs,
    color: "#64748B",
  },
  uploadPreview: {
    width: "100%",
    height: 160,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoText: {
    color: "#FFFFFF",
    fontSize: fontSizes.sm,
    fontWeight: "600",
    marginTop: 4,
  },

  // ============ SCAN BUTTON ============
  scanButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: spacing.sm,
    ...(isWeb && {
      transition: "transform 0.2s ease",
      ":hover": {
        transform: "scale(1.02)",
      },
    }),
  },
  scanGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: spacing.xs,
  },
  scanButtonText: {
    color: "#FFFFFF",
    fontSize: fontSizes.sm,
    fontWeight: "600",
  },
  scanningContainer: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: spacing.base,
    marginTop: spacing.sm,
    alignItems: "center",
    gap: spacing.xs,
  },
  scanningText: {
    fontSize: fontSizes.sm,
    color: "#059669",
    fontWeight: "500",
  },
  scanProgressContainer: {
    width: "100%",
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  scanProgressBar: {
    height: "100%",
    backgroundColor: "#059669",
    borderRadius: 2,
  },

  // ============ DROPDOWN ============
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: spacing.base,
    paddingVertical: 14,
    minHeight: 48,
    ...(isWeb && {
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        borderColor: "#059669",
        backgroundColor: "#ECFDF5",
      },
    }),
  },
  dropdownButtonText: {
    fontSize: fontSizes.base,
    color: "#0F172A",
    flex: 1,
  },
  dropdownButtonPlaceholder: {
    color: "#94A3B8",
  },

  // ============ PICKER MODAL ============
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    ...(isWeb && { justifyContent: "center" }),
  },
  pickerModalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    ...(isWeb && { borderRadius: 24, maxWidth: 400, alignSelf: "center", width: "90%" }),
  },
  pickerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  pickerModalTitle: {
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: "#0F172A",
  },
  pickerModalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.lg,
  },
  pickerModalOptionActive: {
    backgroundColor: "#ECFDF5",
  },
  pickerModalOptionText: {
    fontSize: fontSizes.base,
    color: "#0F172A",
  },
  pickerModalOptionTextActive: {
    color: "#059669",
    fontWeight: "500",
  },

  // ============ COMPACT DATE/TIME ROW ============
  formRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  halfCard: {
    flex: 1,
    marginHorizontal: 0,
    padding: spacing.sm,
  },
  datePickerButtonCompact: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    height: 40,
    marginTop: 2,
    gap: 6,
    ...(isWeb && {
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        borderColor: "#059669",
        backgroundColor: "#ECFDF5",
      },
    }),
  },
  datePickerTextCompact: {
    fontSize: fontSizes.sm,
    color: "#0F172A",
    flex: 1,
  },
  webDateInputCompact: {
    width: "100%",
    padding: 8,
    borderRadius: 12,
    border: "1px solid #E2E8F0",
    fontSize: fontSizes.sm,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    marginTop: 2,
    fontFamily: "inherit",
    ...(isWeb && {
      transition: "all 0.2s ease",
      ":focus": {
        borderColor: "#059669",
        outline: "none",
        boxShadow: "0 0 0 2px rgba(5, 150, 105, 0.1)",
      },
    }),
  },
  webTimeInputCompact: {
    width: "100%",
    padding: 8,
    borderRadius: 12,
    border: "1px solid #E2E8F0",
    fontSize: fontSizes.sm,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    marginTop: 2,
    fontFamily: "inherit",
    ...(isWeb && {
      transition: "all 0.2s ease",
      ":focus": {
        borderColor: "#059669",
        outline: "none",
        boxShadow: "0 0 0 2px rgba(5, 150, 105, 0.1)",
      },
    }),
  },

  // ============ REVIEW CARD ============
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    gap: spacing.xs,
  },
  reviewHeaderText: {
    fontSize: fontSizes.base,
    fontWeight: "600",
    color: "#0F172A",
    flex: 1,
  },
  reviewItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.xs,
  },
  reviewLabel: {
    fontSize: fontSizes.sm,
    color: "#64748B",
  },
  reviewValue: {
    fontSize: fontSizes.sm,
    color: "#0F172A",
    fontWeight: "500",
  },
  reviewImage: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginTop: spacing.xs,
  },

  // ============ EDIT BUTTON ============
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: 4,
    ...(isWeb && {
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: "#D1FAE5",
        transform: "scale(1.02)",
      },
    }),
  },
  editButtonText: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
    color: "#059669",
  },

  // ============ CONTINUE BUTTON ============
  continueButton: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: spacing.base,
    ...(isWeb && {
      cursor: "pointer",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      ":hover": {
        transform: "translateY(-2px)",
        boxShadow: "0px 8px 20px rgba(5, 150, 105, 0.3)",
      },
      ":active": {
        transform: "translateY(0)",
      },
    }),
  },
  gradientButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: spacing.xs,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: fontSizes.base,
    fontWeight: "600",
  },

  // ============ MODALS ============
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  privacyModalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    width: "90%",
    maxWidth: 500,
    maxHeight: "80%",
    overflow: "hidden",
  },
  privacyModalHeader: {
    padding: spacing.lg,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  privacyIconContainer: {
    marginBottom: spacing.sm,
    borderRadius: 30,
    overflow: "hidden",
  },
  privacyIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  privacyModalTitle: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  privacyModalSubtitle: {
    fontSize: fontSizes.sm,
    color: "#64748B",
    textAlign: "center",
  },
  privacyModalContent: {
    padding: spacing.lg,
    maxHeight: 400,
  },
  privacySection: {
    marginBottom: spacing.lg,
  },
  privacySectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  privacySectionTitle: {
    fontSize: fontSizes.base,
    fontWeight: "600",
    color: "#0F172A",
  },
  privacySectionText: {
    fontSize: fontSizes.sm,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 2,
    paddingLeft: 28,
  },
  privacyCheckboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },
  privacyCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#059669",
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.sm,
    backgroundColor: "#FFFFFF",
  },
  privacyCheckboxChecked: {
    backgroundColor: "#059669",
  },
  privacyCheckboxText: {
    fontSize: fontSizes.sm,
    color: "#475569",
    flex: 1,
  },
  privacyLinkText: {
    color: "#059669",
    fontWeight: "600",
  },
  privacyModalActions: {
    flexDirection: "row",
    padding: spacing.base,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  privacyDeclineButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  privacyDeclineText: {
    fontSize: fontSizes.base,
    fontWeight: "600",
    color: "#64748B",
  },
  privacyAcceptButton: {
    flex: 2,
    borderRadius: 14,
    overflow: "hidden",
  },
  privacyAcceptButtonDisabled: {
    opacity: 0.6,
  },
  privacyAcceptGradient: {
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  privacyAcceptText: {
    fontSize: fontSizes.base,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  // ============ SUCCESS MODAL ============
  successModalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: spacing.xl,
    alignItems: "center",
    width: "90%",
    maxWidth: 400,
  },
  successIconContainer: {
    marginBottom: spacing.base,
    borderRadius: 50,
    overflow: "hidden",
  },
  successIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  successTitle: {
    fontSize: fontSizes.xl,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  successMessage: {
    fontSize: fontSizes.sm,
    color: "#64748B",
    textAlign: "center",
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  credentialsBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: spacing.base,
    marginBottom: spacing.base,
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  credentialsTitle: {
    fontSize: fontSizes.base,
    fontWeight: "600",
    color: "#059669",
    marginBottom: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  credentialsInfo: {
    fontSize: fontSizes.sm,
    color: "#64748B",
    marginBottom: spacing.sm,
  },
  credentialRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  credentialLabel: {
    fontSize: fontSizes.sm,
    fontWeight: "500",
    color: "#475569",
    width: 70,
  },
  credentialValue: {
    fontSize: fontSizes.sm,
    color: "#0F172A",
    fontWeight: "500",
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  copyButton: {
    padding: spacing.xs,
    borderRadius: 8,
    backgroundColor: "#ECFDF5",
  },
  successButton: {
    borderRadius: 14,
    overflow: "hidden",
    width: "100%",
  },
  successGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    gap: spacing.xs,
  },
  successButtonText: {
    color: "#FFFFFF",
    fontSize: fontSizes.base,
    fontWeight: "600",
  },
});