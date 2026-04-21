import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isSmallPhone = width <= 390;
const isTablet = width >= 768;
const isWide = width >= 1024;

const webHover = (styles) => (isWeb ? styles : {});

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F4F8FC",
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 36,
  },

  hero: {
    paddingTop: Platform.select({ ios: 58, android: 44, web: 44 }),
    paddingHorizontal: isWide ? 44 : 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    overflow: "hidden",
  },

  heroInner: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    alignItems: isWide ? "flex-start" : "center",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
    ...webHover({ cursor: "pointer" }),
  },

  heroBadge: {
    marginTop: 22,
    alignSelf: isWide ? "flex-start" : "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },

  heroBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#EEF5FF",
  },

  heroBody: {
    marginTop: 22,
    maxWidth: 760,
    alignItems: isWide ? "flex-start" : "center",
    alignSelf: isWide ? "flex-start" : "center",
  },

  heroIconShell: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  heroTitle: {
    fontSize: isWide ? 42 : isSmallPhone ? 28 : 34,
    lineHeight: isWide ? 48 : isSmallPhone ? 34 : 40,
    fontWeight: "800",
    color: "#FFFFFF",
    maxWidth: 620,
    textAlign: isWide ? "left" : "center",
  },

  heroSubtitle: {
    marginTop: 12,
    fontSize: isWide ? 17 : 15,
    lineHeight: 24,
    color: "rgba(255,255,255,0.82)",
    maxWidth: 640,
    textAlign: isWide ? "left" : "center",
  },

  heroStats: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: isWide ? "flex-start" : "center",
    alignSelf: isWide ? "flex-start" : "center",
    width: "100%",
    maxWidth: 760,
  },

  heroStatCard: {
    minWidth: isWide ? 156 : isSmallPhone ? 96 : 110,
    flex: isWide ? 0 : 1,
    maxWidth: isWide ? undefined : 180,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },

  heroStatValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },

  heroStatLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.74)",
    textAlign: "center",
  },

  pageShell: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    paddingHorizontal: isWide ? 28 : 16,
    marginTop: -14,
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: isWide ? 28 : 20,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#DCE6EE",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
      },
    }),
  },

  sectionHeader: {
    marginBottom: 18,
    alignItems: isWide ? "flex-start" : "center",
  },

  sectionEyebrow: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#0A3D91",
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: isSmallPhone ? 22 : 26,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: isWide ? "left" : "center",
  },

  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748B",
    maxWidth: 720,
    textAlign: isWide ? "left" : "center",
  },

  contactGrid: {
    flexDirection: isTablet ? "row" : "column",
    flexWrap: "wrap",
    gap: 14,
    alignItems: "stretch",
  },

  contactCard: {
    flex: 1,
    minWidth: isWide ? 0 : isTablet ? 280 : "100%",
    backgroundColor: "#F8FBFC",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDEAF0",
    padding: 18,
    minHeight: 220,
    justifyContent: "space-between",
    ...webHover({ cursor: "pointer" }),
  },

  contactCardContent: {
    flex: 1,
  },

  contactIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  contactLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },

  contactValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },

  contactHelper: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
    minHeight: isTablet ? 60 : 40,
  },

  contactLinkRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  contactLinkText: {
    fontSize: 13,
    fontWeight: "800",
  },

  guideGrid: {
    flexDirection: isTablet ? "row" : "column",
    gap: 14,
    alignItems: "stretch",
  },

  guideCard: {
    flex: 1,
    padding: 18,
    borderRadius: 8,
    backgroundColor: "#F8FBFE",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 172,
  },

  guideIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  guideTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },

  guideDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  faqList: {
    gap: 12,
  },

  faqItem: {
    backgroundColor: "#F8FBFE",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 15,
    ...webHover({ cursor: "pointer" }),
  },

  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  faqQuestionTextWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  faqQuestion: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    lineHeight: 20,
  },

  faqAnswer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    fontSize: 13,
    lineHeight: 21,
    color: "#64748B",
  },

  ctaCard: {
    marginTop: 18,
    borderRadius: 8,
    padding: isWide ? 28 : 20,
    borderWidth: 1,
    borderColor: "#DCE6EE",
  },

  ctaTextWrap: {
    marginBottom: 18,
    maxWidth: 760,
    alignItems: isWide ? "flex-start" : "center",
  },

  ctaTitle: {
    fontSize: isSmallPhone ? 22 : 26,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    textAlign: isWide ? "left" : "center",
  },

  ctaSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
    textAlign: isWide ? "left" : "center",
  },

  ctaActions: {
    flexDirection: isSmallPhone ? "column" : "row",
    gap: 12,
    alignItems: "stretch",
  },

  secondaryCta: {
    flex: isSmallPhone ? 0 : 1,
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.76)",
    borderWidth: 1,
    borderColor: "#D6E1E8",
    alignItems: "center",
    justifyContent: "center",
    ...webHover({ cursor: "pointer" }),
  },

  secondaryCtaText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#334155",
  },

  primaryCta: {
    flex: isSmallPhone ? 0 : 1,
    minHeight: 48,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: "#0A3D91",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    ...webHover({ cursor: "pointer" }),
  },

  primaryCtaText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  footer: {
    paddingVertical: 28,
    alignItems: "center",
  },

  footerText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
    textAlign: "center",
    marginBottom: 4,
  },

  footerSubtext: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
});
