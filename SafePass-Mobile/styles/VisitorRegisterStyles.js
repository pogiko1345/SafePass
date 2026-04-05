import { StyleSheet, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isSmallPhone = width <= 375;
const isMediumPhone = width > 375 && width <= 414;
const isTablet = width >= 768 && width < 1024;

// Responsive font sizes
const fontSizes = {
  xs: isSmallPhone ? 11 : 12,
  sm: isSmallPhone ? 12 : 13,
  base: isSmallPhone ? 14 : 15,
  lg: isSmallPhone ? 16 : 18,
  xl: isSmallPhone ? 20 : 22,
  xxl: isSmallPhone ? 24 : 28,
};

// Responsive spacing
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
    backgroundColor: "#F9FAFB",
  },

  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    width: "100%",
  },

  keyboardView: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    width: "100%",
  },

  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#F9FAFB",
    paddingBottom: spacing.lg,
  },

  scrollViewContent: {
    flex: 1,
    width: "100%",
  },

  // ============ PREMIUM HEADER ============
  header: {
    width: "100%",
    paddingTop: Platform.select({
      ios: isSmallPhone ? 40 : 50,
      android: isSmallPhone ? 35 : 40,
      web: isSmallPhone ? 30 : 40,
    }),
    paddingBottom: isSmallPhone ? 30 : 36,
    borderBottomLeftRadius: isSmallPhone ? 24 : 32,
    borderBottomRightRadius: isSmallPhone ? 24 : 32,
    position: "relative",
    overflow: "hidden",
  },

  headerDeco1: {
    position: "absolute",
    top: -30,
    right: -30,
    width: isSmallPhone ? 120 : 150,
    height: isSmallPhone ? 120 : 150,
    borderRadius: isSmallPhone ? 60 : 75,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  headerDeco2: {
    position: "absolute",
    bottom: -40,
    left: -20,
    width: isSmallPhone ? 160 : 200,
    height: isSmallPhone ? 160 : 200,
    borderRadius: isSmallPhone ? 80 : 100,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  headerDeco3: {
    position: "absolute",
    top: 20,
    left: "20%",
    width: isSmallPhone ? 80 : 100,
    height: isSmallPhone ? 80 : 100,
    borderRadius: isSmallPhone ? 40 : 50,
    backgroundColor: "rgba(255,255,255,0.03)",
  },

  // ============ HEADER BUTTONS ============
  headerButtons: {
    position: "absolute",
    top: Platform.select({
      ios: isSmallPhone ? 40 : 50,
      android: isSmallPhone ? 35 : 40,
      web: isSmallPhone ? 30 : 40,
    }),
    left: spacing.base,
    right: spacing.base,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: spacing.base,
  },

  backButton: {
    width: isSmallPhone ? 36 : 40,
    height: isSmallPhone ? 36 : 40,
    borderRadius: isSmallPhone ? 18 : 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    ...(isWeb && {
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: "rgba(255,255,255,0.3)",
        transform: "scale(1.05)",
      },
      ":active": {
        transform: "scale(0.95)",
      },
    }),
  },

  exitButton: {
    width: isSmallPhone ? 36 : 40,
    height: isSmallPhone ? 36 : 40,
    borderRadius: isSmallPhone ? 18 : 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    ...(isWeb && {
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: "rgba(255,255,255,0.3)",
        transform: "scale(1.05)",
      },
      ":active": {
        transform: "scale(0.95)",
      },
    }),
  },

  headerContent: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
  },

  headerIconContainer: {
    marginBottom: spacing.base,
    borderRadius: isSmallPhone ? 25 : 30,
    overflow: "hidden",
  },

  headerIconGradient: {
    width: isSmallPhone ? 60 : 70,
    height: isSmallPhone ? 60 : 70,
    borderRadius: isSmallPhone ? 30 : 35,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },

  headerTitle: {
    fontSize: isSmallPhone ? 24 : isTablet ? 32 : 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
    textAlign: "center",
  },

  headerSubtitle: {
    fontSize: isSmallPhone ? 14 : 15,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "400",
    textAlign: "center",
  },

  // ============ PROGRESS BAR ============
  progressContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F5",
    width: "100%",
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },

  progressTitle: {
    fontSize: fontSizes.sm,
    fontWeight: "500",
    color: "#4B5563",
  },

  progressPercentage: {
    fontSize: fontSizes.sm,
    fontWeight: "700",
    color: "#4F46E5",
  },

  progressBarContainer: {
    height: 6,
    backgroundColor: "#F0F2F5",
    borderRadius: 3,
    overflow: "hidden",
    width: "100%",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 3,
  },

  // ============ STEP INDICATOR ============
  stepIndicatorContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: isSmallPhone ? 20 : 30,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F2F5",
    width: "100%",
  },

  stepWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.xs,
    width: "100%",
  },

  stepCircle: {
    width: isSmallPhone ? 32 : 36,
    height: isSmallPhone ? 32 : 36,
    borderRadius: isSmallPhone ? 16 : 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },

  stepCircleActive: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
    ...Platform.select({
      ios: {
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  stepCircleText: {
    fontSize: isSmallPhone ? 14 : 16,
    fontWeight: "600",
    color: "#9CA3AF",
  },

  stepCircleTextActive: {
    color: "#FFFFFF",
  },

  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginHorizontal: spacing.xs,
  },

  stepConnectorActive: {
    backgroundColor: "#4F46E5",
  },

  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xs,
    width: "100%",
  },

  stepLabel: {
    fontSize: isSmallPhone ? 11 : 12,
    fontWeight: "500",
    color: "#9CA3AF",
  },

  stepLabelActive: {
    color: "#4F46E5",
    fontWeight: "600",
  },

  // ============ CONTENT ============
  content: {
    padding: spacing.lg,
    backgroundColor: "#F9FAFB",
    width: "100%",
    ...(isWeb && {
      maxWidth: isTablet ? 900 : 600,
      alignSelf: "center",
    }),
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    width: "100%",
  },

  sectionTitle: {
    fontSize: isSmallPhone ? 20 : 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },

  sectionSubtitle: {
    fontSize: fontSizes.sm,
    color: "#6B7280",
  },

  sectionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: spacing.xs,
  },

  sectionBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: "600",
    color: "#4F46E5",
  },

  // ============ FORM GRID ============
  formGrid: {
    gap: spacing.base,
    marginBottom: spacing.lg,
    width: "100%",
  },

  // ============ ID CARD UPLOAD SECTION (MOVED TO TOP) ============
  idUploadSection: {
    marginBottom: spacing.lg,
    width: "100%",
  },

  idCardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: isSmallPhone ? 20 : 24,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" },
    }),
  },

  idCardTitle: {
    fontSize: isSmallPhone ? 15 : 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: spacing.xs,
  },

  idCardSubtitle: {
    fontSize: fontSizes.sm,
    color: "#6B7280",
    marginBottom: spacing.sm,
  },

  // ============ FORM CARD ============
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: isSmallPhone ? 16 : 20,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: "#F0F2F5",
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
    ...(isWeb && {
      transition: "all 0.2s ease",
    }),
  },

  formCardFocused: {
    borderColor: "#4F46E5",
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  formCardCompleted: {
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },

  formCardError: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FFF5F5',
  },

  uploadCard: {
    paddingBottom: spacing.base,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
    width: "100%",
  },

  cardIcon: {
    width: isSmallPhone ? 32 : 36,
    height: isSmallPhone ? 32 : 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.xs,
  },

  cardTitleContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  cardLabel: {
    fontSize: isSmallPhone ? 14 : 15,
    fontWeight: "600",
    color: "#111827",
    marginRight: spacing.xs,
  },

  completedBadge: {
    marginLeft: 2,
  },

  requiredBadge: {
    fontSize: 10,
    fontWeight: "600",
    color: "#EF4444",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: "hidden",
  },

  optionalBadge: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: "hidden",
  },

  // ============ INPUT STYLES ============
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: isSmallPhone ? 12 : 14,
    paddingHorizontal: spacing.base,
    minHeight: isSmallPhone ? 48 : 52,
    marginBottom: spacing.xs,
    gap: spacing.xs,
    width: "100%",
  },

  inputContainerFocused: {
    borderColor: "#4F46E5",
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    ...(isWeb && {
      boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)",
    }),
  },

  inputContainerError: {
    borderColor: '#EF4444',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },

  input: {
    flex: 1,
    fontSize: isSmallPhone ? 14 : 15,
    color: "#111827",
    fontWeight: "400",
    paddingVertical: 0,
    ...(isWeb && {
      outline: "none",
    }),
  },

  inputHint: {
    fontSize: fontSizes.xs,
    color: "#9CA3AF",
    marginLeft: spacing.xs,
  },

  errorText: {
    fontSize: fontSizes.xs,
    color: '#EF4444',
    marginTop: 2,
    marginLeft: spacing.xs,
  },

  // ============ UPLOAD AREA ============
  uploadArea: {
    borderRadius: isSmallPhone ? 12 : 14,
    overflow: "hidden",
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    marginBottom: spacing.xs,
    width: "100%",
    minHeight: isSmallPhone ? 160 : 180,
    ...(isWeb && {
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        borderColor: "#4F46E5",
        backgroundColor: "#F5F3FF",
      },
    }),
  },

  uploadAreaError: {
    borderColor: '#EF4444',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },

  uploadPlaceholder: {
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },

  uploadIconContainer: {
    width: isSmallPhone ? 50 : 60,
    height: isSmallPhone ? 50 : 60,
    borderRadius: isSmallPhone ? 25 : 30,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.sm,
  },

  uploadTitle: {
    fontSize: isSmallPhone ? 14 : 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
    textAlign: "center",
  },

  uploadSubtitle: {
    fontSize: fontSizes.xs,
    color: "#6B7280",
    marginBottom: spacing.sm,
    textAlign: "center",
  },

  uploadBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E8FF",
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 16,
    gap: 2,
  },

  uploadBadgeText: {
    fontSize: 10,
    color: "#7C3AED",
    fontWeight: "500",
  },

  uploadPreview: {
    width: "100%",
    height: isSmallPhone ? 160 : 180,
    position: "relative",
    backgroundColor: "#F3F4F6",
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
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  uploadGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  changePhotoText: {
    color: "#FFFFFF",
    fontSize: isSmallPhone ? 13 : 14,
    fontWeight: "600",
    marginTop: 4,
  },

  // ============ SCANNER BUTTON STYLES ============
  scanButton: {
    borderRadius: isSmallPhone ? 12 : 14,
    overflow: "hidden",
    marginTop: spacing.sm,
    width: "100%",
  },

  scanGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: isSmallPhone ? 12 : 14,
    gap: spacing.xs,
    width: "100%",
  },

  scanButtonText: {
    color: "#FFFFFF",
    fontSize: isSmallPhone ? 14 : 15,
    fontWeight: "600",
  },

  scanningContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: isSmallPhone ? 12 : 14,
    padding: spacing.base,
    marginTop: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  scanningHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },

  scanningText: {
    fontSize: fontSizes.sm,
    color: "#4F46E5",
    fontWeight: "500",
  },

  scanProgressContainer: {
    width: "100%",
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: spacing.xs,
  },

  scanProgressBar: {
    height: "100%",
    backgroundColor: "#4F46E5",
    borderRadius: 2,
  },

  scanHint: {
    fontSize: fontSizes.xs,
    color: "#6B7280",
    textAlign: "center",
    marginTop: spacing.xs,
  },

  // ============ IMAGE ACTIONS ============
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: 2,
    width: "100%",
  },

  imageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  imageInfoText: {
    fontSize: fontSizes.xs,
    color: '#10B981',
    fontWeight: '500',
  },

  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    ...(isWeb && {
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: '#FEE2E2',
      },
    }),
  },

  removeImageText: {
    fontSize: fontSizes.xs,
    color: '#EF4444',
    fontWeight: '600',
  },

  // ============ TEXT AREA STYLES ============
  textAreaWrapper: {
    width: '100%',
    marginBottom: spacing.xs,
  },

  textArea: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: isSmallPhone ? 12 : 14,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontSize: isSmallPhone ? 14 : 15,
    color: "#111827",
    minHeight: isSmallPhone ? 90 : 100,
    textAlignVertical: "top",
    width: "100%",
    ...(isWeb && {
      resize: "vertical",
      fontFamily: "inherit",
    }),
  },

  textAreaFocused: {
    borderColor: "#4F46E5",
    borderWidth: 2,
    backgroundColor: "#FFFFFF",
    ...(isWeb && {
      boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)",
    }),
  },

  textAreaError: {
    borderColor: '#EF4444',
    borderWidth: 2,
    backgroundColor: '#FEF2F2',
  },

  // ============ FORM ROW STYLES ============
  formRow: {
    flexDirection: 'row',
    marginBottom: spacing.base,
    gap: spacing.sm,
    width: "100%",
  },

  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: isSmallPhone ? 12 : 14,
    paddingHorizontal: spacing.base,
    height: isSmallPhone ? 48 : 52,
    marginTop: spacing.xs,
    gap: spacing.xs,
    width: "100%",
    ...(isWeb && {
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        borderColor: "#4F46E5",
        backgroundColor: "#F5F3FF",
      },
    }),
  },

  datePickerText: {
    fontSize: isSmallPhone ? 14 : 15,
    color: '#111827',
    flex: 1,
  },

  // ============ WEB INPUT STYLES ============
  webDateInput: {
    width: '100%',
    padding: isSmallPhone ? 10 : 12,
    borderRadius: isSmallPhone ? 12 : 14,
    border: '1px solid #E5E7EB',
    fontSize: isSmallPhone ? 14 : 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    outline: 'none',
    marginTop: isSmallPhone ? 6 : 8,
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    ':focus': {
      borderColor: '#4F46E5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    },
  },

  webTimeInput: {
    width: '100%',
    padding: isSmallPhone ? 10 : 12,
    borderRadius: isSmallPhone ? 12 : 14,
    border: '1px solid #E5E7EB',
    fontSize: isSmallPhone ? 14 : 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    outline: 'none',
    marginTop: isSmallPhone ? 6 : 8,
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    ':focus': {
      borderColor: '#4F46E5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)',
    },
  },

  // ============ REVIEW SECTION STYLES ============
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallPhone ? 14 : 16,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: '#F0F2F5',
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    width: "100%",
  },

  reviewHeaderText: {
    fontSize: isSmallPhone ? 15 : 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: spacing.xs,
  },

  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    width: "100%",
  },
 
  reviewLabel: {
    fontSize: fontSizes.sm,
    color: '#6B7280',
    flex: 1,
  },

  reviewValue: {
    fontSize: fontSizes.sm,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },

  reviewImageContainer: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    overflow: "hidden",
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  reviewImage: {
    width: "100%",
    height: "100%",
  },

  // ============ BUTTON ============
  continueButton: {
    borderRadius: isSmallPhone ? 14 : 16,
    overflow: "hidden",
    marginBottom: spacing.base,
    width: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#4F46E5",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
    ...(isWeb && {
      cursor: "pointer",
      transition: "transform 0.2s ease",
      ":hover": {
        transform: "translateY(-2px)",
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
    paddingVertical: isSmallPhone ? 16 : 18,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    width: "100%",
  },

  continueButtonText: {
    color: "#FFFFFF",
    fontSize: isSmallPhone ? 15 : 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // ============ FOOTER NOTE ============
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    width: "100%",
  },

  footerNoteText: {
    fontSize: fontSizes.xs,
    color: "#9CA3AF",   
  },

  // ============ DATA PRIVACY MODAL STYLES ============
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },

  privacyModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallPhone ? 24 : 28,
    width: '90%',
    maxWidth: isTablet ? 600 : 500,
    maxHeight: '80%',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.15)',
      },
    }),
  },

  privacyModalHeader: {
    backgroundColor: '#F9FAFB',
    padding: spacing.lg,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    width: "100%",
  },

  privacyIconContainer: {
    marginBottom: spacing.base,
    borderRadius: isSmallPhone ? 25 : 30,
    overflow: 'hidden',
  },

  privacyIconGradient: {
    width: isSmallPhone ? 50 : 60,
    height: isSmallPhone ? 50 : 60,
    borderRadius: isSmallPhone ? 25 : 30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  privacyModalTitle: {
    fontSize: isSmallPhone ? 20 : 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
    textAlign: 'center',
  },

  privacyModalSubtitle: {
    fontSize: fontSizes.sm,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },

  privacyModalContent: {
    padding: spacing.lg,
    maxHeight: isSmallPhone ? 350 : 400,
  },

  privacySection: {
    marginBottom: spacing.lg,
  },

  privacySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },

  privacySectionTitle: {
    fontSize: isSmallPhone ? 15 : 16,
    fontWeight: '600',
    color: '#111827',
  },

  privacySectionText: {
    fontSize: fontSizes.sm,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 2,
    paddingLeft: 28,
  },

  privacyCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.base,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    width: "100%",
    ...(isWeb && {
      cursor: 'pointer',
    }),
  },

  privacyCheckbox: {
    width: isSmallPhone ? 22 : 24,
    height: isSmallPhone ? 22 : 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    backgroundColor: '#FFFFFF',
    ...(isWeb && {
      transition: 'all 0.2s ease',
    }),
  },

  privacyCheckboxChecked: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },

  privacyCheckboxText: {
    fontSize: isSmallPhone ? 13 : 14,
    color: '#4B5563',
    flex: 1,
    lineHeight: 20,
  },

  privacyLinkText: {
    color: '#4F46E5',
    fontWeight: '600',
    textDecorationLine: 'underline',
    ...(isWeb && {
      cursor: 'pointer',
      ':hover': {
        color: '#7C3AED',
      },
    }),
  },

  privacyModalActions: {
    flexDirection: 'row',
    padding: spacing.base,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    width: "100%",
  },

  privacyDeclineButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: isSmallPhone ? 12 : 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    ...(isWeb && {
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: '#E5E7EB',
      },
    }),
  },

  privacyDeclineText: {
    fontSize: isSmallPhone ? 14 : 15,
    fontWeight: '600',
    color: '#6B7280',
  },

  privacyAcceptButton: {
    flex: 2,
    borderRadius: isSmallPhone ? 12 : 14,
    overflow: 'hidden',
  },

  privacyAcceptButtonDisabled: {
    opacity: 0.6,
  },

  privacyAcceptGradient: {
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    width: "100%",
  },

  privacyAcceptText: {
    fontSize: isSmallPhone ? 14 : 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // ============ SUCCESS MODAL STYLES ============
  successModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: isSmallPhone ? 24 : 28,
    padding: spacing.xl,
    alignItems: 'center',
    width: '90%',
    maxWidth: isSmallPhone ? 340 : 400,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
      },
    }),
  },

  successIconContainer: {
    marginBottom: spacing.base,
    borderRadius: isSmallPhone ? 40 : 50,
    overflow: 'hidden',
  },

  successIconGradient: {
    width: isSmallPhone ? 70 : 80,
    height: isSmallPhone ? 70 : 80,
    borderRadius: isSmallPhone ? 35 : 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  successTitle: {
    fontSize: isSmallPhone ? 22 : 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  successMessage: {
    fontSize: isSmallPhone ? 14 : 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },

  credentialsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: isSmallPhone ? 14 : 16,
    padding: spacing.base,
    marginBottom: spacing.base,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  credentialsTitle: {
    fontSize: isSmallPhone ? 14 : 15,
    fontWeight: '600',
    color: '#4F46E5',
    marginBottom: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  credentialsInfo: {
    fontSize: fontSizes.sm,
    color: '#6B7280',
    marginBottom: spacing.sm,
    lineHeight: 20,
  },

  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },

  credentialLabel: {
    fontSize: fontSizes.sm,
    fontWeight: '500',
    color: '#4B5563',
    width: 70,
  },

  credentialValue: {
    fontSize: fontSizes.sm,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  copyButton: {
    padding: spacing.xs,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    ...(isWeb && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      ':hover': {
        backgroundColor: '#E0E7FF',
      },
    }),
  },

  noteText: {
    fontSize: fontSizes.xs,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  successButton: {
    borderRadius: isSmallPhone ? 14 : 16,
    overflow: 'hidden',
    width: '100%',
  },

  successGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: isSmallPhone ? 14 : 16,
    gap: spacing.xs,
    width: '100%',
  },

  successButtonText: {
    color: '#FFFFFF',
    fontSize: isSmallPhone ? 15 : 16,
    fontWeight: '700',
  },

  
// ============ STEP INDICATOR (NEW) ============
stepIndicatorWrapper: {
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xl,
},

stepsContainer: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: spacing.sm,
},

stepItem: {
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
},

stepCircle: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: "rgba(255,255,255,0.3)",
  justifyContent: "center",
  alignItems: "center",
},

stepCircleActive: {
  backgroundColor: "#FFDC00",
},

stepNumber: {
  fontSize: 14,
  fontWeight: "600",
  color: "rgba(255,255,255,0.8)",
},

stepNumberActive: {
  color: "#001F3F",
},

stepLine: {
  flex: 1,
  height: 2,
  backgroundColor: "rgba(255,255,255,0.3)",
  marginHorizontal: 8,
},

stepLineActive: {
  backgroundColor: "#FFDC00",
},

stepLabelsContainer: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingHorizontal: 4,
},

stepLabel: {
  fontSize: 11,
  fontWeight: "500",
  color: "rgba(255,255,255,0.6)",
},

stepLabelActive: {
  color: "#FFDC00",
  fontWeight: "600",
},

// ============ SECTION CARD ============
sectionCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 24,
  padding: spacing.lg,
  marginBottom: spacing.lg,
  ...Platform.select({
    ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8 },
    android: { elevation: 2 },
    web: { boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)" },
  }),
},

sectionCardHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.lg,
  gap: spacing.sm,
  paddingBottom: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: "#F0F2F5",
},

sectionCardTitle: {
  fontSize: fontSizes.lg,
  fontWeight: "600",
  color: "#1E293B",
},

// ============ FORM FIELDS ============
fieldWrapper: {
  marginBottom: spacing.base,
},

fieldLabel: {
  fontSize: fontSizes.sm,
  fontWeight: "500",
  color: "#334155",
  marginBottom: spacing.xs,
},

requiredStar: {
  color: "#EF4444",
},

optionalText: {
  fontSize: fontSizes.xs,
  fontWeight: "400",
  color: "#94A3B8",
},

fieldInput: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#F8FAFC",
  borderWidth: 1,
  borderColor: "#E2E8F0",
  borderRadius: 14,
  paddingHorizontal: spacing.base,
  minHeight: 50,
  gap: spacing.xs,
},

fieldInputError: {
  borderColor: "#EF4444",
  borderWidth: 2,
  backgroundColor: "#FEF2F2",
},

fieldInputText: {
  flex: 1,
  fontSize: fontSizes.base,
  color: "#0F172A",
  paddingVertical: 12,
  ...(isWeb && { outline: "none" }),
},

fieldSelect: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#F8FAFC",
  borderWidth: 1,
  borderColor: "#E2E8F0",
  borderRadius: 14,
  paddingHorizontal: spacing.base,
  minHeight: 50,
},

fieldSelectPicker: {
  flex: 1,
  color: "#0F172A",
  ...(isWeb && { outline: "none" }),
},

fieldTextArea: {
  borderWidth: 1,
  borderColor: "#E2E8F0",
  borderRadius: 14,
  backgroundColor: "#F8FAFC",
  overflow: "hidden",
},

fieldTextAreaInput: {
  fontSize: fontSizes.base,
  color: "#0F172A",
  paddingHorizontal: spacing.base,
  paddingVertical: spacing.sm,
  minHeight: 100,
  textAlignVertical: "top",
  ...(isWeb && { outline: "none" }),
},

fieldHint: {
  fontSize: fontSizes.xs,
  color: "#94A3B8",
  marginTop: spacing.xs,
  marginLeft: spacing.xs,
},

errorText: {
  fontSize: fontSizes.xs,
  color: "#EF4444",
  marginTop: spacing.xs,
  marginLeft: spacing.xs,
},

// ============ ID UPLOAD ============
idUploadWrapper: {
  width: "100%",
},

idUploadBox: {
  borderRadius: 16,
  overflow: "hidden",
  backgroundColor: "#F8FAFC",
  borderWidth: 2,
  borderColor: "#E2E8F0",
  borderStyle: "dashed",
  minHeight: 180,
  ...(isWeb && { cursor: "pointer", transition: "all 0.2s ease", ":hover": { borderColor: "#4F46E5", backgroundColor: "#F5F3FF" } }),
},

idUploadPlaceholder: {
  padding: spacing.xl,
  alignItems: "center",
  justifyContent: "center",
},

idUploadIcon: {
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: "#F3E8FF",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: spacing.sm,
},

idUploadTitle: {
  fontSize: fontSizes.base,
  fontWeight: "600",
  color: "#0F172A",
  marginBottom: 2,
  textAlign: "center",
},

idUploadSubtitle: {
  fontSize: fontSizes.xs,
  color: "#64748B",
  textAlign: "center",
},

idPreviewContainer: {
  width: "100%",
  height: 180,
  position: "relative",
},

idPreviewImage: {
  width: "100%",
  height: "100%",
},

idPreviewOverlay: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.4)",
},

idPreviewText: {
  color: "#FFFFFF",
  fontSize: fontSizes.sm,
  fontWeight: "600",
  marginTop: 4,
},

idActionsRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: spacing.sm,
  gap: spacing.sm,
},

idScanButton: {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#EEF2FF",
  paddingVertical: 10,
  borderRadius: 12,
  gap: spacing.xs,
},

idScanText: {
  fontSize: fontSizes.sm,
  fontWeight: "600",
  color: "#4F46E5",
},

idRemoveButton: {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "#FEF2F2",
  paddingVertical: 10,
  borderRadius: 12,
  gap: spacing.xs,
},

idRemoveText: {
  fontSize: fontSizes.sm,
  fontWeight: "600",
  color: "#EF4444",
},

// ============ SCANNING ============
scanningContainer: {
  backgroundColor: "#F8FAFC",
  borderRadius: 14,
  padding: spacing.base,
  marginTop: spacing.sm,
  alignItems: "center",
  borderWidth: 1,
  borderColor: "#E2E8F0",
},

scanningText: {
  fontSize: fontSizes.sm,
  color: "#4F46E5",
  fontWeight: "500",
  marginTop: spacing.xs,
},

scanningProgressBar: {
  width: "100%",
  height: 4,
  backgroundColor: "#E2E8F0",
  borderRadius: 2,
  overflow: "hidden",
  marginTop: spacing.sm,
},

scanningProgressFill: {
  height: "100%",
  backgroundColor: "#4F46E5",
  borderRadius: 2,
},

// ============ DATE PICKER ============
datePickerButton: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#F8FAFC",
  borderWidth: 1,
  borderColor: "#E2E8F0",
  borderRadius: 14,
  paddingHorizontal: spacing.base,
  height: 50,
  marginTop: spacing.xs,
  gap: spacing.xs,
  ...(isWeb && { cursor: "pointer", transition: "all 0.2s ease", ":hover": { borderColor: "#4F46E5", backgroundColor: "#F5F3FF" } }),
},

datePickerText: {
  fontSize: fontSizes.base,
  color: "#0F172A",
  flex: 1,
},

// ============ WEB INPUTS ============
webDateInput: {
  width: "100%",
  padding: isSmallPhone ? 10 : 12,
  borderRadius: 14,
  border: "1px solid #E2E8F0",
  fontSize: fontSizes.base,
  color: "#0F172A",
  backgroundColor: "#F8FAFC",
  outline: "none",
  marginTop: spacing.xs,
  transition: "all 0.2s ease",
  fontFamily: "inherit",
  boxSizing: "border-box",
  ":focus": { borderColor: "#4F46E5", boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)" },
},

webTimeInput: {
  width: "100%",
  padding: isSmallPhone ? 10 : 12,
  borderRadius: 14,
  border: "1px solid #E2E8F0",
  fontSize: fontSizes.base,
  color: "#0F172A",
  backgroundColor: "#F8FAFC",
  outline: "none",
  marginTop: spacing.xs,
  transition: "all 0.2s ease",
  fontFamily: "inherit",
  boxSizing: "border-box",
  ":focus": { borderColor: "#4F46E5", boxShadow: "0 0 0 3px rgba(79, 70, 229, 0.1)" },
},

// ============ ROW CONTAINER ============
rowContainer: {
  flexDirection: "row",
  gap: spacing.sm,
  marginBottom: spacing.base,
},

halfWidth: {
  flex: 1,
},

// ============ ACTION BUTTONS ============
actionContainer: {
  marginTop: spacing.lg,
  marginBottom: spacing.md,
},

nextButton: {
  borderRadius: 14,
  overflow: "hidden",
  ...Platform.select({
    ios: { shadowColor: "#FFDC00", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    android: { elevation: 4 },
    web: { cursor: "pointer", transition: "transform 0.2s ease", ":hover": { transform: "translateY(-2px)" } },
  }),
},

nextButtonGradient: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 16,
  gap: spacing.xs,
},

nextButtonText: {
  color: "#001F3F",
  fontSize: fontSizes.base,
  fontWeight: "700",
},

submitButton: {
  borderRadius: 14,
  overflow: "hidden",
  ...Platform.select({
    ios: { shadowColor: "#FFDC00", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
    android: { elevation: 4 },
    web: { cursor: "pointer", transition: "transform 0.2s ease", ":hover": { transform: "translateY(-2px)" } },
  }),
},

submitButtonGradient: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 16,
  gap: spacing.xs,
},

submitButtonText: {
  color: "#001F3F",
  fontSize: fontSizes.base,
  fontWeight: "700",
},
// ============ DROPDOWN BUTTON STYLES ============
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
  minHeight: 50,
  ...(isWeb && { cursor: "pointer" }),
},

dropdownButtonText: {
  fontSize: fontSizes.base,
  color: "#0F172A",
  flex: 1,
},

dropdownButtonPlaceholder: {
  color: "#94A3B8",
},

// ============ PICKER MODAL STYLES ============
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
  ...(isWeb && {
    borderRadius: 24,
    maxWidth: 400,
    alignSelf: "center",
    width: "90%",
  }),
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
  color: "#1E293B",
},

pickerModalOptions: {
  padding: spacing.sm,
},

pickerModalOption: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: spacing.base,
  paddingHorizontal: spacing.lg,
  borderRadius: 12,
  marginVertical: 2,
},

pickerModalOptionActive: {
  backgroundColor: "#EEF2FF",
},

pickerModalOptionText: {
  fontSize: fontSizes.base,
  color: "#1E293B",
},

pickerModalOptionTextActive: {
  color: "#4F46E5",
  fontWeight: "600",
},

// ============ REVIEW SECTION ============
reviewSection: {
  marginBottom: spacing.lg,
},

reviewCard: {
  backgroundColor: "#FFFFFF",
  borderRadius: 20,
  padding: spacing.base,
  marginBottom: spacing.base,
  borderWidth: 1,
  borderColor: "#E2E8F0",
},

reviewCardHeader: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: spacing.sm,
  paddingBottom: spacing.xs,
  borderBottomWidth: 1,
  borderBottomColor: "#E2E8F0",
  gap: spacing.xs,
},

reviewCardTitle: {
  fontSize: fontSizes.base,
  fontWeight: "600",
  color: "#0F172A",
},

reviewItem: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingVertical: spacing.xs,
},

reviewLabel: {
  fontSize: fontSizes.sm,
  color: "#64748B",
  flex: 1,
},

reviewValue: {
  fontSize: fontSizes.sm,
  color: "#0F172A",
  fontWeight: "500",
  flex: 1,
  textAlign: "right",
},

reviewImage: {
  width: "100%",
  height: 120,
  borderRadius: 12,
  marginTop: spacing.sm,
},
});