// app/(tabs)/tugas.tsx
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSnackbar } from '@/src/context/SnackbarContext';
import { useAppContext } from '@context/AppContext';
import { formatDisplayDate } from '@utils/dateHelpers';
import { useEditModal } from './_layout';

export default function Tugas() {
  const { tasks, toggleTaskCompletion, removeTask, undoLast } = useAppContext();
  const insets = useSafeAreaInsets();
  const snackbar = useSnackbar();
  const editModal = useEditModal();

  const handleDelete = (itemId: string) => {
    removeTask(itemId);
    snackbar?.showUndo(undoLast);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => toggleTaskCompletion(item.id)}
        style={styles.checkbox}
        accessibilityLabel={item.completed ? 'Tandai belum selesai' : 'Tandai selesai'}
      >
        <Text style={{ fontSize: 18 }}>{item.completed ? '✅' : '⬜'}</Text>
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={styles.title}>{item.title}</Text>
        {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
        {item.dueDate ? <Text style={styles.meta}>{formatDisplayDate(item.dueDate)}</Text> : null}
      </View>

      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.delBtn} accessibilityLabel="Hapus tugas">
        <Text style={styles.delText}>Hapus</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => editModal?.openEditModal('Tugas', item)}
        style={styles.editBtn}
        accessibilityLabel="Edit tugas"
      >
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: Math.max(16, insets.bottom + 16) }]}>
      <FlatList
        data={tasks}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada tugas.</Text>}
        contentContainerStyle={tasks.length === 0 ? styles.emptyContainer : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: 'transparent' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { textAlign: 'center', color: '#666', fontSize: 16 },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  checkbox: { marginRight: 10 },
  body: { flex: 1 },
  title: { fontWeight: '600', fontSize: 16, color: '#111' },
  desc: { color: '#555', marginTop: 6 },
  meta: { color: '#888', marginTop: 6, fontSize: 12 },
  delBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  delText: { color: '#c23030', fontWeight: '600' },
  editBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  editText: { color: '#007bff', fontWeight: '600' },
});
