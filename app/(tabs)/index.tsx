// app/(tabs)/index.tsx
import ProgressBar from '@components/ProgressBar';
import { useAppContext } from '@context/AppContext';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function HomeScreen() {
  const { tasks = [], goals = [] } = useAppContext(); // safe fallback to prevent undefined errors

  const totalTasks = tasks?.length ?? 0;
  const completedTasks = tasks?.filter((t) => t.completed)?.length ?? 0;
  const tasksPct =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const totalGoals = goals?.length ?? 0;
  const totalProgressPct =
    totalGoals === 0
      ? 0
      : Math.round(
          (goals.reduce(
            (acc, g) => acc + (g.progress / Math.max(1, g.target)),
            0
          ) /
            totalGoals) *
            100
        );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Smart Reminder</Text>

      <View style={styles.card}>
        <Text style={styles.title}>Tugas Selesai</Text>
        <Text style={styles.subtitle}>
          {completedTasks} / {totalTasks}
        </Text>
        <ProgressBar value={tasksPct} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Kemajuan Tujuan</Text>
        <ProgressBar value={totalProgressPct} />
        <Text style={styles.subtitle}>{totalProgressPct}%</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  header: { fontSize: 26, fontWeight: '700', marginBottom: 18 },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  title: { fontSize: 18, fontWeight: '600' },
  subtitle: { color: '#666', marginTop: 6 },
});
