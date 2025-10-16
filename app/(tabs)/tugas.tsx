// app/(tabs)/tugas.tsx
import { useSnackbar } from '@/src/context/SnackbarContext';
import { Task } from '@/src/models/dataModels';
import { useAppContext } from '@context/AppContext';
import { formatDisplayDate } from '@utils/dateHelpers';
import React, { useMemo, useState } from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEditModal } from './_layout';

const getPriorityStyle = (priority: string) => {
  switch (priority) {
    case 'high':
      return styles.priorityHigh;
    case 'medium':
      return styles.priorityMedium;
    case 'low':
      return styles.priorityLow;
    default:
      return {};
  }
};

const groupByDate = (tasks: Task[]) => {
  const map: Record<string, Task[]> = {};

  for (const t of tasks) {
    const key = t.dueDate ? formatDisplayDate(t.dueDate) : 'Tanpa tanggal';
    if (!map[key]) map[key] = [];
    map[key].push(t);
  }

  return Object.entries(map).map(([title, data]) => ({ title, data }));
};

export default function Tugas() {
  const { tasks, toggleTaskCompletion, removeTask, undoLast } = useAppContext();
  const insets = useSafeAreaInsets();
  const snackbar = useSnackbar();
  const editModal = useEditModal();

  const [showCompleted, setShowCompleted] = useState(true);
  const [showNotCompleted, setShowNotCompleted] = useState(true);

  const [sortMode, setSortMode] = useState<'date' | 'priority'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const sortItems = (arr: Task[]) => {
    return arr.slice().sort((a, b) => {
      if (sortMode === 'priority') {
        const order: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const pa = order[a.priority ?? 'low'];
        const pb = order[b.priority ?? 'low'];
        return sortOrder === 'desc' ? pb - pa : pa - pb;
      } else {
        const dateA = new Date(a.dueDate || a.createdAt || 0).getTime();
        const dateB = new Date(b.dueDate || b.createdAt || 0).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
    });
  };

  const completed = sortItems(tasks.filter((t) => t.completed));
  const notCompleted = sortItems(tasks.filter((t) => !t.completed));

  const groupedCompleted = useMemo(() => groupByDate(completed), [completed]);
  const groupedNotCompleted = useMemo(() => groupByDate(notCompleted), [notCompleted]);

  const handleDelete = (id: string) => {
    removeTask(id);
    snackbar?.showUndo(undoLast);
  };

  const renderItem = ({ item }: { item: Task }) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() => toggleTaskCompletion(item.id)}
        style={styles.checkbox}
      >
        <Text style={{ fontSize: 18 }}>{item.completed ? '✅' : '⬜'}</Text>
      </TouchableOpacity>

      <View style={styles.body}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={[styles.priority, getPriorityStyle(item.priority)]}>
          {item.priority || 'Normal'}
        </Text>
        {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}
      </View>

      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.delBtn}>
        <Text style={styles.delText}>Hapus</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => editModal?.openEditModal('Tugas', item)}
        style={styles.editBtn}
      >
        <Text style={styles.editText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: Math.max(16, insets.bottom + 16) }]}>
      {/* Header Controls */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setSortMode((m) => (m === 'priority' ? 'date' : 'priority'))}
          style={styles.headerBtn}
        >
          <Text style={styles.headerText}>
            Urut: {sortMode === 'priority' ? 'Prioritas' : 'Tanggal'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))}
          style={styles.headerBtn}
        >
          <Text style={styles.headerText}>Arah: {sortOrder === 'desc' ? '↓' : '↑'}</Text>
        </TouchableOpacity>
      </View>

      {/* Not Completed Section */}
      <TouchableOpacity
        onPress={() => setShowNotCompleted(!showNotCompleted)}
        style={styles.sectionHeader}
      >
        <Text style={styles.sectionTitle}>
          {showNotCompleted ? '▼' : '▶'} Belum Selesai ({notCompleted.length})
        </Text>
      </TouchableOpacity>
      {showNotCompleted && (
        <SectionList
          sections={groupedNotCompleted}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.groupTitle}>{title}</Text>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>Tidak ada tugas belum selesai.</Text>
          }
        />
      )}

      {/* Completed Section */}
      <TouchableOpacity
        onPress={() => setShowCompleted(!showCompleted)}
        style={styles.sectionHeader}
      >
        <Text style={styles.sectionTitle}>
          {showCompleted ? '▼' : '▶'} Selesai ({completed.length})
        </Text>
      </TouchableOpacity>
      {showCompleted && (
        <SectionList
          sections={groupedCompleted}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.groupTitle}>{title}</Text>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Belum ada tugas selesai.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  headerBtn: { padding: 8, backgroundColor: '#f3f4f6', borderRadius: 8 },
  headerText: { fontWeight: '600', color: '#333' },
  sectionHeader: { marginTop: 12, marginBottom: 6 },
  sectionTitle: { fontWeight: '700', fontSize: 16, color: '#111' },
  groupTitle: { fontWeight: '600', fontSize: 14, marginTop: 8, color: '#555' },
  empty: { textAlign: 'center', color: '#666', fontSize: 14, marginVertical: 8 },
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
  delBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  delText: { color: '#c23030', fontWeight: '600' },
  editBtn: { paddingHorizontal: 8, paddingVertical: 6 },
  editText: { color: '#007bff', fontWeight: '600' },
  priority: { fontWeight: '600', fontSize: 12, marginTop: 6 },
  priorityHigh: { color: '#dc2626' },
  priorityMedium: { color: '#f59e0b' },
  priorityLow: { color: '#16a34a' },
});
