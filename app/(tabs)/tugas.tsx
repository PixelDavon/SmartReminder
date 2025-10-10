// app/(tabs)/tugas.tsx
import DateTimePickerRow from "@components/DateTimePickerRow";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Tugas() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tambah Tugas</Text>
      <DateTimePickerRow
        date={date}
        time={time}
        onDateChange={setDate}
        onTimeChange={setTime}
      />
      <Text style={styles.preview}>
        {date && time ? `Tugas dijadwalkan: ${date} ${time}` : "Belum ada jadwal"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b0b",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  preview: {
    color: "#ccc",
    marginTop: 10,
  },
});
