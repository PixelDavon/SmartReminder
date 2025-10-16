// app/(tabs)/tujuan.tsx
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSnackbar } from '@/src/context/SnackbarContext';
import ProgressBar from '@components/ProgressBar';
import { useAppContext } from '@context/AppContext';
import { formatDisplayDate } from '@utils/dateHelpers';
import { useEditModal } from './_layout';

export default function Tujuan() {
  const { goals, updateGoalProgress, removeGoal, undoLast } = useAppContext();
  const insets = useSafeAreaInsets();
  const snackbar = useSnackbar();
  const editModal = useEditModal();

  const confirmDelete = (id: string) => {
    Alert.alert('Hapus tujuan', 'Yakin ingin menghapus tujuan ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => {
          removeGoal(id);
          snackbar?.showUndo(undoLast);
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => {
    const pct = item.target > 0 ? Math.round((item.progress / item.target) * 100) : 0;
    const isDone = pct >= 100;

    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}

          <View style={{ marginTop: 8 }}>
            <ProgressBar value={pct} />
          </View>

          <Text style={styles.meta}>
            {item.progress}/{item.target} {item.unit ?? ''} • {pct}%
          </Text>

          {item.targetDate ? <Text style={styles.meta}>Target: {formatDisplayDate(item.targetDate)}</Text> : null}
          {isDone && <Text style={styles.done}>🎯 Tujuan tercapai!</Text>}
        </View>

        <View style={styles.actions}>
          {!isDone && (
            <TouchableOpacity
              onPress={() => updateGoalProgress(item.id, 1)}
              style={styles.actionBtn}
              accessibilityLabel="Tambah progress"
            >
              <Text style={styles.plus}>＋</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => updateGoalProgress(item.id, -1)}
            style={styles.actionBtn}
            accessibilityLabel="Kurangi progress"
          >
            <Text style={styles.minus}>−</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => confirmDelete(item.id)}
            style={styles.actionBtn}
            accessibilityLabel="Hapus tujuan"
          >
            <Text style={styles.del}>🗑️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => editModal?.openEditModal('Tujuan', item)}
            style={styles.actionBtn}
            accessibilityLabel="Edit tujuan"
          >
            <Text style={styles.edit}>✏️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(16, insets.bottom + 16) }]}>
      <FlatList
        data={goals.slice().sort((a, b) => (b.progress / Math.max(1, b.target)) - (a.progress / Math.max(1, a.target)))}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Belum ada tujuan.</Text>}
        contentContainerStyle={goals.length === 0 ? styles.emptyContainer : undefined}
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
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontWeight: '700', fontSize: 16, color: '#111' },
  desc: { color: '#555', marginTop: 6, fontSize: 14 },
  meta: { color: '#777', marginTop: 8, fontSize: 12 },
  done: { marginTop: 6, color: '#16a34a', fontWeight: '600', fontSize: 13 },
  actions: { marginLeft: 8, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  actionBtn: { padding: 8 },
  plus: { fontSize: 22, color: '#2563eb' },
  minus: { fontSize: 22, color: '#888' },
  del: { fontSize: 18, color: '#c23030' },
  edit: { fontSize: 18, color: '#007bff' },
});
