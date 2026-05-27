import { useSnackbar } from '@/src/context/SnackbarContext';
import { Goal } from '@/src/models/dataModels';
import ProgressBar from '@components/ProgressBar';
import { useAppContext } from '@context/AppContext';
import { formatDisplayDate } from '@utils/dateHelpers';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEditModal } from './_layout';

const getPriorityStyle = (priority?: string) => {
  switch (priority) {
    case 'high': return styles.priorityHigh;
    case 'medium': return styles.priorityMedium;
    case 'low': return styles.priorityLow;
    default: return {};
  }
};

const groupByTargetDate = (goals: Goal[]) => {
  const map: Record<string, Goal[]> = {};
  for (const g of goals) {
    const key = g.targetDate ? formatDisplayDate(g.targetDate) : 'Tanpa tanggal';
    if (!map[key]) map[key] = [];
    map[key].push(g);
  }
  return Object.entries(map).map(([title, data]) => ({ title, data }));
};

export default function Tujuan() {
  const { goals, updateGoalProgress, removeGoal, undoLast } = useAppContext();
  const insets = useSafeAreaInsets();
  const snackbar = useSnackbar();
  const editModal = useEditModal();

  const [sortMode, setSortMode] = useState<'priority' | 'progress'>('priority');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showCompleted, setShowCompleted] = useState(true);
  const [showNotCompleted, setShowNotCompleted] = useState(true);

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

  const sortGoals = (arr: Goal[]) => {
    return arr.slice().sort((a, b) => {
      if (sortMode === 'priority') {
        const order: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const pa = order[a.priority ?? 'low'];
        const pb = order[b.priority ?? 'low'];
        return sortOrder === 'desc' ? pb - pa : pa - pb;
      } else {
        const pa = a.target > 0 ? a.progress / a.target : 0;
        const pb = b.target > 0 ? b.progress / b.target : 0;
        return sortOrder === 'desc' ? pb - pa : pa - pb;
      }
    });
  };

  const completed = sortGoals(goals.filter((g) => g.target > 0 && g.progress >= g.target));
  const notCompleted = sortGoals(goals.filter((g) => g.target === 0 || g.progress < g.target));

  const groupedCompleted = useMemo(() => groupByTargetDate(completed), [completed]);
  const groupedNotCompleted = useMemo(() => groupByTargetDate(notCompleted), [notCompleted]);

  const renderItem = ({ item }: { item: Goal }) => {
    const pct = item.target > 0 ? Math.round((item.progress / item.target) * 100) : 0;
    const isDone = pct >= 100;

    return (
      <View style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={[styles.priority, getPriorityStyle(item.priority)]}>
            {item.priority || 'Normal'}
          </Text>
          {item.description ? <Text style={styles.desc}>{item.description}</Text> : null}

          <View style={{ marginTop: 8 }}>
            <ProgressBar value={pct} />
          </View>

          <Text style={styles.meta}>
            {item.progress}/{item.target} {item.unit ?? ''} • {pct}%
          </Text>

          {item.targetDate ? (
            <Text style={styles.meta}>Target: {formatDisplayDate(item.targetDate)}</Text>
          ) : null}
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
      {/* Header Controls */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => setSortMode((m) => (m === 'priority' ? 'progress' : 'priority'))}
          style={styles.headerBtn}
        >
          <Text style={styles.headerText}>
            Urut: {sortMode === 'priority' ? 'Prioritas' : 'Progress'}
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
          {showNotCompleted ? '▼' : '▶'} Belum Tercapai ({notCompleted.length})
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
          ListEmptyComponent={<Text style={styles.empty}>Belum ada tujuan aktif.</Text>}
        />
      )}

      {/* Completed Section */}
      <TouchableOpacity
        onPress={() => setShowCompleted(!showCompleted)}
        style={styles.sectionHeader}
      >
        <Text style={styles.sectionTitle}>
          {showCompleted ? '▼' : '▶'} Tercapai ({completed.length})
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
          ListEmptyComponent={<Text style={styles.empty}>Belum ada tujuan tercapai.</Text>}
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
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  title: { fontWeight: '600', fontSize: 16, color: '#111' },
  desc: { color: '#555', marginTop: 6, fontSize: 14 },
  meta: { color: '#777', marginTop: 6, fontSize: 12 },
  done: { marginTop: 6, color: '#16a34a', fontWeight: '600', fontSize: 13 },
  actions: { marginLeft: 8, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  actionBtn: { padding: 8 },
  plus: { fontSize: 22, color: '#2563eb' },
  minus: { fontSize: 22, color: '#888' },
  del: { fontSize: 18, color: '#c23030' },
  edit: { fontSize: 18, color: '#007bff' },
  priority: { fontWeight: '600', fontSize: 12, marginTop: 6 },
  priorityHigh: { color: '#dc2626' },
  priorityMedium: { color: '#f59e0b' },
  priorityLow: { color: '#16a34a' },
});
