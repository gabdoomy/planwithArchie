/**
 * PlanWithArchie - iOS Wedding Seating Chart
 * Expo SDK ~58.0.22 Mobile Application
 */

import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddItemsDock from './components/AddItemsDock';
import AppHeader from './components/AppHeader';
import FloorPlanCanvas from './components/FloorPlanCanvas';
import TableInspector from './components/TableInspector';
import VenueItemEditor from './components/VenueItemEditor';
import type { Guest, TableItem, TableShape, VenueItemType } from './types';
import styles from './styles';
import { exportVenuePDF } from './services/exportVenuePDF';
import { venueItemLabels } from './venueItems';

const STORAGE_KEY = '@planwitharchie_wedding_seating_v1';
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
  const [selectedVenueItem, setSelectedVenueItem] = useState<TableItem | null>(null);
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

  const addVenueItem = (venueType: VenueItemType) => {
    const index = tables.length;
    const newItem: TableItem = {
      id: `venue_${venueType}_${Date.now()}`,
      name: venueItemLabels[venueType],
      venueType,
      shape: 'rectangle',
      capacity: 0,
      scale: 1,
      lengthScale: 1,
      widthScale: 1,
      rotation: 0,
      x: 30 + (index % 3) * 90,
      y: 80 + (index % 4) * 100,
      guests: []
    };
    setTables(prev => [...prev, newItem]);
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

  const updateVenueItem = (updates: Partial<TableItem>) => {
    if (!selectedVenueItem) return;
    const updated = { ...selectedVenueItem, ...updates };
    setTables(prev => prev.map(item => item.id === updated.id ? updated : item));
    setSelectedVenueItem(updated);
  };

  const deleteVenueItem = () => {
    if (!selectedVenueItem) return;
    setTables(prev => prev.filter(item => item.id !== selectedVenueItem.id));
    setSelectedVenueItem(null);
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
      <AppHeader onSave={saveToLocalStorage} onExport={() => exportVenuePDF(tables)} />
      <FloorPlanCanvas
        tables={tables}
        onDragEnd={updateTablePosition}
        onSelect={table => {
          if (table.venueType) {
            setSelectedVenueItem(table);
            return;
          }
          resetGuestForm();
          setSelectedTable(table);
        }}
      />
      <AddItemsDock onAddTable={addTable} onAddVenueItem={addVenueItem} />
      <TableInspector
        table={selectedTable}
        guestName={newGuestName}
        guestDiet={newGuestDiet}
        guestIsVip={newGuestIsVip}
        editingGuestId={editingGuestId}
        onClose={() => {
          resetGuestForm();
          setSelectedTable(null);
        }}
        onDeleteTable={() => selectedTable && deleteTable(selectedTable.id)}
        onRemoveGuest={removeGuestFromTable}
        onEditGuest={editGuest}
        onGuestNameChange={setNewGuestName}
        onGuestDietChange={setNewGuestDiet}
        onToggleVip={() => setNewGuestIsVip(value => !value)}
        onSubmitGuest={addGuestToTable}
        onCancelEdit={resetGuestForm}
        onUpdateTable={updateSelectedTable}
      />
      <VenueItemEditor
        item={selectedVenueItem}
        onClose={() => setSelectedVenueItem(null)}
        onUpdate={updateVenueItem}
        onDelete={deleteVenueItem}
      />
    </SafeAreaView>
  );
}
