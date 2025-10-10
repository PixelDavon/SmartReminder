// src/components/InputBar.tsx
import { useAppContext } from "@context/AppContext";
import React, { useState } from "react";
import {
  Button,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function InputBar({
  visible,
  onClose,
  activeTab,
}: {
  visible: boolean;
  onClose: () => void;
  activeTab: "Tugas" | "Tujuan" | "Pengingat";
}) {
  const { addTask, addGoal, addReminder } = useAppContext();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [time, setTime] = useState(""); // HH:MM
  const [target, setTarget] = useState("1");
  const [unit, setUnit] = useState("tugas");

  const clearAll = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setTarget("1");
    setUnit("tugas");
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    if (activeTab === "Tugas") {
      // Optional reminder time ISO string
      const reminderISO =
        date && time ? new Date(`${date}T${time}:00`).toISOString() : undefined;

      await addTask({
        title: title.trim(),
        description: description.trim(),
        dueDate: date || undefined,
        reminderTimeISO: reminderISO, // ✅ fixed key name
      });
    } else if (activeTab === "Tujuan") {
      await addGoal({
        title: title.trim(),
        description: description.trim(),
        target: Number(target) || 1,
        targetDate: date || undefined,
      });
      // ✅ Removed "unit" — not part of the Goal model (we could add later if needed)
    } else if (activeTab === "Pengingat") {
      if (!date || !time) {
        alert("Masukkan tanggal dan waktu pengingat (YYYY-MM-DD dan HH:MM).");
        return;
      }

      const dt = new Date(`${date}T${time}:00`).toISOString();
      await addReminder({
        title: title.trim(),
        dateTimeISO: dt, // ✅ fixed key name
        message: description.trim(),
      });
    }

    clearAll();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.heading}>Tambah {activeTab}</Text>

            <TextInput
              placeholder="Judul"
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />
            <TextInput
              placeholder="Deskripsi (opsional)"
              value={description}
              onChangeText={setDescription}
              style={[styles.input, { height: 80 }]}
              multiline
            />

            <TextInput
              placeholder="Tanggal (YYYY-MM-DD)"
              value={date}
              onChangeText={setDate}
              style={styles.input}
            />
            <TextInput
              placeholder="Waktu (HH:MM)"
              value={time}
              onChangeText={setTime}
              style={styles.input}
            />

            {activeTab === "Tujuan" && (
              <>
                <TextInput
                  placeholder="Target (angka)"
                  value={target}
                  onChangeText={setTarget}
                  style={styles.input}
                  keyboardType="numeric"
                />
                <TextInput
                  placeholder="Satuan (contoh: tugas)"
                  value={unit}
                  onChangeText={setUnit}
                  style={styles.input}
                />
              </>
            )}

            <View style={styles.buttons}>
              <Button title="Simpan" onPress={handleSave} />
              <Button
                title="Batal"
                color="red"
                onPress={() => {
                  clearAll();
                  onClose();
                }}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
  },
  heading: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  buttons: { flexDirection: "row", justifyContent: "space-between" },
});
