/**
 * PlanWithArchie - iOS Wedding Seating Chart
 * Expo SDK ~58.0.22 Mobile Application
 */

import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import AddItemsDock from './components/AddItemsDock';
import AppHeader from './components/AppHeader';
import EventSettings from './components/EventSettings';
import type { EventSummary } from './components/EventSettings';
import FloorPlanCanvas, { getTableDimensions } from './components/FloorPlanCanvas';
import TableInspector from './components/TableInspector';
import type { Guest, TableItem, TableShape, VenueItemType } from './types';
import {
  moveGuestBetweenSeats,
  normalizeGuestsForCapacity,
  removeGuestPreservingSeats,
  seatGuestAtTable
} from './seatUtils';
import styles from './styles';
import { exportVenuePDF } from './services/exportVenuePDF';
import { venueItemLabels } from './venueItems';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const STORAGE_KEY = '@planwitharchie_wedding_seating_v1';
const EVENTS_STORAGE_KEY = '@planwitharchie_events_v1';
const DEFAULT_EVENT_ID = 'default-event';

void SplashScreen.preventAutoHideAsync().catch(error => {
  console.warn('Could not keep the splash screen visible during startup:', error);
});

interface EventPlan extends EventSummary {
  tables: TableItem[];
}

const initialTables: TableItem[] = [
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
];

export default function App() {
  const [eventPlans, setEventPlans] = useState<EventPlan[]>([
    { id: DEFAULT_EVENT_ID, name: 'Plan With Archie', tables: initialTables }
  ]);
  const [activeEventId, setActiveEventId] = useState(DEFAULT_EVENT_ID);
  const [storageLoaded, setStorageLoaded] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const activeEvent = eventPlans.find(event => event.id === activeEventId) ?? eventPlans[0];
  const tables = activeEvent?.tables ?? [];
  const setTables = (nextTables: TableItem[] | ((previous: TableItem[]) => TableItem[])) => {
    setEventPlans(previous => previous.map(event => event.id === activeEventId
      ? {
          ...event,
          tables: typeof nextTables === 'function' ? nextTables(event.tables) : nextTables
        }
      : event));
  };

  const [tooltipTableId, setTooltipTableId] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestDiet, setNewGuestDiet] = useState('');
  const [newGuestIsVip, setNewGuestIsVip] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const savedEvents = await AsyncStorage.getItem(EVENTS_STORAGE_KEY);
        if (savedEvents) {
          const parsed: unknown = JSON.parse(savedEvents);
          if (!isStoredEvents(parsed)) {
            throw new Error('Saved event data has an invalid format.');
          }
          setEventPlans(parsed.events);
          setActiveEventId(parsed.activeEventId);
          return;
        }

        const savedLayout = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedLayout) {
          const parsed: unknown = JSON.parse(savedLayout);
          if (isTableArray(parsed)) {
            setEventPlans([{ id: DEFAULT_EVENT_ID, name: 'Plan With Archie', tables: parsed }]);
          } else {
            throw new Error('Saved seating plan has an invalid format.');
          }
        }
      } catch (err) {
        Alert.alert(
          'Load Failed',
          err instanceof Error ? err.message : 'Could not load saved events.'
        );
      } finally {
        setStorageLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (!storageLoaded) return;
    AsyncStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify({ events: eventPlans, activeEventId }))
      .catch(() => Alert.alert('Save Failed', 'Could not save your events to local storage.'));
  }, [eventPlans, activeEventId, storageLoaded]);

  useEffect(() => {
    if (!storageLoaded) return;
    SplashScreen.hideAsync().catch(error => {
      console.warn('Could not hide the splash screen after startup:', error);
    });
  }, [storageLoaded]);

  const saveToLocalStorage = async () => {
    try {
      await AsyncStorage.multiSet([
        [EVENTS_STORAGE_KEY, JSON.stringify({ events: eventPlans, activeEventId })],
        [STORAGE_KEY, JSON.stringify(tables)]
      ]);
      Alert.alert('Configuration Saved', `${activeEvent?.name ?? 'Event'} has been saved.`);
    } catch (e) {
      Alert.alert('Save Failed', 'Could not save to local storage.');
    }
  };

  const renameEvent = (name: string) => {
    setEventPlans(previous => previous.map(event => event.id === activeEventId ? { ...event, name } : event));
  };

  const createEvent = (name: string) => {
    const newEvent: EventPlan = {
      id: `event_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      tables: []
    };
    setEventPlans(previous => [...previous, newEvent]);
    setActiveEventId(newEvent.id);
    setTooltipTableId(null);
    setSelectedTable(null);
    resetGuestForm();
  };

  const switchEvent = (id: string) => {
    if (!eventPlans.some(event => event.id === id)) return;
    setActiveEventId(id);
    setTooltipTableId(null);
    setSelectedTable(null);
    resetGuestForm();
    setSettingsVisible(false);
  };

  const deleteEvent = (id: string) => {
    const event = eventPlans.find(item => item.id === id);
    if (!event || eventPlans.length <= 1) return;

    Alert.alert('Delete event?', `“${event.name}” and its seating plan will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const remainingEvents = eventPlans.filter(item => item.id !== id);
          setEventPlans(remainingEvents);
          if (id === activeEventId) {
            setActiveEventId(remainingEvents[0].id);
            setTooltipTableId(null);
            setSelectedTable(null);
            resetGuestForm();
          }
        }
      }
    ]);
  };

  const exportEventJson = async () => {
    if (!activeEvent || !FileSystem.cacheDirectory) {
      Alert.alert('Export Failed', 'Could not access a temporary file location.');
      return;
    }

    try {
      const fileName = activeEvent.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'event';
      const uri = `${FileSystem.cacheDirectory}${fileName}-seating-plan.json`;
      const config = {
        format: 'plan-with-archie',
        version: 1,
        eventName: activeEvent.name,
        tables
      };
      await FileSystem.writeAsStringAsync(uri, JSON.stringify(config, null, 2), {
        encoding: FileSystem.EncodingType.UTF8
      });
      await Sharing.shareAsync(uri, { mimeType: 'application/json', UTI: 'public.json' });
    } catch (error) {
      Alert.alert('Export Failed', error instanceof Error ? error.message : 'Could not export this event.');
    }
  };

  const importEventJson = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/json'],
        copyToCacheDirectory: true,
        multiple: false
      });
      if (result.canceled) return;

      const json = await FileSystem.readAsStringAsync(result.assets[0].uri);
      const parsed: unknown = JSON.parse(json);
      const importedTables = Array.isArray(parsed)
        ? parsed
        : typeof parsed === 'object' && parsed !== null && 'tables' in parsed
          ? parsed.tables
          : null;
      if (!isTableArray(importedTables)) {
        throw new Error('The selected JSON does not contain a valid seating plan.');
      }

      Alert.alert(
        'Replace seating plan?',
        `This will replace the current layout for ${activeEvent?.name ?? 'this event'}.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Replace',
            style: 'destructive',
            onPress: () => {
              setTables(importedTables);
              setTooltipTableId(null);
              setSelectedTable(null);
              resetGuestForm();
              Alert.alert('Import Complete', 'The current event seating plan has been replaced.');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Import Failed', error instanceof Error ? error.message : 'Could not import this configuration.');
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
    setSelectedTable(null);
    setTooltipTableId(newTable.id);
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
    resetGuestForm();
    setSelectedTable(null);
    setTooltipTableId(newItem.id);
  };

  const updateTablePosition = (id: string, x: number, y: number) => {
    setTables(prev => prev.map(t => (t.id === id ? { ...t, x, y } : t)));
  };

  const applyTableUpdate = (table: TableItem, updates: Partial<TableItem>): TableItem => {
    const next: TableItem = { ...table, ...updates };
    if (
      updates.x === undefined &&
      updates.y === undefined &&
      (updates.scale !== undefined || updates.lengthScale !== undefined || updates.widthScale !== undefined)
    ) {
      const prevDims = getTableDimensions(table);
      const nextDims = getTableDimensions(next);
      next.x = table.x + (prevDims.width - nextDims.width) / 2;
      next.y = table.y + (prevDims.height - nextDims.height) / 2;
    }
    return next;
  };

  const updateTableById = (id: string, updates: Partial<TableItem>) => {
    setTables(prev => prev.map(t => (t.id === id ? applyTableUpdate(t, updates) : t)));
    if (selectedTable?.id === id) {
      setSelectedTable(prev => (prev ? applyTableUpdate(prev, updates) : null));
    }
  };

  const updateSelectedTable = (updates: Partial<TableItem>) => {
    if (!selectedTable) return;
    const updated: TableItem = {
      ...selectedTable,
      ...updates,
      ...(updates.capacity !== undefined
        ? { guests: normalizeGuestsForCapacity(selectedTable, updates.capacity) }
        : {})
    };
    setTables(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    setSelectedTable(updated);
  };

  const moveGuestSeat = (fromSeatIndex: number, toSeatIndex: number) => {
    if (!selectedTable) return;
    const updatedGuests = moveGuestBetweenSeats(selectedTable, fromSeatIndex, toSeatIndex);
    if (updatedGuests === selectedTable.guests) return;
    const updated = { ...selectedTable, guests: updatedGuests };
    setTables(prev => prev.map(t => (t.id === updated.id ? updated : t)));
    setSelectedTable(updated);
  };

  const addGuestToTable = (preferredSeatIndex?: number | null) => {
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
    const seated = seatGuestAtTable(selectedTable, newGuest, preferredSeatIndex);
    const updated = {
      ...selectedTable,
      guests: seated.guests,
      capacity: seated.capacity
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
      guests: removeGuestPreservingSeats(selectedTable, guestId)
    };
    setTables(prev => prev.map(t => (t.id === selectedTable.id ? updated : t)));
    setSelectedTable(updated);
    if (editingGuestId === guestId) resetGuestForm();
  };

  const deleteTable = (id: string) => {
    setTables(prev => prev.filter(t => t.id !== id));
    resetGuestForm();
    setTooltipTableId(prev => (prev === id ? null : prev));
    setSelectedTable(null);
  };

  if (settingsVisible) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <StatusBar barStyle="dark-content" />
        <EventSettings
          events={eventPlans.map(({ id, name }) => ({ id, name }))}
          currentEventId={activeEventId}
          onClose={() => setSettingsVisible(false)}
          onRename={renameEvent}
          onCreate={createEvent}
          onSwitch={switchEvent}
          onDelete={deleteEvent}
          onExport={exportEventJson}
          onImport={importEventJson}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="dark-content" />
      <AppHeader
        title={activeEvent?.name ?? 'Plan With Archie'}
        onSave={saveToLocalStorage}
        onExport={() => exportVenuePDF(tables, activeEvent?.name ?? 'Plan With Archie')}
        onSettings={() => setSettingsVisible(true)}
      />
      <FloorPlanCanvas
        tables={tables}
        selectedTableId={tooltipTableId}
        onDragEnd={updateTablePosition}
        onSelect={table => setTooltipTableId(table.id)}
        onDismissSelection={() => setTooltipTableId(null)}
        onManageTable={table => {
          resetGuestForm();
          setTooltipTableId(null);
          setSelectedTable(table);
        }}
        onUpdateTable={updateTableById}
        onDeleteItem={deleteTable}
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
        onMoveGuestSeat={moveGuestSeat}
        onGuestNameChange={setNewGuestName}
        onGuestDietChange={setNewGuestDiet}
        onToggleVip={() => setNewGuestIsVip(value => !value)}
        onSubmitGuest={addGuestToTable}
        onCancelEdit={resetGuestForm}
        onUpdateTable={updateSelectedTable}
      />
    </SafeAreaView>
  );
}

function isStoredEvents(value: unknown): value is { events: EventPlan[]; activeEventId: string } {
  if (typeof value !== 'object' || value === null || !('events' in value) || !('activeEventId' in value)) {
    return false;
  }
  const stored = value as { events: unknown; activeEventId: unknown };
  return Array.isArray(stored.events)
    && stored.events.length > 0
    && stored.events.every(isEventPlan)
    && new Set(stored.events.map(event => event.id)).size === stored.events.length
    && typeof stored.activeEventId === 'string'
    && stored.events.some(event => event.id === stored.activeEventId);
}

function isEventPlan(value: unknown): value is EventPlan {
  if (typeof value !== 'object' || value === null) return false;
  const event = value as Record<string, unknown>;
  return typeof event.id === 'string'
    && event.id.length > 0
    && typeof event.name === 'string'
    && event.name.trim().length > 0
    && isTableArray(event.tables);
}

function isTableArray(value: unknown): value is TableItem[] {
  return Array.isArray(value)
    && value.every(isTableItem)
    && new Set(value.map(table => table.id)).size === value.length;
}

function isTableItem(value: unknown): value is TableItem {
  if (typeof value !== 'object' || value === null) return false;
  const table = value as Record<string, unknown>;
  const validVenueTypes = ['dj', 'bar', 'dancefloor', 'cakebar', 'other'];
  return typeof table.id === 'string'
    && typeof table.name === 'string'
    && (table.shape === 'round' || table.shape === 'square' || table.shape === 'rectangle')
    && typeof table.capacity === 'number'
    && Number.isInteger(table.capacity)
    && table.capacity >= 0
    && typeof table.x === 'number'
    && Number.isFinite(table.x)
    && typeof table.y === 'number'
    && Number.isFinite(table.y)
    && Array.isArray(table.guests)
    && table.guests.every((guest: unknown) =>
      typeof guest === 'object'
      && guest !== null
      && 'id' in guest
      && typeof guest.id === 'string'
      && guest.id.length > 0
      && 'name' in guest
      && typeof guest.name === 'string'
      && (!('dietary' in guest) || guest.dietary === undefined || typeof guest.dietary === 'string')
      && (!('isVip' in guest) || guest.isVip === undefined || typeof guest.isVip === 'boolean')
      && (!('seatIndex' in guest) || guest.seatIndex === undefined || (typeof guest.seatIndex === 'number' && Number.isInteger(guest.seatIndex) && guest.seatIndex >= 0))
    )
    && (table.venueType === undefined || validVenueTypes.includes(String(table.venueType)))
    && ['scale', 'lengthScale', 'widthScale', 'rotation'].every(key =>
      table[key] === undefined || (typeof table[key] === 'number' && Number.isFinite(table[key]))
    );
}
