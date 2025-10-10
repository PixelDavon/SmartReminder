// src/components/InputBar.tsx
import DateTimePickerRow from "@components/DateTimePickerRow";
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
      const reminderISO =
        date && time ? new Date(`${date}T${time}:00`).toISOString() : undefined;

      await addTask({
        title: title.trim(),
        description: description.trim(),
        dueDate: date || undefined,
        reminderTimeISO: reminderISO,
      });
    } else if (activeTab === "Tujuan") {
      await addGoal({
        title: title.trim(),
        description: description.trim(),
        target: Number(target) || 1,
        targetDate: date || undefined,
      });
    } else if (activeTab === "Pengingat") {
      if (!date || !time) {
        alert("Masukkan tanggal dan waktu pengingat (YYYY-MM-DD dan HH:MM).");
        return;
      }

      const dt = new Date(`${date}T${time}:00`).toISOString();
      await addReminder({
        title: title.trim(),
        dateTimeISO: dt,
        message: description.trim(),
      });
    }

    clearAll();
    onClose();
  };

  const placeholderColor = "#6b7280";
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.heading}>Tambah {activeTab}</Text>

            <TextInput
              placeholder="Judul"
              placeholderTextColor={placeholderColor}
              value={title}
              onChangeText={setTitle}
              style={styles.input}
            />
            <TextInput
              placeholder="Deskripsi (opsional)"
              placeholderTextColor={placeholderColor}
              value={description}
              onChangeText={setDescription}
              style={[styles.input, { height: 80 }]}
              multiline
            />

            {/* Native date/time picker row with Clear + pretty display */}
            <DateTimePickerRow date={date} time={time} onDateChange={setDate} onTimeChange={setTime} />

            {activeTab === "Tujuan" && (
              <>
                <TextInput
                  placeholder="Target (angka)"
                  placeholderTextColor={placeholderColor}
                  value={target}
                  onChangeText={setTarget}
                  style={styles.input}
                  keyboardType="numeric"
                />
                <TextInput
                  placeholder="Satuan (contoh: tugas)"
                  placeholderTextColor={placeholderColor}
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
  heading: { fontSize: 18, fontWeight: "700", marginBottom: 10, color: "#111" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    color: "#111",
  },
  buttons: { flexDirection: "row", justifyContent: "space-between" },
});
