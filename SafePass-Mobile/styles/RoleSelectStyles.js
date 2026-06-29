import { Dimensions, Platform, StyleSheet } from "react-native";
import { brandColors } from "./brandColors";

const { width } = Dimensions.get("window");
const isSmallPhone = width <= 380;
const isWeb = Platform.OS === "web";
const shadowColor = "#020617";

export default StyleSheet.create({
  mobileSafeArea: {
    flex: 1,
    backgroundColor: brandColors.navy,
  },

  mobilePage: {
    flex: 1,
    backgroundColor: brandColors.background,
  },

  mobileScrollContent: {
    flexGrow: 1,
    paddingBottom: 26,
  },

  mobileHero: {
    paddingHorizontal: isSmallPhone ? 18 : 20,
    paddingTop: Platform.select({
      ios: 56,
      android: 32,
      web: 28,
      default: 32,
    }),
    paddingBottom: isSmallPhone ? 22 : 26,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
  },

  mobileBrandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 18,
    padding: 11,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.11)",
  },

  mobileLogo: {
    width: isSmallPhone ? 40 : 44,
    height: isSmallPhone ? 40 : 44,
    borderRadius: isSmallPhone ? 20 : 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.32)",
  },

  mobileBrandCopy: {
    flex: 1,
    minWidth: 0,
  },

  mobileSchoolName: {
    color: "#FFFFFF",
    fontSize: isSmallPhone ? 12 : 13,
    lineHeight: isSmallPhone ? 16 : 17,
    fontWeight: "900",
  },

  mobilePlatform: {
    color: "#D8E8FF",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    marginTop: 3,
  },

  mobileHeroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "rgba(216,232,255,0.28)",
    backgroundColor: "rgba(238,245,255,0.12)",
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 7,
    marginBottom: 13,
  },

  mobileHeroBadgeText: {
    color: "#D8E8FF",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  mobileTitle: {
    color: "#FFFFFF",
    fontSize: isSmallPhone ? 27 : 30,
    lineHeight: isSmallPhone ? 33 : 36,
    fontWeight: "900",
    letterSpacing: 0,
  },

  mobileSubtitle: {
    color: "#D7E4F7",
    fontSize: isSmallPhone ? 12 : 13,
    lineHeight: isSmallPhone ? 19 : 20,
    fontWeight: "600",
    marginTop: 9,
    maxWidth: 330,
  },

  mobileTrustGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },

  mobileTrustPill: {
    flex: 1,
    minHeight: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
    paddingHorizontal: 7,
  },

  mobileTrustText: {
    color: "#FFFFFF",
    fontSize: isSmallPhone ? 10 : 11,
    fontWeight: "800",
  },

  mobileAccessSummary: {
    marginTop: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(216,232,255,0.24)",
    backgroundColor: "rgba(2,16,38,0.18)",
    padding: 9,
    gap: 8,
  },

  mobileAccessSummaryItem: {
    minHeight: 40,
    borderRadius: 8,
    backgroundColor: "rgba(238,245,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 10,
  },

  mobileAccessSummaryCopy: {
    flex: 1,
    minWidth: 0,
  },

  mobileAccessSummaryValue: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },

  mobileAccessSummaryLabel: {
    color: "#B7D5F6",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 1,
  },

  mobileActionStack: {
    marginTop: 16,
    gap: 10,
  },

  mobilePrimaryButton: {
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  mobilePrimaryText: {
    color: brandColors.blue,
    fontSize: 15,
    fontWeight: "900",
  },

  mobileSecondaryButton: {
    minHeight: 50,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  mobileSecondaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  mobileSection: {
    paddingHorizontal: isSmallPhone ? 14 : 16,
    paddingTop: 16,
  },

  mobileVisitorCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: brandColors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: isSmallPhone ? 13 : 14,
    marginBottom: 18,
    ...Platform.select({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
      android: { elevation: 2 },
    }),
  },

  mobileVisitorIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: brandColors.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  mobileVisitorCopy: {
    flex: 1,
    minWidth: 0,
  },

  mobileVisitorTitle: {
    color: brandColors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  mobileVisitorText: {
    color: brandColors.textMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600",
    marginTop: 3,
  },

  mobileVisitorButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: brandColors.blue,
    alignItems: "center",
    justifyContent: "center",
  },

  mobileSectionKicker: {
    color: brandColors.blue,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    textAlign: "center",
    marginBottom: 5,
  },

  mobileSectionTitle: {
    color: brandColors.text,
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 13,
    textAlign: "center",
  },

  mobileFeatureList: {
    gap: 10,
  },

  mobileFeatureItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: brandColors.border,
    padding: isSmallPhone ? 12 : 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  mobileFeatureIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: brandColors.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  mobileFeatureCopy: {
    flex: 1,
    minWidth: 0,
  },

  mobileFeatureTitle: {
    color: brandColors.text,
    fontSize: 14,
    fontWeight: "900",
  },

  mobileFeatureText: {
    color: brandColors.textMuted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
    marginTop: 4,
  },

  mobileFooter: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 18,
  },

  mobileVersionText: {
    color: brandColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },

  safeArea: {
    flex: 1,
    backgroundColor: brandColors.background,
  },

  introOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: brandColors.navy,
    alignItems: "center",
    justifyContent: "center",
  },

  introContent: {
    width: "100%",
    maxWidth: 360,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  introLogo: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: "#FFFFFF",
    marginBottom: 18,
  },

  introEyebrow: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  introRunwayScene: {
    width: "100%",
    height: 116,
    justifyContent: "flex-end",
    marginBottom: 12,
  },

  introPlane: {
    position: "absolute",
    left: "50%",
    bottom: 18,
    width: 92,
    height: 44,
    marginLeft: -46,
    alignItems: "center",
    justifyContent: "center",
  },

  introPlaneBody: {
    width: 76,
    height: 18,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(216,232,255,0.72)",
  },

  introPlaneNose: {
    position: "absolute",
    right: -8,
    top: 2,
    width: 18,
    height: 14,
    borderTopRightRadius: 14,
    borderBottomRightRadius: 14,
    backgroundColor: "#FFFFFF",
    transform: [{ skewX: "-16deg" }],
  },

  introPlaneWindowRow: {
    position: "absolute",
    left: 22,
    top: 5,
    flexDirection: "row",
    gap: 5,
    zIndex: 2,
  },

  introPlaneWindow: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: brandColors.blue,
  },

  introPlaneTail: {
    position: "absolute",
    left: -4,
    top: -10,
    width: 20,
    height: 18,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 10,
    backgroundColor: "#D8E8FF",
    transform: [{ rotate: "-18deg" }],
  },

  introPlaneWing: {
    position: "absolute",
    left: 32,
    top: 12,
    width: 34,
    height: 14,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 14,
    backgroundColor: "#B7D5F6",
    transform: [{ skewX: "-28deg" }],
  },

  introRunway: {
    height: 2,
    width: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(216,232,255,0.38)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },

  introRunwayDash: {
    width: 42,
    height: 2,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.72)",
  },

  introCaption: {
    color: "#D8E8FF",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 12,
  },

  introProgressTrack: {
    width: "100%",
    height: 3,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(216,232,255,0.18)",
  },

  introProgressFill: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: brandColors.sky,
  },

  page: {
    flex: 1,
    backgroundColor: brandColors.background,
    ...(isWeb && {
      scrollBehavior: "smooth",
    }),
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 28,
  },

  navShell: {
    backgroundColor: brandColors.navy,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
    ...(isWeb && {
      position: "sticky",
      top: 0,
      zIndex: 20,
      backdropFilter: "blur(14px)",
      boxShadow: "0px 12px 34px rgba(2, 16, 38, 0.16)",
    }),
  },

  navBar: {
    width: "100%",
    maxWidth: 1240,
    alignSelf: "center",
    minHeight: 72,
    paddingHorizontal: isSmallPhone ? 16 : 28,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },

  navBarPhone: {
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingTop: 18,
    paddingBottom: 16,
    gap: 12,
  },

  navBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
    maxWidth: isSmallPhone ? "100%" : 520,
  },

  navBrandHidden: {
    display: "none",
  },

  navLogo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },

  navBrandTitle: {
    color: "#FFFFFF",
    fontSize: isSmallPhone ? 13 : 15,
    fontWeight: "900",
    lineHeight: isSmallPhone ? 17 : 20,
  },

  navBrandSubtitle: {
    color: "#96A6C2",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },

  navActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginLeft: "auto",
  },

  navActionsPhone: {
    width: "100%",
    marginLeft: 0,
    justifyContent: "center",
    gap: 14,
  },

  navLink: {
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
    ...(isWeb && {
      cursor: "pointer",
      transition: "background-color 0.24s cubic-bezier(0.2, 0.8, 0.2, 1), color 0.24s ease",
      ":hover": {
        backgroundColor: "rgba(238,245,255,0.1)",
      },
    }),
  },

  navLinkText: {
    color: "#D7E4F7",
    fontSize: 13,
    fontWeight: "800",
  },

  navLoginButton: {
    backgroundColor: brandColors.blue,
    borderRadius: 8,
    minHeight: 44,
    paddingHorizontal: 20,
    paddingVertical: 11,
    justifyContent: "center",
    ...(isWeb && {
      cursor: "pointer",
      transition: "filter 0.24s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1)",
      ":hover": {
        filter: "brightness(1.08)",
        transform: "translateY(-1px)",
      },
    }),
  },

  navLoginText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  heroSection: {
    width: "100%",
    maxWidth: "100%",
    alignSelf: "stretch",
    paddingHorizontal: isSmallPhone ? 18 : 32,
    paddingTop: isSmallPhone ? 44 : 70,
    paddingBottom: 34,
    backgroundColor: brandColors.navy,
    ...(isWeb && {
      backgroundImage:
        "radial-gradient(circle at 82% 18%, rgba(28,109,208,0.32), transparent 30%), radial-gradient(circle at 18% 82%, rgba(183,213,246,0.12), transparent 28%)",
      willChange: "transform, opacity",
    }),
  },

  heroSectionPhone: {
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 26,
  },

  heroGrid: {
    minHeight: 520,
    width: "100%",
    maxWidth: 1240,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 42,
  },

  heroGridStacked: {
    minHeight: 0,
    flexDirection: "column",
    alignItems: "center",
    gap: 24,
  },

  heroCopy: {
    flex: 1,
    maxWidth: 690,
  },

  heroCopyCentered: {
    width: "100%",
    maxWidth: 760,
    alignItems: "center",
  },

  heroEyebrow: {
    color: "#D8E8FF",
    fontSize: 13,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: isSmallPhone ? 12 : 18,
    textAlign: "left",
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: isSmallPhone ? 28 : 58,
    lineHeight: isSmallPhone ? 34 : 66,
    fontWeight: "900",
    letterSpacing: 0,
    maxWidth: 780,
    textAlign: "left",
  },

  heroDescription: {
    color: "#D7E4F7",
    fontSize: isSmallPhone ? 15 : 18,
    lineHeight: isSmallPhone ? 23 : 28,
    fontWeight: "600",
    maxWidth: 620,
    marginTop: isSmallPhone ? 16 : 24,
    textAlign: "left",
  },

  heroTextCentered: {
    textAlign: "center",
  },

  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 14,
    marginTop: isSmallPhone ? 24 : 34,
  },

  heroActionsCentered: {
    justifyContent: "center",
  },

  heroActionsPhone: {
    width: "100%",
    flexDirection: "column",
    alignItems: "stretch",
  },

  heroButtonPhone: {
    width: "100%",
  },

  primaryButton: {
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: brandColors.blue,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 24,
    ...(isWeb && {
      cursor: "pointer",
      transition: "background-color 0.24s cubic-bezier(0.2, 0.8, 0.2, 1), transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.24s ease",
      ":hover": {
        filter: "brightness(1.08)",
      },
    }),
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  secondaryButton: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: brandColors.blueBorder,
    backgroundColor: "rgba(238,245,255,0.14)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 22,
    ...(isWeb && {
      cursor: "pointer",
      transition: "border-color 0.24s ease, transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1), background-color 0.24s ease",
      ":hover": {
        borderColor: "rgba(216,232,255,0.58)",
        backgroundColor: "rgba(238,245,255,0.2)",
      },
    }),
  },

  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  visitorLink: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    minHeight: 42,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(216,232,255,0.34)",
    backgroundColor: "rgba(238,245,255,0.1)",
    ...(isWeb && {
      cursor: "pointer",
      transition: "border-color 0.24s ease, background-color 0.24s ease",
      ":hover": {
        borderColor: "rgba(216,232,255,0.62)",
        backgroundColor: "rgba(238,245,255,0.16)",
      },
    }),
  },

  visitorLinkCentered: {
    alignSelf: "center",
    justifyContent: "center",
  },

  visitorLinkText: {
    color: "#D8E8FF",
    fontSize: 13,
    fontWeight: "800",
  },

  heroVisual: {
    width: "100%",
    maxWidth: 430,
    alignItems: "center",
  },

  heroVisualCentered: {
    alignSelf: "center",
  },

  heroVisualPhone: {
    maxWidth: "100%",
  },

  heroVisualStack: {
    width: "100%",
    gap: 14,
  },

  schoolCard: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(216,232,255,0.38)",
    backgroundColor: "rgba(238,245,255,0.13)",
    padding: isSmallPhone ? 18 : 28,
    ...Platform.select({
      ios: {
        shadowColor,
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.22,
        shadowRadius: 28,
      },
      android: { elevation: 8 },
      web: {
        boxShadow: "0px 26px 74px rgba(0,0,0,0.32)",
        backdropFilter: "blur(12px)",
        willChange: "transform, opacity",
      },
    }),
  },

  schoolCardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: isSmallPhone ? 18 : 24,
  },

  schoolLogo: {
    width: isSmallPhone ? 82 : 104,
    height: isSmallPhone ? 82 : 104,
    borderRadius: isSmallPhone ? 41 : 52,
    backgroundColor: "#FFFFFF",
  },

  schoolCardBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.34)",
    backgroundColor: "rgba(16,185,129,0.14)",
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  schoolCardBadgeText: {
    color: "#D1FAE5",
    fontSize: 11,
    fontWeight: "900",
  },

  schoolCardLabel: {
    color: "#D8E8FF",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  schoolCardTitle: {
    color: "#FFFFFF",
    fontSize: isSmallPhone ? 22 : 28,
    lineHeight: isSmallPhone ? 28 : 34,
    fontWeight: "900",
    letterSpacing: 0,
  },

  schoolCardDivider: {
    height: 1,
    backgroundColor: "rgba(216,232,255,0.24)",
    marginVertical: 22,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: brandColors.success,
  },

  statusText: {
    flex: 1,
    color: "#EEF5FF",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },

  accessPreviewCard: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(216,232,255,0.28)",
    backgroundColor: "rgba(2, 16, 38, 0.24)",
    padding: isSmallPhone ? 14 : 16,
    ...Platform.select({
      web: {
        backdropFilter: "blur(10px)",
        boxShadow: "0px 20px 46px rgba(0,0,0,0.2)",
        willChange: "transform, opacity",
      },
    }),
  },

  accessPreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },

  accessPreviewEyebrow: {
    color: "#D8E8FF",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  accessPreviewGrid: {
    flexDirection: "row",
    gap: 8,
  },

  accessPreviewItem: {
    flex: 1,
    minHeight: 108,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(216,232,255,0.18)",
    backgroundColor: "rgba(238,245,255,0.1)",
    padding: 11,
    justifyContent: "space-between",
  },

  accessPreviewIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  accessPreviewValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },

  accessPreviewLabel: {
    color: "#B7D5F6",
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
  },

  accessTimeline: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingHorizontal: 4,
  },

  accessTimelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: brandColors.success,
  },

  accessTimelineLine: {
    flex: 1,
    height: 2,
    borderRadius: 999,
    backgroundColor: "rgba(183,213,246,0.38)",
  },

  metricDock: {
    marginTop: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(216,232,255,0.26)",
    backgroundColor: "rgba(238,245,255,0.12)",
    padding: 10,
    flexDirection: "row",
    alignSelf: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  metricDockCompact: {
    width: "100%",
    maxWidth: 390,
    justifyContent: "center",
  },

  metricItem: {
    minWidth: 124,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "rgba(216,232,255,0.14)",
    alignItems: "center",
  },

  metricValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "900",
  },

  metricLabel: {
    color: "#96A6C2",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
  },

  platformSection: {
    backgroundColor: brandColors.background,
    paddingHorizontal: isSmallPhone ? 18 : 32,
    paddingTop: isSmallPhone ? 34 : 50,
    paddingBottom: isSmallPhone ? 34 : 48,
    alignItems: "center",
    ...(isWeb && {
      backgroundImage:
        "linear-gradient(180deg, rgba(248,251,254,1) 0%, rgba(255,255,255,1) 100%)",
    }),
  },

  sectionKicker: {
    color: brandColors.blue,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
  },

  sectionTitle: {
    color: brandColors.text,
    fontSize: isSmallPhone ? 26 : 34,
    lineHeight: isSmallPhone ? 32 : 40,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0,
  },

  sectionSubtitle: {
    color: brandColors.textMuted,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: 680,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 30,
  },

  featureGrid: {
    width: "100%",
    maxWidth: 1080,
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },

  featureCard: {
    width: isSmallPhone ? "100%" : 200,
    maxWidth: isSmallPhone ? 360 : undefined,
    minHeight: 196,
    backgroundColor: brandColors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: brandColors.border,
    padding: 18,
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
      },
      android: { elevation: 2 },
      web: {
        cursor: "default",
        boxShadow: "0px 10px 24px rgba(15,23,42,0.06)",
        transition: "box-shadow 0.24s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.24s ease, background-color 0.24s ease",
        willChange: "transform",
        ":hover": {
          borderColor: "#B7D5F6",
          backgroundColor: "#FFFFFF",
          boxShadow: "0px 18px 36px rgba(15,23,42,0.1)",
        },
      },
    }),
  },

  featureIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: brandColors.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  featureTitle: {
    color: brandColors.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 8,
  },

  featureText: {
    color: brandColors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },

  footerBand: {
    marginTop: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: brandColors.border,
    paddingHorizontal: isSmallPhone ? 18 : 32,
    paddingVertical: 26,
    alignItems: "center",
    ...(isWeb && {
      backgroundImage: "linear-gradient(180deg, #FFFFFF 0%, #F8FBFE 100%)",
    }),
  },

  footerCard: {
    width: "100%",
    maxWidth: 1080,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 18,
    flexWrap: "wrap",
  },

  footerTextWrap: {
    flex: 1,
    minWidth: 280,
    maxWidth: 620,
    alignItems: "flex-start",
  },

  footerTitle: {
    color: brandColors.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "left",
  },

  footerText: {
    color: brandColors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    marginTop: 5,
    textAlign: "left",
  },

  footerButton: {
    minHeight: 44,
    borderRadius: 8,
    backgroundColor: brandColors.blueSoft,
    borderWidth: 1,
    borderColor: brandColors.blueBorder,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    ...(isWeb && {
      cursor: "pointer",
      transition: "background-color 0.24s ease, border-color 0.24s ease",
      ":hover": {
        backgroundColor: "#D8E8FF",
        borderColor: "#9EC5F8",
      },
    }),
  },

  footerButtonText: {
    color: brandColors.blue,
    fontSize: 13,
    fontWeight: "900",
  },

  socialWrap: {
    backgroundColor: brandColors.background,
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 22,
  },

  versionText: {
    color: brandColors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },
});
