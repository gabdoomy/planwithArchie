/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { EventPlan, Guest, TableItem, TableShape, VenueItemType } from './types/seating';
import { venueItemLabels } from './venueItems';
import { exportVenuePDF } from './services/exportVenuePDF';
import AppHeader from './components/AppHeader';
import FloorPlanCanvas from './components/FloorPlanCanvas';
import AddItemsDock from './components/AddItemsDock';
import TableInspector from './components/TableInspector';
import VenueItemEditor from './components/VenueItemEditor';
import EventSettings from './components/EventSettings';
import { CheckCircle2 } from 'lucide-react';

const STORAGE_KEY = '@planwitharchie_wedding_seating_v1';
const EVENTS_STORAGE_KEY = '@planwitharchie_events_v1';
const DEFAULT_EVENT_ID = 'default-event';

const initialTables: TableItem[] = [
  {
    id: 't_head',
    name: 'Head Table',
    shape: 'rectangle',
    capacity: 8,
    scale: 1,
    lengthScale: 1,
    widthScale: 1,
    rotation: 0,
    x: 80,
    y: 50,
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
    scale: 1,
    rotation: 0,
    x: 60,
    y: 220,
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
    scale: 1,
    rotation: 0,
    x: 240,
    y: 220,
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
    scale: 1,
    rotation: 0,
    x: 160,
    y: 390,
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
  const [savedRecently, setSavedRecently] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeEvent = eventPlans.find(event => event.id === activeEventId) ?? eventPlans[0];
  const tables = activeEvent?.tables ?? [];

  const setTables = (nextTables: TableItem[] | ((previous: TableItem[]) => TableItem[])) => {
    setEventPlans(previous =>
      previous.map(event =>
        event.id === activeEventId
          ? {
              ...event,
              tables: typeof nextTables === 'function' ? nextTables(event.tables) : nextTables
            }
          : event
      )
    );
  };

  // Inspect selection state
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [selectedVenueItem, setSelectedVenueItem] = useState<TableItem | null>(null);

  // Guest form state inside Table Inspector
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestDiet, setNewGuestDiet] = useState('');
  const [newGuestIsVip, setNewGuestIsVip] = useState(false);
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem(EVENTS_STORAGE_KEY);
      if (savedEvents) {
        const parsed = JSON.parse(savedEvents);
        if (isStoredEvents(parsed)) {
          setEventPlans(parsed.events);
          setActiveEventId(parsed.activeEventId);
          setStorageLoaded(true);
          return;
        }
      }

      const savedLayout = localStorage.getItem(STORAGE_KEY);
      if (savedLayout) {
        const parsed = JSON.parse(savedLayout);
        if (isTableArray(parsed)) {
          setEventPlans([{ id: DEFAULT_EVENT_ID, name: 'Plan With Archie', tables: parsed }]);
        }
      }
    } catch (err) {
      console.warn('Could not load saved events:', err);
    } finally {
      setStorageLoaded(true);
    }
  }, []);

  // Save to localStorage automatically on state change
  useEffect(() => {
    if (!storageLoaded) return;
    try {
      localStorage.setItem(
        EVENTS_STORAGE_KEY,
        JSON.stringify({ events: eventPlans, activeEventId })
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
    } catch (e) {
      console.error('Auto-save error:', e);
    }
  }, [eventPlans, activeEventId, storageLoaded, tables]);

  // Keep selected table updated if tables array updates
  useEffect(() => {
    if (selectedTable) {
      const updated = tables.find(t => t.id === selectedTable.id);
      if (updated) setSelectedTable(updated);
    }
    if (selectedVenueItem) {
      const updated = tables.find(t => t.id === selectedVenueItem.id);
      if (updated) setSelectedVenueItem(updated);
    }
  }, [tables]);

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(
        EVENTS_STORAGE_KEY,
        JSON.stringify({ events: eventPlans, activeEventId })
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tables));
      setSavedRecently(true);
      showToast('Configuration saved to local storage');
      setTimeout(() => setSavedRecently(false), 2000);
    } catch {
      alert('Could not save to local storage.');
    }
  };

  const renameEvent = (name: string) => {
    setEventPlans(previous =>
      previous.map(event => (event.id === activeEventId ? { ...event, name } : event))
    );
    showToast(`Renamed event to "${name}"`);
  };

  const createEvent = (name: string) => {
    const newEvent: EventPlan = {
      id: `event_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name,
      tables: []
    };
    setEventPlans(previous => [...previous, newEvent]);
    setActiveEventId(newEvent.id);
    setSelectedTable(null);
    setSelectedVenueItem(null);
    resetGuestForm();
    showToast(`Created new event "${name}"`);
  };

  const switchEvent = (id: string) => {
    if (!eventPlans.some(event => event.id === id)) return;
    setActiveEventId(id);
    setSelectedTable(null);
    setSelectedVenueItem(null);
    resetGuestForm();
    setSettingsVisible(false);
  };

  const deleteEvent = (id: string) => {
    const event = eventPlans.find(item => item.id === id);
    if (!event || eventPlans.length <= 1) return;

    if (
      window.confirm(
        `Delete event?\n\n"${event.name}" and its seating plan will be permanently deleted.`
      )
    ) {
      const remainingEvents = eventPlans.filter(item => item.id !== id);
      setEventPlans(remainingEvents);
      if (id === activeEventId) {
        setActiveEventId(remainingEvents[0].id);
        setSelectedTable(null);
        setSelectedVenueItem(null);
        resetGuestForm();
      }
      showToast(`Deleted "${event.name}"`);
    }
  };

  const exportEventJson = () => {
    if (!activeEvent) return;
    const config = {
      format: 'plan-with-archie',
      version: 1,
      eventName: activeEvent.name,
      tables
    };
    const jsonString = JSON.stringify(config, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName =
      activeEvent.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'event';
    link.href = url;
    link.download = `${safeName}-seating-plan.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded JSON file');
  };

  const importEventJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result as string;
        const parsed: unknown = JSON.parse(text);
        const importedTables = Array.isArray(parsed)
          ? parsed
          : typeof parsed === 'object' && parsed !== null && 'tables' in parsed
          ? (parsed as Record<string, unknown>).tables
          : null;

        if (!isTableArray(importedTables)) {
          throw new Error('The selected JSON does not contain a valid seating plan.');
        }

        if (
          window.confirm(
            `Replace seating plan?\n\nThis will replace the current layout for "${activeEvent.name}".`
          )
        ) {
          setTables(importedTables);
          setSelectedTable(null);
          setSelectedVenueItem(null);
          resetGuestForm();
          showToast('Imported seating plan successfully');
        }
      } catch (err: any) {
        alert(`Import Failed: ${err.message || 'Could not import configuration'}`);
      }
    };
    reader.readAsText(file);
  };

  const addTable = (shape: TableShape) => {
    const newId = `t_${Date.now()}`;
    const count = tables.length + 1;
    const defaultCapacity = shape === 'square' ? 4 : 8;
    const newTable: TableItem = {
      id: newId,
      name: `Table ${count}`,
      shape,
      capacity: defaultCapacity,
      scale: 1,
      rotation: 0,
      x: 100 + (count % 3) * 110,
      y: 120 + (count % 4) * 110,
      guests: []
    };
    setTables([...tables, newTable]);
    resetGuestForm();
    setSelectedTable(newTable);
    showToast(`Added ${shape} Table ${count}`);
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
      x: 80 + (index % 3) * 120,
      y: 100 + (index % 4) * 120,
      guests: []
    };
    setTables(prev => [...prev, newItem]);
    showToast(`Added ${venueItemLabels[venueType]}`);
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
    setTables(prev => prev.map(item => (item.id === updated.id ? updated : item)));
    setSelectedVenueItem(updated);
  };

  const deleteVenueItem = () => {
    if (!selectedVenueItem) return;
    const name = selectedVenueItem.name;
    setTables(prev => prev.filter(item => item.id !== selectedVenueItem.id));
    setSelectedVenueItem(null);
    showToast(`Deleted ${name}`);
  };

  const addGuestToTable = () => {
    if (!selectedTable || !newGuestName.trim()) return;

    if (editingGuestId) {
      const updated = {
        ...selectedTable,
        guests: selectedTable.guests.map(guest =>
          guest.id === editingGuestId
            ? {
                ...guest,
                name: newGuestName.trim(),
                dietary: newGuestDiet.trim() || undefined,
                isVip: newGuestIsVip
              }
            : guest
        )
      };
      setTables(prev => prev.map(t => (t.id === updated.id ? updated : t)));
      setSelectedTable(updated);
      resetGuestForm();
      showToast('Updated guest details');
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
    showToast(`Seated ${newGuest.name}`);
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
    const removedGuest = selectedTable.guests.find(g => g.id === guestId);
    const updated = {
      ...selectedTable,
      guests: selectedTable.guests.filter(g => g.id !== guestId)
    };
    setTables(prev => prev.map(t => (t.id === selectedTable.id ? updated : t)));
    setSelectedTable(updated);
    if (editingGuestId === guestId) resetGuestForm();
    if (removedGuest) showToast(`Removed ${removedGuest.name}`);
  };

  const deleteTable = (id: string) => {
    const tableToDelete = tables.find(t => t.id === id);
    setTables(prev => prev.filter(t => t.id !== id));
    resetGuestForm();
    setSelectedTable(null);
    if (tableToDelete) showToast(`Deleted ${tableToDelete.name}`);
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#fbf7ef] text-[#51463c] overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <AppHeader
        title={activeEvent?.name ?? 'Plan With Archie'}
        onSave={saveToLocalStorage}
        onExport={() => exportVenuePDF(tables, activeEvent.name)}
        onSettings={() => setSettingsVisible(true)}
        savedRecently={savedRecently}
      />

      {/* Main Full-Screen Floor Plan Canvas */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        <FloorPlanCanvas
          tables={tables}
          selectedId={selectedTable?.id ?? selectedVenueItem?.id ?? null}
          onDragEnd={updateTablePosition}
          onSelect={table => {
            if (table.venueType) {
              setSelectedVenueItem(table);
              setSelectedTable(null);
              return;
            }
            resetGuestForm();
            setSelectedTable(table);
            setSelectedVenueItem(null);
          }}
        />

        {/* Floating Items Dock at the bottom */}
        <AddItemsDock
          onAddTable={addTable}
          onAddVenueItem={addVenueItem}
        />
      </main>

      {/* Table Inspector Modal */}
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
        onToggleVip={() => setNewGuestIsVip(v => !v)}
        onSubmitGuest={addGuestToTable}
        onCancelEdit={resetGuestForm}
        onUpdateTable={updateSelectedTable}
      />

      {/* Venue Item Editor Modal */}
      <VenueItemEditor
        item={selectedVenueItem}
        onClose={() => setSelectedVenueItem(null)}
        onUpdate={updateVenueItem}
        onDelete={deleteVenueItem}
      />

      {/* Event Settings Modal */}
      {settingsVisible && (
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
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#51463c] text-[#fffaf2] text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

// Data validation helpers matching the iOS persistence rules
function isStoredEvents(value: unknown): value is { events: EventPlan[]; activeEventId: string } {
  if (typeof value !== 'object' || value === null || !('events' in value) || !('activeEventId' in value)) {
    return false;
  }
  const stored = value as { events: unknown; activeEventId: unknown };
  return (
    Array.isArray(stored.events) &&
    stored.events.length > 0 &&
    stored.events.every(isEventPlan) &&
    new Set(stored.events.map(event => event.id)).size === stored.events.length &&
    typeof stored.activeEventId === 'string' &&
    stored.events.some(event => event.id === stored.activeEventId)
  );
}

function isEventPlan(value: unknown): value is EventPlan {
  if (typeof value !== 'object' || value === null) return false;
  const event = value as Record<string, unknown>;
  return (
    typeof event.id === 'string' &&
    event.id.length > 0 &&
    typeof event.name === 'string' &&
    event.name.trim().length > 0 &&
    isTableArray(event.tables)
  );
}

function isTableArray(value: unknown): value is TableItem[] {
  return Array.isArray(value) && value.every(isTableItem) && new Set(value.map(table => table.id)).size === value.length;
}

function isTableItem(value: unknown): value is TableItem {
  if (typeof value !== 'object' || value === null) return false;
  const table = value as Record<string, unknown>;
  const validVenueTypes = ['dj', 'bar', 'dancefloor', 'cakebar', 'other'];
  return (
    typeof table.id === 'string' &&
    typeof table.name === 'string' &&
    (table.shape === 'round' || table.shape === 'square' || table.shape === 'rectangle') &&
    typeof table.capacity === 'number' &&
    Number.isInteger(table.capacity) &&
    table.capacity >= 0 &&
    typeof table.x === 'number' &&
    Number.isFinite(table.x) &&
    typeof table.y === 'number' &&
    Number.isFinite(table.y) &&
    Array.isArray(table.guests) &&
    table.guests.every(
      (guest: unknown) =>
        typeof guest === 'object' &&
        guest !== null &&
        'id' in guest &&
        typeof guest.id === 'string' &&
        guest.id.length > 0 &&
        'name' in guest &&
        typeof guest.name === 'string' &&
        (!('dietary' in guest) || typeof guest.dietary === 'string') &&
        (!('isVip' in guest) || typeof guest.isVip === 'boolean')
    ) &&
    (table.venueType === undefined || validVenueTypes.includes(String(table.venueType))) &&
    ['scale', 'lengthScale', 'widthScale', 'rotation'].every(
      key => table[key] === undefined || (typeof table[key] === 'number' && Number.isFinite(table[key]))
    )
  );
}
