// src/components/ProgressBar.tsx
import React from "react";
import { View, StyleSheet, Text } from "react-native";

export default function ProgressBar({ value }: { value: number }) {
  const w = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${w}%` }]} />
      </View>
      <Text style={styles.label}>{w}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  track: { height: 8, backgroundColor: "#eee", borderRadius: 6, overflow: "hidden" },
  fill: { height: 8, backgroundColor: "#2563eb" },
  label: { textAlign: "right", marginTop: 6, color: "#666", fontSize: 12 },
});
