/**
 * AislePlan - iOS Wedding Seating Chart
 * Expo SDK ~58.0.22 Mobile Application
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
  KeyboardAvoidingView,
  Platform,
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
  scale?: number;
  lengthScale?: number;
  widthScale?: number;
  rotation?: number;
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
  const [newGuestIsVip, setNewGuestIsVip] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);

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
      Alert.alert('Configuration Saved', 'Your wedding seating layout is securely saved to local storage.');
    } catch (e) {
      Alert.alert('Save Failed', 'Could not save to local storage.');
    }
  };

  // Export Final Layout as PDF for Venue
  const exportVenuePDF = async () => {
    try {
      const totalGuests = tables.reduce((acc, t) => acc + t.guests.length, 0);
      const totalCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);
      const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[char] ?? char);
      const tableBounds = tables.map(table => {
        const scale = table.scale ?? 1;
        const width = (table.shape === 'round' ? 100 : table.shape === 'rectangle' ? 136 : 92) *
          scale * (table.shape === 'rectangle' ? table.lengthScale ?? 1 : 1);
        const height = (table.shape === 'round' ? 100 : table.shape === 'rectangle' ? 80 : 92) *
          scale * (table.shape === 'rectangle' ? table.widthScale ?? 1 : 1);
        const rotation = (table.rotation ?? 0) * Math.PI / 180;
        const extentX = Math.abs(Math.cos(rotation)) * (width / 2 + 27) +
          Math.abs(Math.sin(rotation)) * (height / 2 + 27);
        const extentY = Math.abs(Math.sin(rotation)) * (width / 2 + 27) +
          Math.abs(Math.cos(rotation)) * (height / 2 + 27);
        return {
          table,
          width,
          height,
          minX: table.x + width / 2 - extentX,
          maxX: table.x + width / 2 + extentX,
          minY: table.y + height / 2 - extentY,
          maxY: table.y + height / 2 + extentY
        };
      });
      const planMinX = Math.min(0, ...tableBounds.map(bounds => bounds.minX));
      const planMinY = Math.min(0, ...tableBounds.map(bounds => bounds.minY));
      const planMaxX = Math.max(SCREEN_WIDTH, ...tableBounds.map(bounds => bounds.maxX));
      const planMaxY = Math.max(SCREEN_HEIGHT - 200, ...tableBounds.map(bounds => bounds.maxY));
      const planPadding = 24;
      const planViewBox = `${planMinX - planPadding} ${planMinY - planPadding} ${planMaxX - planMinX + planPadding * 2} ${planMaxY - planMinY + planPadding * 2}`;
      const floorPlanSvg = tableBounds.map(({ table, width, height }) => {
        const seats: { x: number; y: number; guest?: Guest; seatNum: number }[] = [];
        const chairSize = 24;
        if (table.shape === 'round') {
          const radius = width / 2;
          const chairDistance = radius + 15;
          for (let i = 0; i < table.capacity; i++) {
            const angle = (i * 2 * Math.PI) / table.capacity - Math.PI / 2;
            seats.push({
              x: radius + Math.cos(angle) * chairDistance - chairSize / 2,
              y: radius + Math.sin(angle) * chairDistance - chairSize / 2,
              seatNum: i + 1,
              guest: table.guests[i]
            });
          }
        } else if (table.shape === 'rectangle') {
          const topSeats = Math.ceil(table.capacity / 2);
          const bottomSeats = Math.floor(table.capacity / 2);
          for (let i = 0; i < topSeats; i++) {
            seats.push({
              x: 20 + ((width - 40) * (i + 0.5)) / topSeats - chairSize / 2,
              y: -chairSize / 2 - 3,
              seatNum: i + 1,
              guest: table.guests[i]
            });
          }
          for (let i = 0; i < bottomSeats; i++) {
            seats.push({
              x: 20 + ((width - 40) * (i + 0.5)) / bottomSeats - chairSize / 2,
              y: height - chairSize / 2 + 3,
              seatNum: topSeats + i + 1,
              guest: table.guests[topSeats + i]
            });
          }
        } else {
          const perimeter = 2 * (width + height);
          for (let i = 0; i < table.capacity; i++) {
            const position = ((i + 0.5) * perimeter) / table.capacity;
            let x: number;
            let y: number;
            if (position < width) {
              x = position - chairSize / 2;
              y = -chairSize - 3;
            } else if (position < width + height) {
              x = width + 3;
              y = position - width - chairSize / 2;
            } else if (position < 2 * width + height) {
              x = width - (position - width - height) - chairSize / 2;
              y = height + 3;
            } else {
              x = -chairSize - 3;
              y = height - (position - 2 * width - height) - chairSize / 2;
            }
            seats.push({ x, y, seatNum: i + 1, guest: table.guests[i] });
          }
        }

        const chairs = seats.map(seat => {
          const guest = seat.guest;
          const fill = guest ? guest.isVip ? '#fef3c7' : '#0f172a' : '#ffffff';
          const stroke = guest?.isVip ? '#d97706' : guest ? '#0f172a' : '#cbd5e1';
          const text = guest ? guest.name.trim().split(/\s+/).filter(Boolean)
            .map(part => part[0]).slice(0, 2).join('').toUpperCase() : String(seat.seatNum);
          return `<g><rect x="${seat.x}" y="${seat.y}" width="${chairSize}" height="${chairSize}" rx="${chairSize / 2}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><text x="${seat.x + chairSize / 2}" y="${seat.y + chairSize / 2 + 3}" text-anchor="middle" font-size="7" font-weight="700" fill="${guest?.isVip ? '#92400e' : guest ? '#ffffff' : '#64748b'}">${escapeHtml(text)}</text></g>`;
        }).join('');
        const surface = table.shape === 'round'
          ? `<circle cx="${width / 2}" cy="${height / 2}" r="${width / 2}" />`
          : `<rect x="0" y="0" width="${width}" height="${height}" rx="10" />`;
        return `<g transform="translate(${table.x + width / 2} ${table.y + height / 2}) rotate(${table.rotation ?? 0}) translate(${-width / 2} ${-height / 2})">
          ${chairs}
          <g class="table-surface">${surface}<text class="table-name" x="${width / 2}" y="${height / 2 - 3}" text-anchor="middle">${escapeHtml(table.name)}</text><text class="table-count" x="${width / 2}" y="${height / 2 + 12}" text-anchor="middle">${table.guests.length} / ${table.capacity} seats</text></g>
        </g>`;
      }).join('');

      const htmlContent = `
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
            .floor-plan { page-break-before: always; break-before: page; page-break-inside: avoid; }
            .floor-plan h2 { font-size: 20px; margin: 0 0 6px; }
            .floor-plan-note { color: #64748b; font-size: 11px; margin-bottom: 12px; }
            .floor-plan svg { display: block; width: 100%; height: 6.4in; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; }
            .table-surface rect, .table-surface circle { fill: #ffffff; stroke: #0f172a; stroke-width: 2; }
            .table-name { fill: #0f172a; font-size: 12px; font-weight: 700; }
            .table-count { fill: #64748b; font-size: 9px; font-weight: 600; }
            .plan-legend { display: flex; gap: 18px; font-size: 10px; color: #475569; margin-top: 10px; }
            .legend-dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 5px; vertical-align: middle; }
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
              <div class="metric-value">${tables.length} Active Tables</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Seated Guests</div>
              <div class="metric-value">${totalGuests} / ${totalCapacity} Seats (${Math.round((totalGuests / Math.max(1, totalCapacity)) * 100)}%)</div>
            </div>
            <div class="metric-box">
              <div class="metric-label">Date Generated</div>
              <div class="metric-value">${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div class="table-grid">
            ${tables.map((t, idx) => `
              <div class="table-card">
                <div class="table-header">
                  <span class="table-name">Table ${idx + 1}: ${escapeHtml(t.name)}</span>
                  <span class="table-shape">${t.shape} · ${t.guests.length}/${t.capacity}</span>
                </div>
                ${t.guests.length === 0 ? '<div style="font-size: 12px; color: #94a3b8; font-style: italic;">No guests seated yet</div>' : ''}
                ${t.guests.map((g, sIdx) => `
                  <div class="guest-row">
                    <span>
                      <strong>Seat ${sIdx + 1}:</strong> ${escapeHtml(g.name)}
                      ${g.isVip ? '<span class="vip-tag">VIP</span>' : ''}
                    </span>
                    ${g.dietary ? `<span class="diet-tag">${escapeHtml(g.dietary)}</span>` : ''}
                  </div>
                `).join('')}
              </div>
            `).join('')}
          </div>

          <section class="floor-plan">
            <h2>Seating Plan</h2>
            <div class="floor-plan-note">Floor-plan view showing table layout, orientation, seats and assigned guests.</div>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="${planViewBox}" preserveAspectRatio="xMidYMid meet">
              ${floorPlanSvg}
            </svg>
            <div class="plan-legend">
              <span><span class="legend-dot" style="background:#fff;border:1px solid #cbd5e1"></span>Open seat</span>
              <span><span class="legend-dot" style="background:#0f172a"></span>Guest</span>
              <span><span class="legend-dot" style="background:#fef3c7;border:1px solid #d97706"></span>VIP</span>
            </div>
          </section>

          <div class="footer">
            AislePlan iOS Seating System · For Wedding Planner, Venue Captain & Kitchen Staff
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        Alert.alert('PDF Created', `Saved to ${uri}`);
      }
    } catch (e: any) {
      Alert.alert('PDF Export Failed', e.message || 'Error printing PDF');
    }
  };

  const addTable = (shape: TableShape) => {
    const newId = `t_${Date.now()}`;
    const count = tables.length + 1;
    const defaultCapacity = shape === 'square' ? 4 : shape === 'rectangle' ? 8 : 8;
    const newTable: TableItem = {
      id: newId,
      name: `Table ${count}`,
      shape,
      capacity: defaultCapacity,
      scale: 1,
      rotation: 0,
      x: 60 + (count % 3) * 60,
      y: 120 + (count % 4) * 80,
      guests: []
    };
    setTables([...tables, newTable]);
    resetGuestForm();
    setSelectedTable(newTable);
  };

  const updateTablePosition = (id: string, x: number, y: number) => {
    setTables(prev => prev.map(t => (t.id === id ? { ...t, x, y } : t)));
  };

  const updateSelectedTable = (updates: Partial<TableItem>) => {
    if (!selectedTable) return;
    const updated = { ...selectedTable, ...updates };
    setTables(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    setSelectedTable(updated);
  };

  const addGuestToTable = () => {
    if (!selectedTable || !newGuestName.trim()) return;
    if (editingGuestId) {
      const updated = {
        ...selectedTable,
        guests: selectedTable.guests.map(guest => guest.id === editingGuestId
          ? {
              ...guest,
              name: newGuestName.trim(),
              dietary: newGuestDiet.trim() || undefined,
              isVip: newGuestIsVip
            }
          : guest)
      };
      setTables(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      setSelectedTable(updated);
      resetGuestForm();
      return;
    }

    const newGuest: Guest = {
      id: `g_${Date.now()}`,
      name: newGuestName.trim(),
      dietary: newGuestDiet.trim() || undefined,
      isVip: newGuestIsVip
    };
    const updated = {
      ...selectedTable,
      guests: [...selectedTable.guests, newGuest],
      capacity: Math.max(selectedTable.capacity, selectedTable.guests.length + 1)
    };
    setTables(prev => prev.map(t => (t.id === selectedTable.id ? updated : t)));
    setSelectedTable(updated);
    resetGuestForm();
  };

  const resetGuestForm = () => {
    setEditingGuestId(null);
    setNewGuestName('');
    setNewGuestDiet('');
    setNewGuestIsVip(false);
  };

  const editGuest = (guest: Guest) => {
    setEditingGuestId(guest.id);
    setNewGuestName(guest.name);
    setNewGuestDiet(guest.dietary ?? '');
    setNewGuestIsVip(guest.isVip ?? false);
  };

  const removeGuestFromTable = (guestId: string) => {
    if (!selectedTable) return;
    const updated = {
      ...selectedTable,
      guests: selectedTable.guests.filter(g => g.id !== guestId)
    };
    setTables(prev => prev.map(t => (t.id === selectedTable.id ? updated : t)));
    setSelectedTable(updated);
    if (editingGuestId === guestId) resetGuestForm();
  };

  const deleteTable = (id: string) => {
    setTables(prev => prev.filter(t => t.id !== id));
    resetGuestForm();
    setSelectedTable(null);
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" />

      {/* iOS Minimalist Top Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Plan With Archie</Text>
          <Text style={styles.headerSubtitle}>Wedding Seating Chart · by ArchieLabs</Text>
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
            onPress={() => {
              resetGuestForm();
              setSelectedTable(table);
            }}
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
        onRequestClose={() => {
          resetGuestForm();
          setSelectedTable(null);
        }}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <View style={styles.sheetHandle} />

            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedTable?.name}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedTable?.shape.toUpperCase()} · {selectedTable?.guests.length}/{selectedTable?.capacity} Seats
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  resetGuestForm();
                  setSelectedTable(null);
                }}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Guest list at table */}
            <ScrollView
              style={styles.guestListContainer}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              <Text style={styles.sectionHeading}>Seated Guests</Text>
              {selectedTable?.guests.length === 0 ? (
                <Text style={styles.emptyText}>No people seated at this table yet.</Text>
              ) : (
                selectedTable?.guests.map((g, idx) => (
                  <View key={g.id} style={styles.guestRow}>
                    <View style={styles.seatNumBadge}>
                      <Text style={styles.seatNumText}>{idx + 1}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => editGuest(g)}
                      accessibilityRole="button"
                      accessibilityLabel={`Edit ${g.name}`}
                      style={styles.guestDetails}
                    >
                      <Text style={styles.guestNameText}>{g.name}</Text>
                      {g.dietary ? <Text style={styles.guestDietText}>{g.dietary}</Text> : null}
                      {g.isVip ? <Text style={styles.vipGuestText}>VIP</Text> : null}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeGuestFromTable(g.id)} style={styles.removeBtn}>
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {/* Add person input */}
              <View style={styles.addGuestBox}>
                <Text style={styles.sectionHeading}>
                  {editingGuestId ? 'Edit Person' : 'Add Person to Table'}
                </Text>
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
                <TouchableOpacity
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: newGuestIsVip }}
                  onPress={() => setNewGuestIsVip(value => !value)}
                  style={[styles.vipToggle, newGuestIsVip && styles.vipToggleActive]}
                >
                  <Text style={[styles.vipToggleText, newGuestIsVip && styles.vipToggleTextActive]}>
                    {newGuestIsVip ? '★ VIP guest' : '☆ Mark as VIP'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={addGuestToTable} style={styles.addBtn} activeOpacity={0.8}>
                  <Text style={styles.addBtnText}>
                    {editingGuestId ? 'Save Changes' : '+ Seat Guest'}
                  </Text>
                </TouchableOpacity>
                {editingGuestId ? (
                  <TouchableOpacity onPress={resetGuestForm} style={styles.cancelEditBtn}>
                    <Text style={styles.cancelEditText}>Cancel editing</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <TouchableOpacity
                onPress={() => selectedTable && deleteTable(selectedTable.id)}
                style={styles.deleteTableBtn}
              >
                <Text style={styles.deleteTableBtnText}>Delete This Table</Text>
              </TouchableOpacity>
            </ScrollView>

            {selectedTable ? (
              <View style={styles.tableControls}>
                <View style={styles.controlRow}>
                  <Text style={styles.controlLabel}>Seats</Text>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      onPress={() => updateSelectedTable({ capacity: selectedTable.capacity - 1 })}
                      disabled={selectedTable.capacity <= Math.max(1, selectedTable.guests.length)}
                      style={styles.stepperButton}
                    >
                      <Text style={styles.stepperButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.controlValue}>{selectedTable.capacity}</Text>
                    <TouchableOpacity
                      onPress={() => updateSelectedTable({ capacity: selectedTable.capacity + 1 })}
                      style={styles.stepperButton}
                    >
                      <Text style={styles.stepperButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.controlRow}>
                  <Text style={styles.controlLabel}>Overall size</Text>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      onPress={() => updateSelectedTable({ scale: Math.max(0.6, Number(((selectedTable.scale ?? 1) - 0.1).toFixed(1))) })}
                      disabled={(selectedTable.scale ?? 1) <= 0.6}
                      style={styles.stepperButton}
                    >
                      <Text style={styles.stepperButtonText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.controlValue}>{Math.round((selectedTable.scale ?? 1) * 100)}%</Text>
                    <TouchableOpacity
                      onPress={() => updateSelectedTable({ scale: Math.min(1.8, Number(((selectedTable.scale ?? 1) + 0.1).toFixed(1))) })}
                      disabled={(selectedTable.scale ?? 1) >= 1.8}
                      style={styles.stepperButton}
                    >
                      <Text style={styles.stepperButtonText}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {selectedTable.shape === 'rectangle' ? (
                  <>
                    <View style={styles.controlRow}>
                      <Text style={styles.controlLabel}>Length</Text>
                      <View style={styles.stepper}>
                        <TouchableOpacity
                          onPress={() => updateSelectedTable({
                            lengthScale: Math.max(0.6, Math.round(((selectedTable.lengthScale ?? 1) - 0.1) * 10) / 10)
                          })}
                          disabled={(selectedTable.lengthScale ?? 1) <= 0.6}
                          style={styles.stepperButton}
                        >
                          <Text style={styles.stepperButtonText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.controlValue}>
                          {Math.round((selectedTable.lengthScale ?? 1) * 100)}%
                        </Text>
                        <TouchableOpacity
                          onPress={() => updateSelectedTable({
                            lengthScale: Math.min(2.5, Math.round(((selectedTable.lengthScale ?? 1) + 0.1) * 10) / 10)
                          })}
                          disabled={(selectedTable.lengthScale ?? 1) >= 2.5}
                          style={styles.stepperButton}
                        >
                          <Text style={styles.stepperButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.controlRow}>
                      <Text style={styles.controlLabel}>Width</Text>
                      <View style={styles.stepper}>
                        <TouchableOpacity
                          onPress={() => updateSelectedTable({
                            widthScale: Math.max(0.6, Math.round(((selectedTable.widthScale ?? 1) - 0.1) * 10) / 10)
                          })}
                          disabled={(selectedTable.widthScale ?? 1) <= 0.6}
                          style={styles.stepperButton}
                        >
                          <Text style={styles.stepperButtonText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.controlValue}>
                          {Math.round((selectedTable.widthScale ?? 1) * 100)}%
                        </Text>
                        <TouchableOpacity
                          onPress={() => updateSelectedTable({
                            widthScale: Math.min(2.5, Math.round(((selectedTable.widthScale ?? 1) + 0.1) * 10) / 10)
                          })}
                          disabled={(selectedTable.widthScale ?? 1) >= 2.5}
                          style={styles.stepperButton}
                        >
                          <Text style={styles.stepperButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </>
                ) : null}
                <View style={styles.controlRow}>
                  <Text style={styles.controlLabel}>Rotation</Text>
                  <TouchableOpacity
                    onPress={() => updateSelectedTable({ rotation: ((selectedTable.rotation ?? 0) + 90) % 360 })}
                    style={styles.rotateButton}
                  >
                    <Text style={styles.rotateButtonText}>↻ Rotate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// Touch Drag-and-Drop Table Node with Chairs and Guest Initials
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
        const finalX = Math.max(10, Math.min(SCREEN_WIDTH - 130, currentPos.current.x + gesture.dx));
        const finalY = Math.max(10, Math.min(SCREEN_HEIGHT - 240, currentPos.current.y + gesture.dy));
        currentPos.current = { x: finalX, y: finalY };
        onDragEnd(finalX, finalY);

        if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
          onPress();
        }
      }
    })
  ).current;

  // Extract 2-letter uppercase initials
  const getInitials = (name?: string) => {
    if (!name) return '';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Dimensions based on shape
  const scale = table.scale ?? 1;
  let tableWidth = 100 * scale;
  let tableHeight = 100 * scale;
  let borderRadius = 50 * scale;

  if (table.shape === 'round') {
    tableWidth = 100 * scale;
    tableHeight = 100 * scale;
    borderRadius = 50 * scale;
  } else if (table.shape === 'rectangle') {
    tableWidth = 136 * scale * (table.lengthScale ?? 1);
    tableHeight = 80 * scale * (table.widthScale ?? 1);
    borderRadius = 14;
  } else {
    tableWidth = 92 * scale;
    tableHeight = 92 * scale;
    borderRadius = 14;
  }

  // Calculate chair positions around table
  const chairs: { x: number; y: number; seatNum: number; guest?: Guest }[] = [];
  const chairSize = 24;

  if (table.shape === 'round') {
    const radius = tableWidth / 2;
    const chairDistance = radius + 15;
    for (let i = 0; i < table.capacity; i++) {
      const angle = (i * 2 * Math.PI) / table.capacity - Math.PI / 2;
      const cx = radius + Math.cos(angle) * chairDistance - chairSize / 2;
      const cy = radius + Math.sin(angle) * chairDistance - chairSize / 2;
      chairs.push({
        x: cx,
        y: cy,
        seatNum: i + 1,
        guest: table.guests[i]
      });
    }
  } else if (table.shape === 'rectangle') {
    const topSeats = Math.ceil(table.capacity / 2);
    const bottomSeats = Math.floor(table.capacity / 2);
    for (let i = 0; i < topSeats; i++) {
      chairs.push({
        x: 20 + ((tableWidth - 40) * (i + 0.5)) / topSeats - chairSize / 2,
        y: -chairSize / 2 - 3,
        seatNum: i + 1,
        guest: table.guests[i]
      });
    }
    for (let i = 0; i < bottomSeats; i++) {
      chairs.push({
        x: 20 + ((tableWidth - 40) * (i + 0.5)) / bottomSeats - chairSize / 2,
        y: tableHeight - chairSize / 2 + 3,
        seatNum: topSeats + i + 1,
        guest: table.guests[topSeats + i]
      });
    }
  } else {
    const perimeter = 2 * (tableWidth + tableHeight);
    for (let i = 0; i < table.capacity; i++) {
      const position = ((i + 0.5) * perimeter) / table.capacity;
      let x: number;
      let y: number;
      if (position < tableWidth) {
        x = position;
        y = -chairSize / 2 - 3;
      } else if (position < tableWidth + tableHeight) {
        x = tableWidth + chairSize / 2 + 3;
        y = position - tableWidth;
      } else if (position < 2 * tableWidth + tableHeight) {
        x = tableWidth - (position - tableWidth - tableHeight);
        y = tableHeight + chairSize / 2 + 3;
      } else {
        x = -chairSize / 2 - 3;
        y = tableHeight - (position - 2 * tableWidth - tableHeight);
      }
      chairs.push({
        x: x - chairSize / 2,
        y: y - chairSize / 2,
        seatNum: i + 1,
        guest: table.guests[i]
      });
    }
  }

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.tableWrapper,
        {
          width: tableWidth,
          height: tableHeight,
          transform: [...pan.getTranslateTransform(), { rotate: `${table.rotation ?? 0}deg` }]
        }
      ]}
    >
      {/* Visual Chairs with Guest Initials */}
      {chairs.map(seat => {
        const hasGuest = !!seat.guest;
        return (
          <View
            key={seat.seatNum}
            style={[
              styles.chairNode,
              { left: seat.x, top: seat.y },
              hasGuest
                ? seat.guest?.isVip
                  ? styles.chairVip
                  : styles.chairOccupied
                : styles.chairEmpty
            ]}
          >
            <Text
              style={[
                styles.chairText,
                hasGuest
                  ? seat.guest?.isVip
                    ? styles.chairTextVip
                    : styles.chairTextOccupied
                  : styles.chairTextEmpty
              ]}
              numberOfLines={1}
            >
              {hasGuest ? getInitials(seat.guest?.name) : seat.seatNum}
            </Text>
          </View>
        );
      })}

      {/* Main Table Surface */}
      <View
        style={[
          styles.tableNode,
          {
            width: tableWidth,
            height: tableHeight,
            borderRadius
          }
        ]}
      >
        <Text style={styles.tableNodeName} numberOfLines={1}>{table.name}</Text>
        <Text style={styles.tableNodeCapacity}>
          {table.guests.length} / {table.capacity}
        </Text>
      </View>
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
  tableWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center'
  },
  tableNode: {
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
  chairNode: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20
  },
  chairOccupied: {
    backgroundColor: '#0f172a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  },
  chairVip: {
    backgroundColor: '#fef3c7',
    borderWidth: 1.5,
    borderColor: '#d97706',
    shadowColor: '#d97706',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3
  },
  chairEmpty: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1'
  },
  chairText: {
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center'
  },
  chairTextOccupied: {
    color: '#ffffff'
  },
  chairTextVip: {
    color: '#92400e'
  },
  chairTextEmpty: {
    color: '#94a3b8'
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
    marginBottom: 20,
    flexShrink: 1
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
  guestDetails: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 2
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
  vipGuestText: {
    fontSize: 10,
    color: '#92400e',
    fontWeight: '700',
    marginTop: 2
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
  vipToggle: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10
  },
  vipToggleActive: {
    backgroundColor: '#fef3c7',
    borderColor: '#d97706'
  },
  vipToggleText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700'
  },
  vipToggleTextActive: {
    color: '#92400e'
  },
  tableControls: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    gap: 10
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8
  },
  controlLabel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600'
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stepperButtonText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700'
  },
  controlValue: {
    minWidth: 40,
    color: '#0f172a',
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700'
  },
  rotateButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9
  },
  rotateButtonText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700'
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
  cancelEditBtn: {
    alignItems: 'center',
    paddingVertical: 10
  },
  cancelEditText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600'
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
