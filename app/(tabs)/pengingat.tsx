import { useAppContext } from "@context/AppContext";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Pengingat() {
  const { reminders, removeReminder } = useAppContext();

  return (
    <View style={styles.container}>
      <FlatList
        data={reminders}
        keyExtractor={(i) => i.id}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada pengingat.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.meta}>{new Date(item.dateTimeISO).toLocaleString()}</Text>
              {item.message ? <Text style={styles.desc}>{item.message}</Text> : null}
            </View>

            <TouchableOpacity onPress={() => removeReminder(item.id)} style={styles.del}>
              <Ionicons name="trash" size={22} color="#c23030" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  empty: { textAlign: "center", marginTop: 20, color: "#666" },
  card: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  title: { fontWeight: "700" },
  meta: { color: "#777", marginTop: 6, fontSize: 12 },
  desc: { color: "#555", marginTop: 6 },
  del: { padding: 8 },
});
