// src/components/DateTimePickerRow.tsx
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  date: string; // YYYY-MM-DD or ''
  time: string; // HH:MM or ''
  onDateChange: (d: string) => void;
  onTimeChange: (t: string) => void;
};

const ID_SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

function formatDateDisplay(dateStr: string) {
  if (!dateStr) return 'Pilih tanggal';
  try {
    const d = new Date(`${dateStr}T00:00:00`);
    if (isNaN(d.getTime())) return 'Pilih tanggal';
    try {
      return new Intl.DateTimeFormat('id', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(d);
    } catch {
      const [y, m, day] = dateStr.split('-');
      const monthIndex = Number(m) - 1;
      const month = ID_SHORT_MONTHS[monthIndex] ?? m;
      return `${Number(day)} ${month} ${y}`;
    }
  } catch {
    return 'Pilih tanggal';
  }
}

function formatTimeDisplay(timeStr: string) {
  if (!timeStr) return 'Pilih waktu';
  const [hh, mm] = timeStr.split(':');
  if (!hh || !mm) return timeStr;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export default function DateTimePickerRow({
  date,
  time,
  onDateChange,
  onTimeChange,
}: Props) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  // parsedValue used as initial value for the picker
  const parsedValue = useMemo(() => {
    if (date) {
      const iso = `${date}T${time || '00:00'}:00`;
      const d = new Date(iso);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [date, time]);

  const openPicker = (mode: 'date' | 'time') => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const onChange = (event: DateTimePickerEvent, selected?: Date | undefined) => {
    // Android: the event indicates type 'set' or 'dismissed'
    if (Platform.OS === 'android') {
      // @ts-ignore - event may have .type on Android
      const evType = (event as any).type as string | undefined;
      if (evType === 'dismissed') {
        setShowPicker(false);
        return;
      }
      // for Android, the picker auto-closes after selection
      setShowPicker(false);
    }

    // iOS: event comes repeatedly as the user scrolls — we only act when selected is provided
    if (!selected) return;

    // Restrict past times on the same day:
    if (pickerMode === 'time' && date) {
      const today = new Date();
      const chosen = new Date(selected);
      // ensure the chosen date has the same Y/M/D as `date` param
      const [y, m, d] = date.split('-');
      const chosenDate = new Date(Number(y), Number(m) - 1, Number(d), chosen.getHours(), chosen.getMinutes(), 0);

      // if chosen date is today and chosen time < now => reject (do not call onTimeChange)
      const now = new Date();
      const isSameDay =
        chosenDate.getFullYear() === now.getFullYear() &&
        chosenDate.getMonth() === now.getMonth() &&
        chosenDate.getDate() === now.getDate();

      if (isSameDay && chosenDate.getTime() < now.getTime()) {
        // Reject choosing a past time for today: do nothing (user can re-open)
        return;
      }

      const hh = String(chosenDate.getHours()).padStart(2, '0');
      const mm = String(chosenDate.getMinutes()).padStart(2, '0');
      onTimeChange(`${hh}:${mm}`);
      return;
    }

    if (pickerMode === 'date') {
      const y = selected.getFullYear();
      const m = String(selected.getMonth() + 1).padStart(2, '0');
      const d = String(selected.getDate()).padStart(2, '0');
      onDateChange(`${y}-${m}-${d}`);
    } else {
      // when there's no `date` set, treat selected time relative to selected Date
      const hh = String(selected.getHours()).padStart(2, '0');
      const mm = String(selected.getMinutes()).padStart(2, '0');
      onTimeChange(`${hh}:${mm}`);
    }
  };

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return (
    <>
      <View style={styles.row}>
        <View style={styles.item}>
          <TouchableOpacity style={styles.box} onPress={() => openPicker('date')}>
            <Text style={[styles.label, date ? styles.value : styles.placeholder]}>{formatDateDisplay(date)}</Text>
          </TouchableOpacity>
          {date ? (
            <TouchableOpacity style={styles.clearBtn} onPress={() => onDateChange('')}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.item}>
          <TouchableOpacity style={styles.box} onPress={() => openPicker('time')}>
            <Text style={[styles.label, time ? styles.value : styles.placeholder]}>{formatTimeDisplay(time)}</Text>
          </TouchableOpacity>
          {time ? (
            <TouchableOpacity style={styles.clearBtn} onPress={() => onTimeChange('')}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {showPicker && (
        <DateTimePicker
          value={parsedValue}
          mode={pickerMode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          is24Hour={true}
          // For date/time pickers, minimumDate prevents picking past days
          minimumDate={pickerMode === 'date' ? startOfToday : undefined}
          onChange={onChange}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  item: {
    flex: 1,
    marginRight: 8,
    position: 'relative',
  },
  box: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 10,
    justifyContent: 'center',
    minHeight: 44,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 14,
  },
  value: {
    color: '#111',
  },
  placeholder: {
    color: '#6b7280',
  },
  clearBtn: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  clearText: {
    color: '#ef4444',
    fontSize: 12,
  },
});
