// app/(tabs)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

// Provider & components (relative paths assume `app` and `src` are siblings at project root)
import InputBar from "../../src/components/InputBar";
import AppProvider from "../../src/context/AppContext";

// Screens (you moved these into app/(tabs) as tugas.tsx, tujuan.tsx, pengingat.tsx)
import Pengingat from "./pengingat";
import Tugas from "./tugas";
import Tujuan from "./tujuan";

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"Tugas" | "Tujuan" | "Pengingat">(
    "Tugas"
  );

  return (
    <AppProvider>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          initialRouteName="Tugas"
          screenListeners={{
            // keep track of the active tab so InputBar knows which kind to create
            state: (e: any) => {
              try {
                const route = e.data.state.routes[e.data.state.index];
                if (route?.name) setActiveTab(route.name as "Tugas" | "Tujuan" | "Pengingat");
              } catch (err) {
                // ignore (defensive)
              }
            },
          }}
          screenOptions={({ route }) => ({
            headerShown: false,
            // simple icon factory — kept type loose to avoid glyphMap type issues
            tabBarIcon: ({ color, size }) => {
              let iconName: string = "ellipse";
              if (route.name === "Tugas") iconName = "checkmark-done-outline";
              else if (route.name === "Tujuan") iconName = "flag-outline";
              else if (route.name === "Pengingat") iconName = "notifications-outline";
              return <Ionicons name={iconName as any} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Tugas" component={Tugas} />
          <Tab.Screen name="Tujuan" component={Tujuan} />
          <Tab.Screen name="Pengingat" component={Pengingat} />
        </Tab.Navigator>

        {/* Floating Action Button */}
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Input modal (the InputBar reads/writes to context) */}
        <InputBar visible={modalVisible} onClose={() => setModalVisible(false)} activeTab={activeTab} />
      </View>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#2563eb",
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
  },
});
