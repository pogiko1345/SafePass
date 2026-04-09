import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

const isSmallPhone = width <= 375;
const isTablet = width >= 768 && width < 1024;

const fontSizes = {
  xs: isSmallPhone ? 11 : 12,
  sm: isSmallPhone ? 13 : 14,
  base: isSmallPhone ? 15 : 16,
  lg: isSmallPhone ? 18 : 20,
  xl: isSmallPhone ? 22 : 24,
  xxl: isSmallPhone ? 28 : 32,
};

const spacing = {
  xs: isSmallPhone ? 6 : 8,
  sm: isSmallPhone ? 12 : 16,
  base: isSmallPhone ? 16 : 20,
  md: isSmallPhone ? 18 : 22,
  lg: isSmallPhone ? 20 : 24,
  xl: isSmallPhone ? 24 : 32,
  xxl: isSmallPhone ? 32 : 40,
};

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F8FC",
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: spacing.lg,
  },

  heroWrapper: {
    width: "100%",
  },

  hero: {
    paddingTop: Platform.select({
      ios: isSmallPhone ? 58 : 78,
      android: isSmallPhone ? 48 : 68,
      web: isSmallPhone ? 42 : 56,
    }),
    paddingBottom: isSmallPhone ? 38 : 48,
    borderBottomLeftRadius: isSmallPhone ? 28 : 34,
    borderBottomRightRadius: isSmallPhone ? 28 : 34,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#041E42",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.22,
        shadowRadius: 20,
      },
      android: { elevation: 8 },
      web: { boxShadow: "0px 14px 34px rgba(4, 30, 66, 0.24)" },
    }),
  },

  heroGlowOne: {
    position: "absolute",
    top: -30,
    right: -10,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.09)",
  },

  heroGlowTwo: {
    position: "absolute",
    bottom: -60,
    left: -30,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(56,189,248,0.12)",
  },

  heroContent: {
    alignItems: "center",
    width: "100%",
    maxWidth: 760,
    paddingHorizontal: spacing.base,
    zIndex: 1,
  },

  brandBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: spacing.lg,
    ...Platform.select({
      web: { backdropFilter: "blur(10px)" },
    }),
  },

  brandBadgeLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: "#FFFFFF",
  },

  brandBadgeTextWrap: {
    justifyContent: "center",
  },

  brandBadgeEyebrow: {
    fontSize: fontSizes.xs,
    color: "rgba(255,255,255,0.78)",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: "700",
  },

  brandBadgeTitle: {
    fontSize: fontSizes.sm,
    color: "#FFFFFF",
    fontWeight: "700",
  },

  logoContainer: {
    marginBottom: spacing.base,
  },

  logoImage: {
    width: isSmallPhone ? 88 : 112,
    height: isSmallPhone ? 88 : 112,
    borderRadius: isSmallPhone ? 44 : 56,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.28)",
    backgroundColor: "#FFFFFF",
  },

  heroTitle: {
    fontSize: isSmallPhone ? 28 : 34,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: isSmallPhone ? 34 : 42,
    letterSpacing: -0.6,
    maxWidth: 620,
  },

  heroSubtitle: {
    fontSize: fontSizes.lg,
    fontWeight: "600",
    color: "rgba(255,255,255,0.94)",
    textAlign: "center",
    marginTop: 8,
  },

  heroDivider: {
    width: 72,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.36)",
    borderRadius: 999,
    marginVertical: spacing.md,
  },

  heroDescription: {
    fontSize: fontSizes.sm,
    color: "rgba(255,255,255,0.88)",
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 560,
  },

  heroMetrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    width: "100%",
  },

  heroMetricCard: {
    minWidth: 118,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
  },

  heroMetricValue: {
    fontSize: fontSizes.lg,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  heroMetricLabel: {
    fontSize: fontSizes.xs,
    color: "rgba(255,255,255,0.82)",
    fontWeight: "600",
    marginTop: 4,
    textAlign: "center",
  },

  content: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    maxWidth: 1040,
    alignSelf: "center",
    width: "100%",
  },

  sectionTitle: {
    fontSize: fontSizes.xl,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: spacing.xs,
    letterSpacing: -0.4,
  },

  sectionSubtitle: {
    fontSize: fontSizes.base,
    color: "#5B667A",
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 24,
    maxWidth: 620,
    alignSelf: "center",
  },

  cardsContainer: {
    flexDirection: "column",
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },

  cardsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.lg,
  },

  cardWrapper: {
    flex: 1,
    minWidth: 280,
  },

  cardWrapperRow: {
    flex: 1,
    maxWidth: isTablet ? 350 : 400,
  },

  card: {
    borderRadius: isSmallPhone ? 22 : 28,
    overflow: "hidden",
    height: "100%",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
      },
      android: { elevation: 4 },
      web: {
        boxShadow: "0px 10px 28px rgba(15, 23, 42, 0.08)",
        cursor: "pointer",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
      },
    }),
  },

  cardGradient: {
    padding: spacing.lg,
    backgroundColor: "#FFFFFF",
    minHeight: isSmallPhone ? 290 : 330,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E6EDF7",
  },

  cardIconWrapper: {
    marginBottom: spacing.md,
    alignItems: "center",
  },

  cardIconGradient: {
    width: isSmallPhone ? 58 : 68,
    height: isSmallPhone ? 58 : 68,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  cardContent: {
    flex: 1,
    marginBottom: spacing.md,
  },

  cardTitle: {
    fontSize: fontSizes.lg,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.2,
  },

  cardDescription: {
    fontSize: fontSizes.sm,
    color: "#5B667A",
    marginBottom: spacing.md,
    lineHeight: 21,
    textAlign: "center",
  },

  cardFeatures: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },

  featurePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F4F7FB",
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 4,
    borderWidth: 1,
    borderColor: "#E5EDF6",
  },

  featurePillText: {
    fontSize: fontSizes.xs,
    color: "#425066",
    fontWeight: "600",
  },

  cardArrow: {
    alignSelf: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F4F7FB",
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.xs,
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
      web: { boxShadow: "0px 2px 6px rgba(0,0,0,0.04)" },
    }),
  },

  infoCardText: {
    fontSize: fontSizes.xs,
    color: "#425066",
    fontWeight: "600",
  },

  helpLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
    ...(isWeb && {
      cursor: "pointer",
      transition: "opacity 0.2s ease",
    }),
  },

  helpText: {
    fontSize: fontSizes.sm,
    color: "#6B7280",
    fontWeight: "600",
  },

  contactCard: {
    marginTop: spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "#E5EAF3",
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 18,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 10px 26px rgba(15, 23, 42, 0.06)" },
    }),
  },

  contactHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },

  contactHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#EAF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  contactHeaderText: {
    flex: 1,
  },

  contactTitle: {
    fontSize: fontSizes.base,
    color: "#0F172A",
    fontWeight: "800",
  },

  contactSubtitle: {
    fontSize: fontSizes.sm,
    color: "#64748B",
    marginTop: 3,
    fontWeight: "500",
  },

  contactList: {
    gap: 6,
    marginBottom: spacing.sm,
  },

  contactLine: {
    fontSize: fontSizes.sm,
    color: "#334155",
    fontWeight: "600",
  },

  contactLinkRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },

  contactLinkChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#F4F7FB",
    borderWidth: 1,
    borderColor: "#E5EDF6",
    ...(isWeb && { cursor: "pointer" }),
  },

  contactLinkText: {
    fontSize: fontSizes.xs,
    color: "#0A3D91",
    fontWeight: "700",
  },

  contactCopyright: {
    marginTop: spacing.sm,
    fontSize: fontSizes.xs,
    color: "#94A3B8",
    fontWeight: "600",
  },

  versionText: {
    textAlign: "center",
    fontSize: fontSizes.xs,
    color: "#94A3B8",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  ...(isWeb && {
    content: {
      maxWidth: 1040,
      marginHorizontal: "auto",
      width: "100%",
    },
  }),
});
