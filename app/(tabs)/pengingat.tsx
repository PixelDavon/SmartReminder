// app/(tabs)/pengingat.tsx
import { useSnackbar } from '@/src/context/SnackbarContext';
import { useAppContext } from '@context/AppContext';
import { formatDisplayDateTime } from '@utils/dateHelpers';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Pengingat() {
  const { reminders, removeReminder, removeTask, removeGoal, undoLast } = useAppContext();
  const snackbar = useSnackbar();

  const confirmDelete = (
    reminderId: string,
    linkedTaskId?: string | null,
    linkedGoalId?: string | null
  ) => {
    if (linkedTaskId) {
      Alert.alert(
        'Hapus pengingat',
        'Pengingat ini terhubung ke tugas. Apa yang ingin Anda hapus?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hanya Pengingat',
            style: 'default',
            onPress: () => {
              removeReminder(reminderId);
              snackbar?.showUndo(undoLast);
            },
          },
          {
            text: 'Pengingat & Tugas',
            style: 'destructive',
            onPress: () => {
              removeReminder(reminderId);
              removeTask(linkedTaskId);
              snackbar?.showUndo(undoLast);
            },
          },
        ]
      );
    } else if (linkedGoalId) {
      Alert.alert(
        'Hapus pengingat',
        'Pengingat ini terhubung ke tujuan. Apa yang ingin Anda hapus?',
        [
          { text: 'Batal', style: 'cancel' },
          {
            text: 'Hanya Pengingat',
            style: 'default',
            onPress: () => {
              removeReminder(reminderId);
              snackbar?.showUndo(undoLast);
            },
          },
          {
            text: 'Pengingat & Tujuan',
            style: 'destructive',
            onPress: () => {
              removeReminder(reminderId);
              removeGoal(linkedGoalId);
              snackbar?.showUndo(undoLast);
            },
          },
        ]
      );
    } else {
      Alert.alert('Hapus pengingat', 'Yakin ingin menghapus pengingat ini?', [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            removeReminder(reminderId);
            snackbar?.showUndo(undoLast);
          },
        },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={reminders.slice().sort((a, b) => new Date(a.dateTimeISO).getTime() - new Date(b.dateTimeISO).getTime())}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              {item.message ? <Text style={styles.message}>{item.message}</Text> : null}
              <Text style={styles.meta}>{formatDisplayDateTime(item.dateTimeISO)}</Text>
              <Text style={styles.note}>{item.notificationId ? 'Scheduled' : 'Not scheduled'}</Text>
            </View>

            <TouchableOpacity
              onPress={() => confirmDelete(item.id, item.taskId, item.goalId)}
              style={styles.del}
            >
              <Text style={{ color: '#c23030', fontSize: 18 }}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada pengingat.</Text>}
        contentContainerStyle={
          reminders.length === 0
            ? { flex: 1, justifyContent: 'center', alignItems: 'center' }
            : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, flexDirection: 'row', alignItems: 'center' },
  title: { fontWeight: '700' },
  message: { color: '#555', marginTop: 6 },
  meta: { color: '#777', marginTop: 6, fontSize: 12 },
  note: { color: '#999', marginTop: 6, fontSize: 12 },
  del: { padding: 8 },
  empty: { textAlign: 'center', color: '#666', fontSize: 16 },
});
