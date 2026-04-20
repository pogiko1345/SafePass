import React from "react";
import { StyleSheet, Text, View } from "react-native";

const FLOOR_LAYOUTS = {
  ground: {
    title: "Ground Floor",
    walls: [
      { left: "4%", top: "18%", width: "82%", height: 2 },
      { left: "4%", top: "58%", width: "82%", height: 2 },
      { left: "4%", top: "18%", width: 2, height: "40%" },
      { left: "86%", top: "18%", width: 2, height: "40%" },
      { left: "82%", top: "34%", width: "14%", height: 2 },
      { left: "82%", top: "78%", width: "14%", height: 2 },
      { left: "82%", top: "34%", width: 2, height: "44%" },
      { left: "96%", top: "34%", width: 2, height: "44%" },
      { left: "15%", top: "18%", width: 2, height: "18%" },
      { left: "22%", top: "18%", width: 2, height: "18%" },
      { left: "31%", top: "18%", width: "8%", height: 2 },
      { left: "31%", top: "18%", width: 2, height: "10%" },
      { left: "39%", top: "18%", width: 2, height: "10%" },
      { left: "49%", top: "18%", width: 2, height: "10%" },
      { left: "55%", top: "18%", width: "11%", height: 2 },
      { left: "66%", top: "18%", width: 2, height: "10%" },
      { left: "26%", top: "46%", width: "16%", height: 2 },
      { left: "42%", top: "46%", width: 2, height: "12%" },
      { left: "35%", top: "52%", width: "10%", height: 2 },
      { left: "45%", top: "52%", width: 2, height: "6%" },
      { left: "45%", top: "40%", width: "16%", height: 2 },
      { left: "61%", top: "40%", width: 2, height: "18%" },
      { left: "63%", top: "46%", width: "13%", height: 2 },
      { left: "73%", top: "30%", width: 2, height: "10%" },
      { left: "73%", top: "46%", width: 2, height: "12%" },
      { left: "76%", top: "40%", width: "6%", height: 2 },
      { left: "76%", top: "50%", width: "4%", height: 2 },
      { left: "18%", top: "18%", width: "4%", height: 1 },
      { left: "32%", top: "18%", width: "6%", height: 1 },
      { left: "82.5%", top: "34%", width: "13%", height: 1 },
      { left: "82.5%", top: "41%", width: "13%", height: 1 },
      { left: "82.5%", top: "48%", width: "13%", height: 1 },
      { left: "82.5%", top: "55%", width: "13%", height: 1 },
      { left: "82.5%", top: "62%", width: "13%", height: 1 },
      { left: "82.5%", top: "69%", width: "13%", height: 1 },
      { left: "86.5%", top: "34.5%", width: 1, height: "43%" },
      { left: "91%", top: "34.5%", width: 1, height: "43%" },
      { left: "70.5%", top: "24%", width: "5%", height: 2, transform: [{ rotate: "140deg" }] },
      { left: "78.5%", top: "31.5%", width: "2.5%", height: 1, borderRadius: 999 },
      { left: "78.2%", top: "31.2%", width: "3.2%", height: "6%", borderWidth: 1, borderColor: "#111827", borderTopColor: "transparent", borderLeftColor: "transparent", borderBottomLeftRadius: 999, borderTopRightRadius: 999, backgroundColor: "transparent" },
    ],
  },
  mezzanine: {
    title: "Mezzanine Electronics Layout",
    walls: [
      { left: "4%", top: "18%", width: "82%", height: 2 },
      { left: "4%", top: "58%", width: "82%", height: 2 },
      { left: "4%", top: "18%", width: 2, height: "40%" },
      { left: "86%", top: "18%", width: 2, height: "40%" },
      { left: "82%", top: "34%", width: "14%", height: 2 },
      { left: "82%", top: "78%", width: "14%", height: 2 },
      { left: "82%", top: "34%", width: 2, height: "44%" },
      { left: "96%", top: "34%", width: 2, height: "44%" },
      { left: "14%", top: "18%", width: 2, height: "12%" },
      { left: "16%", top: "26%", width: "6%", height: 2 },
      { left: "23%", top: "18%", width: 2, height: "14%" },
      { left: "31%", top: "18%", width: 2, height: "24%" },
      { left: "31%", top: "42%", width: "10%", height: 2 },
      { left: "42%", top: "31%", width: "10%", height: 2 },
      { left: "52%", top: "31%", width: 2, height: "11%" },
      { left: "64%", top: "18%", width: 2, height: "8%" },
      { left: "74%", top: "18%", width: 2, height: "16%" },
      { left: "74%", top: "34%", width: 1, height: "24%" },
      { left: "78.5%", top: "18.5%", width: "2.5%", height: 1, borderRadius: 999 },
      { left: "78.2%", top: "18.2%", width: "3.2%", height: "6%", borderWidth: 1, borderColor: "#111827", borderTopColor: "transparent", borderLeftColor: "transparent", borderBottomLeftRadius: 999, borderTopRightRadius: 999, backgroundColor: "transparent" },
      { left: "82.5%", top: "34%", width: "13%", height: 1 },
      { left: "82.5%", top: "41%", width: "13%", height: 1 },
      { left: "82.5%", top: "48%", width: "13%", height: 1 },
      { left: "82.5%", top: "55%", width: "13%", height: 1 },
      { left: "82.5%", top: "62%", width: "13%", height: 1 },
      { left: "82.5%", top: "69%", width: "13%", height: 1 },
      { left: "86.5%", top: "34.5%", width: 1, height: "43%" },
      { left: "91%", top: "34.5%", width: 1, height: "43%" },
    ],
    labels: [
      { text: "Conference Room", left: "10%", top: "35%", size: 11 },
      { text: "Chairman", left: "19%", top: "41%", size: 10 },
      { text: "Flight Operations", left: "31%", top: "42%", size: 10 },
      { text: "Head Of Training\nRoom", left: "43%", top: "41%", size: 10 },
      { text: "I.T Room", left: "56%", top: "41%", size: 10 },
      { text: "Faculty Room", left: "69%", top: "36%", size: 10 },
      { text: "Academy Director", left: "84%", top: "36%", size: 10 },
      { text: "CR", left: "94%", top: "25%", size: 9 },
      { text: "STO", left: "94%", top: "43%", size: 9 },
    ],
  },
};

export default function FloorBlueprintDiagram({ floorId = "ground" }) {
  const layout = FLOOR_LAYOUTS[floorId] || FLOOR_LAYOUTS.ground;

  return (
    <View style={styles.surface}>
      <View style={[styles.grid, { pointerEvents: "none" }]} />
      <Text style={styles.title}>{layout.title}</Text>
      <View style={styles.canvas}>
        {layout.walls.map((wall, index) => (
          <View key={`${floorId}-wall-${index}`} style={[styles.wall, wall]} />
        ))}
        {(layout.labels || []).map((label, index) => (
          <Text
            key={`${floorId}-label-${index}`}
            style={[
              styles.roomLabel,
              {
                left: label.left,
                top: label.top,
                fontSize: label.size || 10,
              },
            ]}
          >
            {label.text}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  surface: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#F8FBFE",
  },
  grid: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.14,
    backgroundColor: "#FFFFFF",
  },
  title: {
    position: "absolute",
    top: "6%",
    left: "6%",
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
  },
  canvas: {
    position: "absolute",
    top: "12%",
    right: 0,
    bottom: 0,
    left: 0,
  },
  wall: {
    position: "absolute",
    backgroundColor: "#111827",
  },
  roomLabel: {
    position: "absolute",
    color: "#111827",
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 12,
    transform: [{ translateX: -20 }, { translateY: -8 }],
  },
});
