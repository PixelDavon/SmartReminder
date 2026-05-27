// app/modal.tsx
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>This is a modal</Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text style={styles.linkText}>Go to home screen</Text>
      </Link>

      <TouchableOpacity onPress={() => {}} style={styles.button}>
        <Text style={styles.buttonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  link: { marginBottom: 12 },
  linkText: { color: '#2563eb', fontWeight: '600' },
  button: { backgroundColor: '#2563eb', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
