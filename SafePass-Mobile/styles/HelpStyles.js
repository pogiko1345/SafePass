import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";
const isSmallPhone = width <= 390;
const isWide = width >= 1024;

const webHover = (styles) => (isWeb ? styles : {});

export default StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EEF4F7",
  },

  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 36,
  },

  hero: {
    paddingTop: Platform.select({ ios: 58, android: 44, web: 44 }),
    paddingHorizontal: isWide ? 44 : 20,
    paddingBottom: 34,
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: "hidden",
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
    alignSelf: "flex-start",
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
  },

  heroIconShell: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  heroTitle: {
    fontSize: isWide ? 42 : isSmallPhone ? 28 : 34,
    lineHeight: isWide ? 48 : isSmallPhone ? 34 : 40,
    fontWeight: "800",
    color: "#FFFFFF",
    maxWidth: 620,
  },

  heroSubtitle: {
    marginTop: 12,
    fontSize: isWide ? 17 : 15,
    lineHeight: 24,
    color: "rgba(255,255,255,0.82)",
    maxWidth: 640,
  },

  heroStats: {
    marginTop: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  heroStatCard: {
    minWidth: isWide ? 156 : 110,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
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
  },

  pageShell: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    paddingHorizontal: isWide ? 28 : 16,
    marginTop: -18,
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
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
  },

  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#64748B",
    maxWidth: 720,
  },

  contactGrid: {
    flexDirection: isWide ? "row" : "column",
    flexWrap: "wrap",
    gap: 14,
  },

  contactCard: {
    flex: 1,
    minWidth: isWide ? 0 : "100%",
    backgroundColor: "#F8FBFC",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#DDEAF0",
    padding: 18,
    ...webHover({ cursor: "pointer" }),
  },

  contactIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
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
    minHeight: 40,
  },

  contactLinkRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  contactLinkText: {
    fontSize: 13,
    fontWeight: "800",
  },

  guideGrid: {
    flexDirection: isWide ? "row" : "column",
    gap: 14,
  },

  guideCard: {
    flex: 1,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "#F8FBFE",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  guideIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
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
    borderRadius: 20,
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
    borderRadius: 28,
    padding: isWide ? 28 : 20,
    borderWidth: 1,
    borderColor: "#E7E5E4",
  },

  ctaTextWrap: {
    marginBottom: 18,
    maxWidth: 760,
  },

  ctaTitle: {
    fontSize: isSmallPhone ? 22 : 26,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },

  ctaSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475569",
  },

  ctaActions: {
    flexDirection: isSmallPhone ? "column" : "row",
    gap: 12,
  },

  secondaryCta: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
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
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
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
