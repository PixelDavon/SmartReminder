import React, { createContext, ReactNode, useContext, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type SnackbarContextType = {
  showUndo: (onUndo?: () => void) => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export function useSnackbar() {
  return useContext(SnackbarContext);
}

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [onUndo, setOnUndo] = useState<(() => void) | undefined>(undefined);

  const showUndo = (undoFn?: () => void) => {
    setOnUndo(() => undoFn);
    setVisible(true);
    setTimeout(() => setVisible(false), 5000);
  };

  const handleUndo = () => {
    if (onUndo) onUndo();
    setVisible(false);
  };

  return (
    <SnackbarContext.Provider value={{ showUndo }}>
      {children}
      {visible && (
        <View style={styles.snack}>
          <Text style={styles.snackText}>Item dihapus</Text>
          <TouchableOpacity onPress={handleUndo}>
            <Text style={styles.snackAction}>Undo</Text>
          </TouchableOpacity>
        </View>
      )}
    </SnackbarContext.Provider>
  );
}

const styles = StyleSheet.create({
  snack: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 100,
    backgroundColor: '#111',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 6,
    zIndex: 999,
  },
  snackText: { color: '#fff' },
  snackAction: { color: '#4ea8ff', fontWeight: '700', marginLeft: 12 },
});