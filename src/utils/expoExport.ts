import JSZip from 'jszip';

export async function downloadExpoProjectZip() {
  const zip = new JSZip();

  // 1. package.json
  const packageJson = {
    name: "aisleplan-wedding-seating",
    version: "1.0.0",
    main: "node_modules/expo/AppEntry.js",
    scripts: {
      start: "expo start",
      android: "expo start --android",
      ios: "expo start --ios",
      web: "expo start --web"
    },
    dependencies: {
      "expo": "~58.0.22",
      "expo-status-bar": "~2.0.0",
      "expo-print": "~14.0.2",
      "expo-sharing": "~13.0.0",
      "@react-native-async-storage/async-storage": "1.24.0",
      "react": "18.3.1",
      "react-native": "0.76.7",
      "react-native-gesture-handler": "~2.20.2",
      "react-native-reanimated": "~3.16.1",
      "react-native-safe-area-context": "4.12.0",
      "react-native-screens": "~4.4.0"
    },
    devDependencies: {
      "@babel/core": "^7.25.2",
      "@types/react": "~18.3.12",
      "typescript": "^5.3.3"
    },
    private: true
  };
  zip.file("package.json", JSON.stringify(packageJson, null, 2));

  // 2. app.json
  const appJson = {
    expo: {
      name: "AislePlan",
      slug: "aisleplan-wedding-seating",
      version: "1.0.0",
      orientation: "portrait",
      icon: "./assets/icon.png",
      userInterfaceStyle: "light",
      splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#0f172a"
      },
      ios: {
        supportsTablet: true,
        bundleIdentifier: "com.aisleplan.weddingseating",
        infoPlist: {
          UIRequiresFullScreen: true
        }
      },
      android: {
        adaptiveIcon: {
          foregroundImage: "./assets/adaptive-icon.png",
          backgroundColor: "#0f172a"
        },
        package: "com.aisleplan.weddingseating"
      },
      web: {
        favicon: "./assets/favicon.png",
        bundler: "metro"
      },
      sdkVersion: "58.0.22",
      plugins: ["expo-print"]
    }
  };
  zip.file("app.json", JSON.stringify(appJson, null, 2));

  // 3. App.tsx (Expo SDK 58 React Native application)
  const appTsx = `/**
 * AislePlan - iOS Wedding Seating Chart
 * Expo SDK ~58.0.22
 */

import React, { useState, useEffect, useRef } from 'react';
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
  PanResponder,
  Animated,
  Dimensions,
  StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export type TableShape = 'round' | 'square' | 'rectangle';

export interface Guest {
  id: string;
  name: string;
  dietary?: string;
  isVip?: boolean;
}

export interface TableItem {
  id: string;
  name: string;
  shape: TableShape;
  capacity: number;
  x: number;
  y: number;
  guests: Guest[];
}

const STORAGE_KEY = '@aisleplan_wedding_seating_v1';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function App() {
  const [tables, setTables] = useState<TableItem[]>([
    {
      id: 't_head',
      name: 'Head Table',
      shape: 'rectangle',
      capacity: 8,
      x: 40,
      y: 40,
      guests: [
        { id: 'g1', name: 'Sophia Laurent', isVip: true },
        { id: 'g2', name: 'Alexander Vance', isVip: true },
        { id: 'g3', name: 'Clara Delacroix', dietary: 'Vegetarian' },
        { id: 'g4', name: 'Julien Mercier' },
      ]
    },
    {
      id: 't_1',
      name: 'Table 1',
      shape: 'round',
      capacity: 8,
      x: 30,
      y: 190,
      guests: [
        { id: 'g5', name: 'Henri Laurent', isVip: true },
        { id: 'g6', name: 'Margot Laurent', isVip: true },
        { id: 'g7', name: 'Etienne Laurent' },
        { id: 'g8', name: 'Chloe Fontaine', dietary: 'Gluten-Free' },
      ]
    },
    {
      id: 't_2',
      name: 'Table 2',
      shape: 'round',
      capacity: 8,
      x: 200,
      y: 190,
      guests: [
        { id: 'g9', name: 'Arthur Vance', isVip: true },
        { id: 'g10', name: 'Eleanor Vance', dietary: 'Vegan' },
      ]
    },
    {
      id: 't_3',
      name: 'Table 3',
      shape: 'square',
      capacity: 4,
      x: 120,
      y: 350,
      guests: [
        { id: 'g11', name: 'Benjamin Hayes' },
        { id: 'g12', name: 'Maya Lin', dietary: 'Nut Allergy' },
      ]
    }
  ]);

  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestDiet, setNewGuestDiet] = useState('');

  // Load from Local Storage on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setTables(parsed);
          }
        }
      } catch (err) {
        console.log('Failed to load local storage:', err);
      }
    })();
  }, []);

  // Save to Local Storage as JSON
  const saveToLocalStorage = async () => {
    try {
      const jsonString = JSON.stringify(tables, null, 2);
      await AsyncStorage.setItem(STORAGE_KEY, jsonString);
      Alert.alert('Configuration Saved', 'Your wedding seating layout is saved to local storage as JSON.');
    } catch (e) {
      Alert.alert('Save Failed', 'Could not save to local storage.');
    }
  };

  // Export Final Layout as PDF for Venue
  const exportVenuePDF = async () => {
    try {
      const totalGuests = tables.reduce((acc, t) => acc + t.guests.length, 0);
      const totalCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);

      const htmlContent = \`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif; padding: 40px; color: #0f172a; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; }
            h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin: 0 0 6px 0; }
            .subtitle { font-size: 13px; color: #64748b; font-weight: 500; }
            .metrics { display: flex; gap: 24px; background: #f8fafc; padding: 14px 20px; border-radius: 8px; margin-bottom: 24px; }
            .metric-box { flex: 1; }
            .metric-label { font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; }
            .metric-value { font-size: 16px; font-weight: bold; color: #0f172a; }
            .table-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
            .table-card { border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; background: #ffffff; page-break-inside: avoid; }
            .table-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; margin-bottom: 10px; }
            .table-name { font-weight: bold; font-size: 15px; }
            .table-shape { font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600; }
            .guest-row { display: flex; justify-content: space-between; font-size: 12px; padding: 5px 0; border-bottom: 1px dashed #f1f5f9; }
            .vip-tag { font-size: 9px; font-weight: bold; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; margin-left: 6px; }
            .diet-tag { font-size: 10px; font-weight: bold; color: #dc2626; }
            .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>WEDDING SEATING CHART & VENUE SPECIFICATION</h1>
            <div class="subtitle">Official Venue Manifest & Floor Plan Allocation · Generated via AislePlan iOS (Expo SDK 58)</div>
          </div>

          <div class="metrics">
            <div class="metric-box">
              <div class="metric-label">Total Tables</div>
              <div class="metric-value">\${tables.length} Active Tables</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Seated Guests</div>
              <div class="metric-value">\${totalGuests} / \${totalCapacity} Seats (\${Math.round((totalGuests / Math.max(1, totalCapacity)) * 100)}%)</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Date Generated</div>
              <div class="metric-value">\${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="table-grid">
            \${tables.map((t, idx) => \`
              <div class="table-card">
                <div class="table-header">
                  <span class="table-name">Table \${idx + 1}: \${t.name}</span>
                  <span class="table-shape">\${t.shape} · \${t.guests.length}/\${t.capacity}</span>
                </div>
                \${t.guests.length === 0 ? '<div style="font-size: 12px; color: #94a3b8; font-style: italic;">No guests seated yet</div>' : ''}
                \${t.guests.map((g, sIdx) => \`
                  <div class="guest-row">
                    <span>
                      <strong>Seat \${sIdx + 1}:</strong> \${g.name}
                      \${g.isVip ? '<span class="vip-tag">VIP</span>' : ''}
                    </span>
                    \${g.dietary ? \`<span class="diet-tag">\${g.dietary}</span>\` : ''}
                  </div>
                \`).join('')}
              </div>
            \`).join('')}
          </div>

          <div class="footer">
            AislePlan iOS Seating System · For Wedding Planner, Venue Captain & Kitchen Staff
          </div>
        </body>
        </html>
      \`;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        Alert.alert('PDF Created', \`Saved to \${uri}\`);
      }
    } catch (e: any) {
      Alert.alert('PDF Export Failed', e.message || 'Error printing PDF');
    }
  };

  const addTable = (shape: TableShape) => {
    const newId = \`t_\${Date.now()}\`;
    const count = tables.length + 1;
    const defaultCapacity = shape === 'square' ? 4 : shape === 'rectangle' ? 8 : 8;
    const newTable: TableItem = {
      id: newId,
      name: \`Table \${count}\`,
      shape,
      capacity: defaultCapacity,
      x: 60 + (count % 3) * 60,
      y: 120 + (count % 4) * 80,
      guests: []
    };
    setTables([...tables, newTable]);
    setSelectedTable(newTable);
  };

  const updateTablePosition = (id: string, x: number, y: number) => {
    setTables(prev => prev.map(t => (t.id === id ? { ...t, x, y } : t)));
  };

  const addGuestToTable = () => {
    if (!selectedTable || !newGuestName.trim()) return;
    const newGuest: Guest = {
      id: \`g_\${Date.now()}\`,
      name: newGuestName.trim(),
      dietary: newGuestDiet.trim() || undefined
    };
    const updated = {
      ...selectedTable,
      guests: [...selectedTable.guests, newGuest]
    };
    setTables(prev => prev.map(t => (t.id === selectedTable.id ? updated : t)));
    setSelectedTable(updated);
    setNewGuestName('');
    setNewGuestDiet('');
  };

  const removeGuestFromTable = (guestId: string) => {
    if (!selectedTable) return;
    const updated = {
      ...selectedTable,
      guests: selectedTable.guests.filter(g => g.id !== guestId)
    };
    setTables(prev => prev.map(t => (t.id === selectedTable.id ? updated : t)));
    setSelectedTable(updated);
  };

  const deleteTable = (id: string) => {
    setTables(prev => prev.filter(t => t.id !== id));
    setSelectedTable(null);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" />

      {/* iOS Minimalist Top Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>AislePlan</Text>
          <Text style={styles.headerSubtitle}>Wedding Seating Chart · Expo 58</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={saveToLocalStorage} style={styles.btnSecondary} activeOpacity={0.7}>
            <Text style={styles.btnSecondaryText}>Save JSON</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={exportVenuePDF} style={styles.btnPrimary} activeOpacity={0.7}>
            <Text style={styles.btnPrimaryText}>Export PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Interactive Drag & Drop Floor Plan Canvas */}
      <View style={styles.canvasContainer}>
        {tables.map(table => (
          <DraggableTableNode
            key={table.id}
            table={table}
            onDragEnd={(x, y) => updateTablePosition(table.id, x, y)}
            onPress={() => setSelectedTable(table)}
          />
        ))}
      </View>

      {/* Floating Minimalist Dock */}
      <View style={styles.dock}>
        <TouchableOpacity onPress={() => addTable('round')} style={styles.dockButton} activeOpacity={0.7}>
          <View style={styles.roundIcon} />
          <Text style={styles.dockButtonText}>Round</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => addTable('rectangle')} style={styles.dockButton} activeOpacity={0.7}>
          <View style={styles.rectIcon} />
          <Text style={styles.dockButtonText}>Rectangle</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => addTable('square')} style={styles.dockButton} activeOpacity={0.7}>
          <View style={styles.squareIcon} />
          <Text style={styles.dockButtonText}>Square</Text>
        </TouchableOpacity>
      </View>

      {/* Table & Guest Inspector Sheet */}
      <Modal
        visible={selectedTable !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedTable(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedTable?.name}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedTable?.shape.toUpperCase()} · {selectedTable?.guests.length}/{selectedTable?.capacity} Seats
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedTable(null)} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Guest list at table */}
            <ScrollView style={styles.guestListContainer}>
              <Text style={styles.sectionHeading}>Seated Guests</Text>
              {selectedTable?.guests.length === 0 ? (
                <Text style={styles.emptyText}>No people seated at this table yet.</Text>
              ) : (
                selectedTable?.guests.map((g, idx) => (
                  <View key={g.id} style={styles.guestRow}>
                    <View style={styles.seatNumBadge}>
                      <Text style={styles.seatNumText}>{idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.guestNameText}>{g.name}</Text>
                      {g.dietary ? <Text style={styles.guestDietText}>{g.dietary}</Text> : null}
                    </View>
                    <TouchableOpacity onPress={() => removeGuestFromTable(g.id)} style={styles.removeBtn}>
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {/* Add person input */}
              <View style={styles.addGuestBox}>
                <Text style={styles.sectionHeading}>Add Person to Table</Text>
                <TextInput
                  placeholder="Guest Full Name..."
                  placeholderTextColor="#94a3b8"
                  value={newGuestName}
                  onChangeText={setNewGuestName}
                  style={styles.input}
                />
                <TextInput
                  placeholder="Dietary Note (e.g. Vegetarian, Gluten-Free)"
                  placeholderTextColor="#94a3b8"
                  value={newGuestDiet}
                  onChangeText={setNewGuestDiet}
                  style={styles.input}
                />
                <TouchableOpacity onPress={addGuestToTable} style={styles.addBtn} activeOpacity={0.8}>
                  <Text style={styles.addBtnText}>+ Seat Guest</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => selectedTable && deleteTable(selectedTable.id)}
                style={styles.deleteTableBtn}
              >
                <Text style={styles.deleteTableBtnText}>Delete This Table</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Touch Drag-and-Drop Table Node with PanResponder
function DraggableTableNode({
  table,
  onDragEnd,
  onPress
}: {
  table: TableItem;
  onDragEnd: (x: number, y: number) => void;
  onPress: () => void;
}) {
  const pan = useRef(new Animated.ValueXY({ x: table.x, y: table.y })).current;
  const currentPos = useRef({ x: table.x, y: table.y });

  useEffect(() => {
    pan.setValue({ x: table.x, y: table.y });
    currentPos.current = { x: table.x, y: table.y };
  }, [table.x, table.y]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: currentPos.current.x,
          y: currentPos.current.y
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        const finalX = Math.max(10, Math.min(SCREEN_WIDTH - 110, currentPos.current.x + gesture.dx));
        const finalY = Math.max(10, Math.min(SCREEN_HEIGHT - 220, currentPos.current.y + gesture.dy));
        currentPos.current = { x: finalX, y: finalY };
        onDragEnd(finalX, finalY);

        if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
          onPress();
        }
      }
    })
  ).current;

  const getShapeStyle = () => {
    if (table.shape === 'round') {
      return { borderRadius: 45, width: 90, height: 90 };
    }
    if (table.shape === 'rectangle') {
      return { borderRadius: 14, width: 120, height: 74 };
    }
    return { borderRadius: 14, width: 84, height: 84 };
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.tableNode,
        getShapeStyle(),
        {
          transform: pan.getTranslateTransform()
        }
      ]}
    >
      <Text style={styles.tableNodeName} numberOfLines={1}>{table.name}</Text>
      <Text style={styles.tableNodeCapacity}>
        {table.guests.length} / {table.capacity}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.4
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500'
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8
  },
  btnSecondary: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 10
  },
  btnSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
  },
  btnPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#0f172a',
    borderRadius: 10
  },
  btnPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff'
  },
  canvasContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f8fafc'
  },
  tableNode: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4
  },
  tableNodeName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    paddingHorizontal: 6,
    textAlign: 'center'
  },
  tableNodeCapacity: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2
  },
  dock: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0'
  },
  dockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 20
  },
  roundIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#0f172a'
  },
  rectIcon: {
    width: 18,
    height: 12,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#0f172a'
  },
  squareIcon: {
    width: 14,
    height: 14,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#0f172a'
  },
  dockButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '80%'
  },
  sheetHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#cbd5e1',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 14,
    marginBottom: 14
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a'
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 8
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a'
  },
  guestListContainer: {
    marginBottom: 20
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#94a3b8',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
    fontStyle: 'italic',
    marginVertical: 8
  },
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9'
  },
  seatNumBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center'
  },
  seatNumText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b'
  },
  guestNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a'
  },
  guestDietText: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '500'
  },
  removeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  removeBtnText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600'
  },
  addGuestBox: {
    backgroundColor: '#f8fafc',
    padding: 14,
    borderRadius: 14,
    marginTop: 16,
    marginBottom: 16
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 8
  },
  addBtn: {
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  deleteTableBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20
  },
  deleteTableBtnText: {
    color: '#dc2626',
    fontSize: 13,
    fontWeight: '600'
  }
});
`;
  zip.file("App.tsx", appTsx);

  // 4. README.md
  const readme = `# AislePlan - iOS Wedding Seating Chart (Expo SDK ~58.0.22)

Minimalist, touch-first iOS mobile application for creating wedding seating floor plans, seating guests at round, square, and rectangular tables, saving layout state to local storage (\`AsyncStorage\`) as JSON, and generating official venue layout PDFs using \`expo-print\` & \`expo-sharing\`.

## Quick Start
1. \`npm install\`
2. \`npx expo start\`
3. Press \`i\` for iOS simulator, or scan the QR code with your iPhone camera to open directly in Expo Go.
`;
  zip.file("README.md", readme);

  // Generate blob and download
  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "aisleplan-expo-sdk-58.zip";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
