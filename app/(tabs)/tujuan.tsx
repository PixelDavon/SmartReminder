// app/(tabs)/tujuan.tsx
import ProgressBar from "@components/ProgressBar";
import { useAppContext } from "@context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Tujuan() {
  const { goals, updateGoalProgress, removeGoal } = useAppContext();

  const renderGoal = ({ item }: any) => {
    const pct = Math.round((item.progress / item.target) * 100);
    const isDone = pct >= 100;

    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>

          {item.description ? (
            <Text style={styles.desc}>{item.description}</Text>
          ) : null}

          <ProgressBar value={pct} />

          <Text style={styles.meta}>
            {item.progress}/{item.target} {item.unit ?? ""}
            {" • "}
            {pct}%
          </Text>

          {isDone && (
            <Text style={styles.completed}>🎯 Tujuan tercapai!</Text>
          )}
        </View>

        <View style={styles.actions}>
          {!isDone && (
            <TouchableOpacity
              onPress={() => updateGoalProgress(item.id, 1)}
              style={styles.actionBtn}
            >
              <Ionicons name="add-circle" size={26} color="#2563eb" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => removeGoal(item.id)}
            style={styles.actionBtn}
          >
            <Ionicons name="trash" size={22} color="#c23030" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={goals}
        keyExtractor={(i) => i.id}
        renderItem={renderGoal}
        ListEmptyComponent={
          <Text style={styles.empty}>Belum ada tujuan.</Text>
        }
        contentContainerStyle={
          goals.length === 0 ? { flex: 1, justifyContent: "center" } : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: "transparent", // use transparent so full app background shows
  },
  empty: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontWeight: "700",
    fontSize: 16,
    color: "#111",
  },
  desc: {
    color: "#555",
    marginTop: 6,
    fontSize: 14,
  },
  meta: {
    color: "#777",
    marginTop: 8,
    fontSize: 12,
  },
  completed: {
    marginTop: 6,
    color: "#16a34a",
    fontWeight: "600",
    fontSize: 13,
  },
  actions: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  actionBtn: {
    padding: 8,
  },
});
