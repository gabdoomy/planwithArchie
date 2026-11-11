import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode, Smartphone } from 'lucide-react';

interface ExpoCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpoCodeModal: React.FC<ExpoCodeModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const expoAppCode = `// AislePlan - Native iOS Wedding Seating Chart
// Expo SDK: ~58.0.22
// Dependencies:
// npx expo install expo-print expo-sharing @react-native-async-storage/async-storage react-native-gesture-handler react-native-reanimated

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
  TextInput,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler
} from 'react-native-reanimated';

export type TableShape = 'round' | 'square' | 'rectangle';

interface Table {
  id: string;
  name: string;
  shape: TableShape;
  capacity: number;
  x: number;
  y: number;
}

export default function App() {
  const [tables, setTables] = useState<Table[]>([
    { id: '1', name: 'Table 1', shape: 'round', capacity: 8, x: 50, y: 100 },
    { id: '2', name: 'Table 2', shape: 'rectangle', capacity: 8, x: 200, y: 100 },
    { id: '3', name: 'Table 3', shape: 'square', capacity: 4, x: 120, y: 280 },
  ]);

  // Save to AsyncStorage (Local Storage as JSON)
  const saveLayoutToLocalStorage = async () => {
    try {
      const jsonValue = JSON.stringify(tables);
      await AsyncStorage.setItem('@wedding_seating_plan', jsonValue);
      Alert.alert('Saved', 'Wedding layout saved to local storage.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save configuration.');
    }
  };

  // Export Final Layout as Venue PDF using expo-print
  const exportVenuePDF = async () => {
    try {
      const htmlContent = \`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, Helvetica, Arial, sans-serif; padding: 30px; }
            h1 { font-size: 24px; margin-bottom: 4px; }
            p { color: #666; font-size: 13px; margin-top: 0; }
            .table-card { border: 1px solid #ddd; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
            .table-title { font-weight: bold; font-size: 15px; }
          </style>
        </head>
        <body>
          <h1>WEDDING SEATING CHART & VENUE MANIFEST</h1>
          <p>Generated via AislePlan iOS</p>
          \${tables.map(t => \`
            <div class="table-card">
              <div class="table-title">\${t.name} (\${t.shape.toUpperCase()})</div>
              <div>Capacity: \${t.capacity} seats | Position: (\${Math.round(t.x)}, \${Math.round(t.y)})</div>
            </div>
          \`).join('')}
        </body>
        </html>
      \`;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert('Export Failed', 'Could not generate PDF.');
    }
  };

  const addTable = (shape: TableShape) => {
    const newId = String(Date.now());
    const newTable: Table = {
      id: newId,
      name: \`Table \${tables.length + 1}\`,
      shape,
      capacity: shape === 'square' ? 4 : 8,
      x: 100 + Math.random() * 40,
      y: 150 + Math.random() * 40
    };
    setTables([...tables, newTable]);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        {/* iOS Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AislePlan iOS</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={saveLayoutToLocalStorage} style={styles.btnSecondary}>
              <Text style={styles.btnSecondaryText}>Save JSON</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={exportVenuePDF} style={styles.btnPrimary}>
              <Text style={styles.btnPrimaryText}>Export PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Canvas Area */}
        <View style={styles.canvas}>
          {tables.map(table => (
            <DraggableTable
              key={table.id}
              table={table}
              onUpdatePosition={(x, y) => {
                setTables(prev => prev.map(t => t.id === table.id ? { ...t, x, y } : t));
              }}
            />
          ))}
        </View>

        {/* Minimalist iOS Bottom Dock */}
        <View style={styles.dock}>
          <TouchableOpacity onPress={() => addTable('round')} style={styles.dockButton}>
            <Text style={styles.dockButtonText}>+ Round</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => addTable('rectangle')} style={styles.dockButton}>
            <Text style={styles.dockButtonText}>+ Rectangle</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => addTable('square')} style={styles.dockButton}>
            <Text style={styles.dockButtonText}>+ Square</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

function DraggableTable({ table, onUpdatePosition }: { table: Table; onUpdatePosition: (x: number, y: number) => void }) {
  const translateX = useSharedValue(table.x);
  const translateY = useSharedValue(table.y);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx: any) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY;
    },
    onEnd: () => {
      // snap or persist
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }]
  }));

  const getShapeStyle = () => {
    if (table.shape === 'round') return { borderRadius: 45, width: 90, height: 90 };
    if (table.shape === 'rectangle') return { borderRadius: 12, width: 110, height: 70 };
    return { borderRadius: 12, width: 80, height: 80 };
  };

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.tableItem, getShapeStyle(), animatedStyle]}>
        <Text style={styles.tableName}>{table.name}</Text>
        <Text style={styles.tableCap}>{table.capacity} seats</Text>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
    backgroundColor: '#fff'
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#1c1c1e' },
  headerButtons: { flexDirection: 'row', gap: 8 },
  btnSecondary: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: '#f2f2f7' },
  btnSecondaryText: { fontSize: 13, fontWeight: '600', color: '#1c1c1e' },
  btnPrimary: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: '#000' },
  btnPrimaryText: { fontSize: 13, fontWeight: '600', color: '#fff' },
  canvas: { flex: 1, position: 'relative' },
  tableItem: {
    position: 'absolute',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1c1c1e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  tableName: { fontSize: 12, fontWeight: '700', color: '#1c1c1e' },
  tableCap: { fontSize: 10, color: '#8e8e93', marginTop: 2 },
  dock: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
    gap: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5ea'
  },
  dockButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f2f2f7'
  },
  dockButtonText: { fontSize: 13, fontWeight: '600', color: '#1c1c1e' }
});`;

  const handleCopy = () => {
    navigator.clipboard.writeText(expoAppCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-neutral-900 text-neutral-100 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-neutral-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-neutral-400" />
            <h2 className="text-sm font-bold tracking-tight text-white">Expo SDK ~58.0.22 Native Code</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white text-neutral-950 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Package info */}
        <div className="px-5 py-2.5 bg-neutral-950 text-xs text-neutral-400 border-b border-neutral-800 font-mono flex items-center justify-between">
          <span>expo: ~58.0.22 · expo-print · expo-sharing · async-storage</span>
          <span className="text-emerald-400">iOS Ready</span>
        </div>

        {/* Code View */}
        <div className="flex-1 overflow-auto p-4 bg-neutral-950/80 font-mono text-xs text-neutral-300 leading-relaxed">
          <pre>{expoAppCode}</pre>
        </div>
      </div>
    </div>
  );
};
