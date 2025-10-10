// app/(tabs)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import InputBar from "@components/InputBar";
import AppProvider from "@context/AppContext";

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
            // keep track of active tab so InputBar knows which kind to create
            state: (e: any) => {
              try {
                const route = e.data.state.routes[e.data.state.index];
                if (route?.name) setActiveTab(route.name as "Tugas" | "Tujuan" | "Pengingat");
              } catch (err) {
                // defensive
              }
            },
          }}
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: "#2563eb",
            tabBarInactiveTintColor: "#9ca3af",
            tabBarLabelStyle: { fontSize: 12 },
            tabBarStyle: {
              height: 64,
              paddingBottom: 8,
              backgroundColor: "#0b0b0b", // match app dark-ish theme
              borderTopWidth: 0,
            },
            // simple icon factory
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

        {/* Floating Action Button - elevated above tab bar */}
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>

        {/* Input modal */}
        <InputBar visible={modalVisible} onClose={() => setModalVisible(false)} activeTab={activeTab} />
      </View>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 90, // raised so it doesn't overlap the tab bar
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
