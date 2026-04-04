import React from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SecurityLogsScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0A3D91" />
        </TouchableOpacity>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#111827", marginLeft: 16 }}>
          Security Logs
        </Text>
      </View>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Ionicons name="shield-checkmark-outline" size={60} color="#CBD5E1" />
        <Text style={{ fontSize: 18, color: "#6B7280", marginTop: 16 }}>
          Security Logs Coming Soon
        </Text>
      </View>
    </SafeAreaView>
  );
}