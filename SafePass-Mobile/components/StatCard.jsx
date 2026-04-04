import { View, Text } from "react-native";
import styles from "../styles/mainStyles";

export default function StatCard({ title, value, color = "#0A3D91" }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}