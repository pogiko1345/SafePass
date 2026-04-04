import { StyleSheet, Platform } from "react-native";

export default StyleSheet.create({
  // ============ LAYOUT ============
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  // ============ HEADER - KEPT FOR OTHER SCREENS ============
  header: {
    backgroundColor: "#0A3D91",
    padding: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#fff",
    fontSize: 14,
    opacity: 0.9,
    marginTop: 5,
  },

  // ============ CARDS ============
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginVertical: 10,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 3 },
      web: { boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" },
    }),
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#111827",
  },

  // ============ FORMS ============
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
  passwordStrength: {
    fontSize: 12,
    color: "#10B981",
    marginTop: 4,
  },
  successText: {
    fontSize: 12,
    color: "#10B981",
    marginTop: 4,
  },

  // ============ BUTTONS ============
  buttonPrimary: {
    backgroundColor: "#0A3D91",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonSecondary: {
    backgroundColor: "#FFD400",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },

  // ============ DASHBOARD STATS ============
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 10,
  },
  statCard: {
    backgroundColor: "#ffffff",
    width: "48%",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
      web: { boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.05)" },
    }),
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },

  // ============ PICKER STYLES ============
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  pickerSelectedText: {
    fontSize: 16,
    color: "#111827",
  },
  pickerPlaceholderText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  pickerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  pickerItemText: {
    fontSize: 16,
    color: "#111827",
  },
  pickerList: {
    maxHeight: 300,
  },

  // ============ MODAL STYLES ============
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  // ============ LAYOUT HELPERS ============
  rowInputGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  marginTop: {
    marginTop: 15,
  },
  marginTopLarge: {
    marginTop: 20,
  },

  // ============ COMMON TEXT STYLES ============
  smallText: {
    fontSize: 12,
    color: "#6B7280",
  },

  // ============ FORM OPTIONS ============
  formOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#0A3D91",
    borderColor: "#0A3D91",
  },
  checkboxLabel: {
    color: "#374151",
    fontSize: 14,
  },
  forgotPassword: {
    color: "#0A3D91",
    fontWeight: "600",
  },

  // ============ NFC SECTION ============
  nfcSection: {
    marginTop: 20,
    alignItems: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    alignSelf: "stretch",
    marginBottom: 15,
  },
  nfcContainer: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  nfcIcon: {
    backgroundColor: "#0A3D91",
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
  },
});