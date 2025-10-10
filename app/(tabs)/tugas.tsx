import { useAppContext } from "@context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Tugas() {
  const { tasks, toggleTaskCompletion, removeTask } = useAppContext();

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada tugas.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.item, item.completed && styles.completed]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
              {item.dueDate ? <Text style={styles.meta}>Due: {item.dueDate}</Text> : null}
              {item.reminderTimeISO ? (
                <Text style={styles.meta}>
                  Remind: {new Date(item.reminderTimeISO).toLocaleString()}
                </Text>
              ) : null}
            </View>

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)} style={styles.actionBtn}>
                <Ionicons
                  name={item.completed ? "checkmark-circle" : "checkmark-circle-outline"}
                  size={24}
                  color="#2b8a3e"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeTask(item.id)} style={styles.actionBtn}>
                <Ionicons name="trash" size={22} color="#c23030" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  empty: { textAlign: "center", marginTop: 20, color: "#666" },
  item: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 10, flexDirection: "row" },
  completed: { opacity: 0.7 },
  title: { fontWeight: "600", fontSize: 16 },
  desc: { color: "#555", marginTop: 4 },
  meta: { color: "#888", marginTop: 6, fontSize: 12 },
  actions: { justifyContent: "center", alignItems: "center" },
  actionBtn: { padding: 6 },
});
