import { StyleSheet, Platform, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isSmallPhone = width <= 375;
const isTablet = width >= 768 && width < 1024;
const isDesktop = width >= 1024;

// Responsive spacing
const spacing = {
  xs: isSmallPhone ? 4 : 6,
  sm: isSmallPhone ? 8 : 10,
  md: isSmallPhone ? 12 : 16,
  lg: isSmallPhone ? 16 : 20,
  xl: isSmallPhone ? 20 : 24,
  xxl: isSmallPhone ? 24 : 32,
};

// Responsive font sizes
const fontSize = {
  xs: isSmallPhone ? 10 : 11,
  sm: isSmallPhone ? 11 : 12,
  base: isSmallPhone ? 13 : 14,
  md: isSmallPhone ? 14 : 15,
  lg: isSmallPhone ? 15 : 16,
  xl: isSmallPhone ? 18 : 20,
  xxl: isSmallPhone ? 20 : 24,
};

export default StyleSheet.create({
  // ============ CONTAINERS ============
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },

  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.base,
    color: "#6B7280",
  },

  errorContainer: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  errorContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },

  errorTitle: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: "#111827",
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },

  errorMessage: {
    fontSize: fontSize.base,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: spacing.lg,
  },

  retryButton: {
    backgroundColor: "#0A3D91",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: fontSize.base,
    fontWeight: "600",
  },

  scrollContent: {
    paddingBottom: spacing.xxl,
  },

  // ============ HEADER ============
  header: {
    backgroundColor: "#0A3D91",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.select({ ios: 60, android: 20, web: 20 }),
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: "#0A3D91",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
      web: { boxShadow: "0px 4px 12px rgba(79, 70, 229, 0.3)" },
    }),
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: isSmallPhone ? 18 : 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ============ STATUS BANNER ============
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 100,
    gap: spacing.xs,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  statusText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
  },

  // ============ VIRTUAL CARD ============
  virtualCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderRadius: 24,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
      web: { boxShadow: "0px 8px 24px rgba(0,0,0,0.15)" },
    }),
  },

  cardBackground: {
    backgroundColor: "#0A3D91",
    padding: spacing.lg,
    position: "relative",
    overflow: "hidden",
  },

  cardPattern: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },

  cardTitle: {
    fontSize: fontSize.xs,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 0.5,
  },

  cardSubtitle: {
    fontSize: fontSize.md,
    fontWeight: "700",
    color: "#FFFFFF",
    marginTop: 2,
  },

  cardLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },

  cardPhotoSection: {
    alignItems: "center",
    marginBottom: spacing.md,
  },

  cardPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  cardInitials: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },

  cardInitialsText: {
    fontSize: fontSize.xxl,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  cardName: {
    fontSize: isSmallPhone ? 18 : 20,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: spacing.xs,
  },

  cardIdContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
  },

  cardIdLabel: {
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.7)",
  },

  cardId: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  qrContainer: {
    alignItems: "center",
    marginBottom: spacing.md,
  },

  qrPlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
    paddingTop: spacing.md,
  },

  cardFooterItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  cardFooterText: {
    fontSize: fontSize.xs,
    color: "rgba(255,255,255,0.9)",
  },

  // ============ QUICK ACTIONS ============
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },

  quickAction: {
    alignItems: "center",
  },

  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xs,
  },

  quickActionText: {
    fontSize: fontSize.xs,
    color: "#6B7280",
    fontWeight: "500",
  },

  // ============ DETAILS CARD ============
  detailsCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 2px 8px rgba(0,0,0,0.05)" },
    }),
  },

  detailsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  detailsTitle: {
    fontSize: fontSize.md,
    fontWeight: "600",
    color: "#111827",
  },

  detailsGrid: {
    gap: spacing.sm,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },

  detailLabel: {
    fontSize: fontSize.sm,
    color: "#6B7280",
    width: 80,
  },

  detailValue: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: "#111827",
  },

  // ============ NOTES CARD ============
  notesCard: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  notesText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: "#6B7280",
    lineHeight: 20,
  },

  // ============ ACTION BUTTONS ============
  actionButtons: {
    marginHorizontal: spacing.lg,
    gap: spacing.sm,
  },

  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0A3D91",
    paddingVertical: spacing.md,
    borderRadius: 12,
    gap: spacing.xs,
    ...Platform.select({
      ios: {
        shadowColor: "#0A3D91",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      web: {
        cursor: "pointer",
        transition: "all 0.2s ease",
        ":hover": {
          backgroundColor: "#1C6DD0",
          transform: "translateY(-2px)",
        },
      },
    }),
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: fontSize.md,
    fontWeight: "600",
  },

  secondaryButton: {
    alignItems: "center",
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...(isWeb && {
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: "#E5E7EB",
      },
    }),
  },

  secondaryButtonText: {
    color: "#6B7280",
    fontSize: fontSize.md,
    fontWeight: "600",
  },

  // ============ RESPONSIVE ============
  ...(isWeb && {
    safeArea: {
      maxWidth: 1200,
      marginHorizontal: "auto",
      width: "100%",
    },
    virtualCard: {
      maxWidth: 500,
      alignSelf: "center",
      width: "100%",
    },
    detailsCard: {
      maxWidth: 500,
      alignSelf: "center",
      width: "100%",
    },
    quickActions: {
      maxWidth: 500,
      alignSelf: "center",
      width: "100%",
    },
    actionButtons: {
      maxWidth: 500,
      alignSelf: "center",
      width: "100%",
    },
  }),
});