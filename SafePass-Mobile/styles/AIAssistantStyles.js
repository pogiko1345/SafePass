// styles/AIAssistantStyles.js
import { StyleSheet, Platform, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default StyleSheet.create({
  // ============ MODAL CONTAINERS ============
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
      web: { boxShadow: "0px 8px 24px rgba(0,0,0,0.15)" },
    }),
  },

  // ============ HEADER ============
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  // ============ QUICK ACTIONS ============
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },

  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },

  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0A3D91',
  },

  // ============ CONVERSATION ============
  conversationContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },

  messageBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },

  assistantBubble: {
    alignSelf: 'flex-start',
    gap: 8,
  },

  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#0A3D91',
    borderRadius: 20,
    padding: 12,
  },

  assistantIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1E293B',
    flex: 1,
  },

  userMessageText: {
    color: '#FFFFFF',
  },

  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },

  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },

  // ============ INPUT AREA ============
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 12,
  },

  input: {
    flex: 1,
    backgroundColor: '#F8FBFE',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      web: {
        outline: 'none',
      },
    }),
  },

  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0A3D91',
    justifyContent: 'center',
    alignItems: 'center',
  },

  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
});