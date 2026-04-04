import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  // ============ LOADING ============
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },

  // ============ HEADER ============
  header: {
    backgroundColor: "#0A3D91",
    paddingTop: Platform.OS === "ios" ? 20 : 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    marginTop: 4,
  },
  
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ============ STATS ============
  statsContainer: {
    marginTop: -12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  
  statsGrid: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
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
  
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 8,
  },
  
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  
  statValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "500",
  },

  // ============ FILTERS ============
  filtersSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  
  filterGroup: {
    marginBottom: 16,
  },
  
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 8,
    marginLeft: 4,
  },
  
  filterScroll: {
    paddingRight: 20,
  },
  
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.02,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  
  filterChipActive: {
    backgroundColor: "#0A3D91",
    borderColor: "#0A3D91",
  },
  
  filterChipIcon: {
    marginRight: 6,
  },
  
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4B5563",
  },
  
  filterChipTextActive: {
    color: "#FFFFFF",
  },

  // ============ LOGS LIST ============
  logsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  
  dateGroup: {
    marginBottom: 24,
  },
  
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  
  dateBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F6FC",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  
  dateText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0A3D91",
    marginLeft: 6,
  },
  
  logCount: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },

  // ============ LOG CARD ============
  logCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
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
  
  logIconContainer: {
    marginRight: 12,
  },
  
  logIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  
  logContent: {
    flex: 1,
  },
  
  logHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  
  logLocation: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  
  logTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  logTypeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  
  logDetails: {
    marginBottom: 6,
  },
  
  logTime: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  
  logTimeText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 6,
  },
  
  logCardId: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  logCardIdText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginLeft: 6,
  },
  
  logNotes: {
    fontSize: 12,
    color: "#6B7280",
    fontStyle: "italic",
    marginTop: 4,
  },
  
  logStatus: {
    marginLeft: 12,
    justifyContent: "center",
  },
  
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // ============ EMPTY STATE ============
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 20,
  },
  
  emptyStateIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
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
  
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  
  emptyStateText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  
  clearFiltersButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F6FC",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  
  clearFiltersText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0A3D91",
    marginLeft: 8,
  },

  // ============ PAGINATION ============
  paginationInfo: {
    alignItems: "center",
    paddingVertical: 20,
  },
  
  paginationText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 12,
  },
  
  loadMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  
  loadMoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0A3D91",
    marginRight: 6,
  },

  // ============ WEB OPTIMIZATIONS ============
  ...(Platform.OS === "web" && {
    container: {
      maxWidth: 800,
      marginHorizontal: "auto",
      width: "100%",
    },
    filterChip: {
      cursor: "pointer",
      transition: "all 0.2s ease",
      ":hover": {
        backgroundColor: "#F9FAFB",
      },
    },
    filterChipActive: {
      ":hover": {
        backgroundColor: "#0A3D91",
      },
    },
    logCard: {
      cursor: "pointer",
      transition: "transform 0.2s ease",
      ":hover": {
        transform: "translateY(-2px)",
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
    },
  }),
});