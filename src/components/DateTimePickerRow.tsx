// src/components/DateTimePickerRow.tsx
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useMemo, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  date: string; // YYYY-MM-DD or ''
  time: string; // HH:MM or ''
  onDateChange: (d: string) => void;
  onTimeChange: (t: string) => void;
};

const ID_SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
];

/** Format YYYY-MM-DD -> "10 Okt 2025" (tries Intl, else fallback to ID short months) */
function formatDateDisplay(dateStr: string) {
  if (!dateStr) return "Pilih tanggal";
  try {
    const d = new Date(`${dateStr}T00:00:00`);
    if (isNaN(d.getTime())) return "Pilih tanggal";

    try {
      return new Intl.DateTimeFormat("id", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(d);
    } catch {
      const [y, m, day] = dateStr.split("-");
      const monthIndex = Number(m) - 1;
      const month = ID_SHORT_MONTHS[monthIndex] ?? m;
      return `${Number(day)} ${month} ${y}`;
    }
  } catch {
    return "Pilih tanggal";
  }
}

function formatTimeDisplay(timeStr: string) {
  if (!timeStr) return "Pilih waktu";
  const [hh, mm] = timeStr.split(":");
  if (!hh || !mm) return timeStr;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export default function DateTimePickerRow({
  date,
  time,
  onDateChange,
  onTimeChange,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

  const parsedValue = useMemo(() => {
    if (date) {
      const iso = `${date}T${time || "00:00"}:00`;
      const d = new Date(iso);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [date, time]);

  const openPicker = (mode: "date" | "time") => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const onChange = (_event: any, selected?: Date) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (!selected) return;

    if (pickerMode === "date") {
      const y = selected.getFullYear();
      const m = String(selected.getMonth() + 1).padStart(2, "0");
      const d = String(selected.getDate()).padStart(2, "0");
      onDateChange(`${y}-${m}-${d}`);
    } else {
      const hh = String(selected.getHours()).padStart(2, "0");
      const mm = String(selected.getMinutes()).padStart(2, "0");
      onTimeChange(`${hh}:${mm}`);
    }
  };

  return (
    <>
      <View style={styles.row}>
        <View style={styles.item}>
          <TouchableOpacity style={styles.box} onPress={() => openPicker("date")}>
            <Text style={[styles.label, date ? styles.value : styles.placeholder]}>
              {formatDateDisplay(date)}
            </Text>
          </TouchableOpacity>
          {date ? (
            <TouchableOpacity style={styles.clearBtn} onPress={() => onDateChange("")}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.item}>
          <TouchableOpacity style={styles.box} onPress={() => openPicker("time")}>
            <Text style={[styles.label, time ? styles.value : styles.placeholder]}>
              {formatTimeDisplay(time)}
            </Text>
          </TouchableOpacity>
          {time ? (
            <TouchableOpacity style={styles.clearBtn} onPress={() => onTimeChange("")}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {showPicker && (
        <DateTimePicker
          value={parsedValue}
          mode={pickerMode}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          is24Hour={true}
          onChange={onChange}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 10,
  },
  item: {
    flex: 1,
    marginRight: 8,
    position: "relative",
  },
  box: {
    borderWidth: 1,
    borderColor: "#555",
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: "center",
    minHeight: 44,
    backgroundColor: "#1a1a1a",
  },
  label: {
    fontSize: 14,
  },
  value: {
    color: "#fff",
  },
  placeholder: {
    color: "#aaa",
  },
  clearBtn: {
    position: "absolute",
    right: 10,
    top: 10,
  },
  clearText: {
    color: "#f87171",
    fontSize: 12,
  },
});
