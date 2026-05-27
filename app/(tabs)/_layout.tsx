// app/(tabs)/_layout.tsx
import InputBar from '@/src/components/InputBar';
import { AppProvider } from '@/src/context/AppContext';
import { SnackbarProvider } from '@/src/context/SnackbarContext';
import { Tabs, usePathname } from 'expo-router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const EditModalContext = createContext<{
  openEditModal: (tab: 'Tugas' | 'Tujuan', item: any) => void;
} | undefined>(undefined);

export function useEditModal() {
  return useContext(EditModalContext);
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [inputVisible, setInputVisible] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const pathname = usePathname();

  const tabNameMap: Record<string, 'Home' | 'Tugas' | 'Tujuan' | 'Pengingat'> = {
    '/': 'Home',
    '/tugas': 'Tugas',
    '/tujuan': 'Tujuan',
    '/pengingat': 'Pengingat',
  };

  const [activeTab, setActiveTab] = useState<'Home' | 'Tugas' | 'Tujuan' | 'Pengingat'>('Home');

  useEffect(() => {
    const tab = tabNameMap[pathname] || 'Home';
    setActiveTab(tab);
  }, [pathname]);

  const fabBottom = insets.bottom + 90;

  const openAddModal = () => {
    setEditItem(null);
    setInputVisible(true);
  };

  const openEditModal = (tab: 'Tugas' | 'Tujuan', item: any) => {
    setEditItem(item);
    setInputVisible(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <AppProvider>
        <SnackbarProvider>
          <EditModalContext.Provider value={{ openEditModal }}>
            <View style={styles.container}>
              <Tabs
                screenOptions={{
                  headerShown: false,
                  tabBarActiveTintColor: '#2563eb',
                  tabBarLabelStyle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
                  tabBarStyle: {
                    backgroundColor: '#fff',
                    borderTopWidth: 1,
                    borderTopColor: '#eee',
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom,
                  },
                }}
              >
                <Tabs.Screen
                  name="index"
                  options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>🏠</Text>,
                  }}
                />
                <Tabs.Screen
                  name="tugas"
                  options={{
                    tabBarLabel: 'Tugas',
                    tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>📝</Text>,
                  }}
                />
                <Tabs.Screen
                  name="tujuan"
                  options={{
                    tabBarLabel: 'Tujuan',
                    tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>🎯</Text>,
                  }}
                />
                <Tabs.Screen
                  name="pengingat"
                  options={{
                    tabBarLabel: 'Pengingat',
                    tabBarIcon: ({ color, size }) => <Text style={{ color, fontSize: size }}>⏰</Text>,
                  }}
                />
              </Tabs>
            </View>

            {activeTab === 'Tugas' || activeTab === 'Tujuan' ? (
              <TouchableOpacity
                accessibilityLabel="Tambah item"
                onPress={openAddModal}
                style={[styles.fab, { bottom: fabBottom }]}
              >
                <Text style={styles.fabIcon}>＋</Text>
              </TouchableOpacity>
            ) : null}

            <InputBar
              visible={inputVisible}
              onClose={() => setInputVisible(false)}
              activeTab={activeTab}
              editItem={editItem}
            />
          </EditModalContext.Provider>
        </SnackbarProvider>
      </AppProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: 'transparent' },
  container: { flex: 1 },
  fab: {
    position: 'absolute',
    right: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  fabIcon: { color: '#fff', fontSize: 28, lineHeight: 28 },
});
