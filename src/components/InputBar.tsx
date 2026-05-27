import { useAppContext } from '@/src/context/AppContext';
import { Priority } from '@/src/models/dataModels';
import { buildISOFromDateAndTime, extractDate, extractTime } from '@/src/utils/dateHelpers';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePickerRow from './DateTimePickerRow';

export default function InputBar({
  visible,
  onClose,
  activeTab,
  editItem,
}: {
  visible: boolean;
  onClose: () => void;
  activeTab: 'Home' | 'Tugas' | 'Tujuan' | 'Pengingat';
  editItem?: any;
}) {
  //console.log('[DEBUG] InputBar props activeTab:', activeTab, 'editItem:', editItem);
  const ctx = useAppContext();
  const insets = useSafeAreaInsets();

  // Prefill fields if editing
  const [title, setTitle] = useState(editItem?.title ?? '');
  const [description, setDescription] = useState(editItem?.description ?? '');

  const isoForTime = editItem?.reminderTimeISO ?? editItem?.dateTimeISO ?? undefined;
  const isoSrc = editItem?.dueDate || editItem?.targetDate || editItem?.dateTimeISO || '';

  const [date, setDate] = useState(isoSrc ? extractDate(isoSrc) || '' : '');
  const [time, setTime] = useState(isoSrc ? extractTime(isoSrc) || '' : '');
  const [target, setTarget] = useState(editItem?.target ? String(editItem.target) : '1');
  const [unit, setUnit] = useState(editItem?.unit ?? '');
  const [priority, setPriority] = useState<Priority>(editItem?.priority ?? 'medium');
  const [reminderType, setReminderType] = useState<'none' | 'daily' | 'priority'>('none');
  const [progress, setProgress] = useState(editItem?.progress ? String(editItem.progress) : '0');

  useEffect(() => {
    if (visible) {
      if (!editItem) clearAll(); // <== reset all fields when adding new
    } else {
      // optional: clear when closing too
      setTimeout(clearAll, 300);
    }
  }, [visible, editItem]);

  useEffect(() => {
    if (editItem) {
      const iso = editItem.reminderTimeISO ?? editItem.dateTimeISO ?? undefined;
      const datePrefill = editItem.dueDate ?? editItem.targetDate ?? (iso ? extractDate(iso) : '');
      const timePrefill = iso ? extractTime(iso) : '';
      //console.log('[DEBUG] InputBar editItem changed:', editItem);
      setTitle(editItem.title ?? '');
      setDescription(editItem.description ?? '');
      
      setDate(datePrefill ?? '');
      setTime(timePrefill ?? '');
      setReminderType(editItem.reminderType ?? "none")
      setTarget(editItem.target ? String(editItem.target) : '1');
      setUnit(editItem.unit ?? '');
      setPriority(editItem.priority ?? 'medium');
      setProgress(editItem.progress ? String(editItem.progress) : '0');
    }
  }, [editItem, visible]);

  const clearAll = () => {
    setTitle('');
    setDescription('');
    setDate('');
    setTime('');
    setTarget('1');
    setUnit('');
    setPriority('medium');
    setReminderType('none');
    setProgress('0');
  };

  // validation for date/time — already works well
  useEffect(() => {
    if (!date) return;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const selectedDate = new Date(`${date}T00:00:00`);

    if (selectedDate.getTime() < todayStart.getTime()) {
      Alert.alert('Tanggal tidak valid', 'Tanggal tidak boleh sebelum hari ini.');
      setDate('');
      setTime('');
      return;
    }

    if (time) {
      if (!editItem && time === '00:00') return;
      const [hh, mm] = time.split(':');
      const combined = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        Number(hh),
        Number(mm),
        0
      );
      if (combined.getTime() < Date.now()) {
        Alert.alert('Waktu tidak valid', 'Waktu sudah lewat untuk tanggal yang dipilih. Waktu dikosongkan.');
        setTime('');
      }
    }
  }, [date, time]);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Judul diperlukan.');
      return;
    }

    const iso = buildISOFromDateAndTime(date || undefined, time || undefined) ?? undefined;

    if (date) {
      const selectedDateStart = new Date(`${date}T00:00:00`);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      if (selectedDateStart.getTime() < todayStart.getTime()) {
        Alert.alert('Tanggal tidak valid', 'Tanggal tidak boleh sebelum hari ini.');
        return;
      }

      // 🧠 FIX: also check when no time is given (defaults to midnight)
      const hhmm = time || '00:00';
      const [hh, mm] = hhmm.split(':');
      const combined = new Date(
        selectedDateStart.getFullYear(),
        selectedDateStart.getMonth(),
        selectedDateStart.getDate(),
        Number(hh),
        Number(mm),
        0
      );
      if (combined.getTime() < Date.now()) {
        Alert.alert('Waktu tidak valid', 'Waktu sudah lewat untuk tanggal yang dipilih.');
        return;
      }
    } else if (reminderType !== 'none' && activeTab === 'Pengingat') {
      Alert.alert('Validation', 'Masukkan tanggal & waktu pengingat.');
      return;
    }
    //console.log('[DEBUG] Saving with ISO:', iso);
    try {
      // Treat "Home" as "Tugas"
      const tab = activeTab === 'Home' ? 'Tugas' : activeTab;

      if (tab === 'Tugas') {
        if (editItem) {
          await ctx.editTask({
            ...editItem,
            title: title.trim(),
            description: description.trim() || undefined,
            dueDate: date || undefined,
            priority,
            reminderType,
            reminderTimeISO: iso ?? null
          }, reminderType, iso);
        } else {
          await ctx.addTask({
            title: title.trim(),
            description: description.trim() || undefined,
            dueDate: date || undefined,
            reminderTimeISO: iso ?? null,
            priority,
            reminderType,
          });
        }
      } else if (tab === 'Tujuan') {
        if (editItem) {
          await ctx.editGoal({
            ...editItem,
            title: title.trim(),
            description: description.trim() || undefined,
            target: Math.max(1, Number(target) || 1),
            unit: unit || undefined,
            targetDate: date || undefined,
            priority,
            progress: Math.max(0, Number(progress) || 0),
            reminderType,
            reminderTimeISO: iso ?? null
          }, reminderType, iso);
        } else {
          await ctx.addGoal({
            title: title.trim(),
            description: description.trim() || undefined,
            target: Math.max(1, Number(target) || 1),
            unit: unit || undefined,
            targetDate: date || undefined,
            priority,
            progress: Math.max(0, Number(progress) || 0),
            reminderTimeISO: iso ?? null,
            reminderType,
          });
        }
      } else if (tab === 'Pengingat') {
        if (!iso) {
          Alert.alert('Validation', 'Masukkan tanggal & waktu pengingat.');
          return;
        }
        await ctx.addReminder({
          title: title.trim(),
          message: description.trim() || undefined,
          dateTimeISO: iso,
          repeat: reminderType, // === 'daily' ? 'daily' : 'none',
          priority,
        });
      }
    } catch (err) {
      console.warn('save failed', err);
      Alert.alert('Error', 'Gagal menyimpan item. Pastikan waktu valid.');
      return;
    }

    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.overlay]}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[styles.overlay, { justifyContent: 'flex-end' }]}>
            <View style={[styles.modal, { paddingBottom: Math.max(16, insets.bottom + 8), maxHeight: '90%' }]}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                <Text style={styles.heading}>
                  {editItem
                    ? activeTab === 'Tujuan'
                      ? 'Edit Tujuan'
                      : activeTab === 'Tugas' || activeTab === 'Home'
                      ? 'Edit Tugas'
                      : 'Edit Pengingat'
                    : activeTab === 'Home'
                    ? 'Tambah Tugas'
                    : activeTab === 'Tujuan'
                    ? 'Tambah Tujuan'
                    : activeTab === 'Pengingat'
                    ? 'Tambah Pengingat'
                    : 'Tambah Tugas'}
                </Text>

                <TextInput
                  placeholder="Judul"
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor="#6b7280"
                  style={styles.input}
                />
                <TextInput
                  placeholder="Deskripsi (opsional)"
                  value={description}
                  onChangeText={setDescription}
                  placeholderTextColor="#6b7280"
                  style={[styles.input, { height: 80 }]}
                  multiline
                />

                <DateTimePickerRow date={date} time={time} onDateChange={setDate} onTimeChange={setTime} />

                <View style={styles.row}>
                  <Text style={styles.label}>Reminder:</Text>
                  {['none', 'daily', 'priority'].map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.remBtn, reminderType === r && styles.remActive]}
                      onPress={() => setReminderType(r as any)}
                    >
                      <Text style={reminderType === r ? styles.remTextActive : styles.remText}>
                        {r[0].toUpperCase() + r.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Prioritas:</Text>
                  {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.prioBtn, priority === p && styles.prioActive]}
                      onPress={() => setPriority(p)}
                    >
                      <Text style={priority === p ? styles.prioTextActive : styles.prioText}>
                        {p[0].toUpperCase() + p.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {activeTab === 'Tujuan' && (
                  <>
                    <View style={styles.targetRow}>
                      <TextInput
                        placeholder="Target"
                        value={target}
                        onChangeText={setTarget}
                        placeholderTextColor="#6b7280"
                        style={[styles.input, styles.targetInput]}
                        keyboardType="numeric"
                      />
                      <TextInput
                        placeholder="Satuan"
                        value={unit}
                        onChangeText={setUnit}
                        placeholderTextColor="#6b7280"
                        style={[styles.input, styles.unitInput]}
                      />
                    </View>
                    <TextInput
                      placeholder="Progress saat ini"
                      value={progress}
                      onChangeText={setProgress}
                      placeholderTextColor="#6b7280"
                      style={styles.input}
                      keyboardType="numeric"
                    />
                  </>
                )}

                <View style={styles.buttonsRow}>
                  <TouchableOpacity
                    style={[styles.btn, styles.cancelBtn]}
                    onPress={() => {
                      clearAll();
                      onClose();
                    }}
                  >
                    <Text style={styles.cancelText}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleSave}>
                    <Text style={styles.saveText}>{editItem ? 'Simpan Perubahan' : 'Simpan'}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>  
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.36)' },
  modal: { backgroundColor: '#fff', marginHorizontal: 12, borderRadius: 12, padding: 14 },
  heading: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#111' },
  input: { borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 10, marginBottom: 10, color: '#111' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label: { marginRight: 8, color: '#444', minWidth: 70 },
  remBtn: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, marginRight: 8 },
  remActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  remText: { color: '#111' },
  remTextActive: { color: '#fff' },
  prioBtn: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, marginRight: 8 },
  prioActive: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  prioText: { color: '#111' },
  prioTextActive: { color: '#fff' },
  buttonsRow: { flexDirection: 'row', marginTop: 8, justifyContent: 'space-between' },
  btn: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  cancelBtn: { backgroundColor: '#f3f4f6', marginRight: 8 },
  cancelText: { color: '#374151' },
  saveBtn: { backgroundColor: '#16a34a' },
  saveText: { color: '#fff', fontWeight: '700' },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  targetInput: {
    flex: 1,
    marginRight: 8,
  },
  unitInput: {
    flex: 1,
  },

});
