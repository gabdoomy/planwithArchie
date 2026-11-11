/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SeatingPlan, Table, Guest, VenueFixture, TableShape, FixtureType, DietaryRequirement } from './types/seating';
import {
  INITIAL_SEATING_PLAN,
  loadSeatingPlan,
  saveSeatingPlan,
  exportPlanAsJson,
  importPlanFromJson
} from './utils/storage';
import { exportVenuePDF } from './utils/pdfExport';
import { Canvas } from './components/Canvas';
import { TopBar } from './components/TopBar';
import { AddTableMenu } from './components/AddTableMenu';
import { TableInspectorModal } from './components/TableInspectorModal';
import { GuestManagementDrawer } from './components/GuestManagementDrawer';
import { ExpoCodeModal } from './components/ExpoCodeModal';
import { PlanSettingsModal } from './components/PlanSettingsModal';
import { IosDeviceFrame } from './components/IosDeviceFrame';
import { Settings2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [plan, setPlan] = useState<SeatingPlan>(() => loadSeatingPlan());
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [selectedFixture, setSelectedFixture] = useState<VenueFixture | null>(null);
  const [draggingGuest, setDraggingGuest] = useState<Guest | null>(null);

  // Modals & Panels
  const [isGuestDrawerOpen, setIsGuestDrawerOpen] = useState(false);
  const [isExpoModalOpen, setIsExpoModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Toggles
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [deviceView, setDeviceView] = useState<'fullscreen' | 'iphone' | 'ipad'>('fullscreen');
  const [hasSavedRecently, setHasSavedRecently] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Auto-save debounced or on change
  useEffect(() => {
    saveSeatingPlan(plan);
  }, [plan]);

  // Handle Save button
  const handleSaveToLocalStorage = () => {
    const success = saveSeatingPlan(plan);
    if (success) {
      setHasSavedRecently(true);
      showToast('Seating chart saved to local storage');
      setTimeout(() => setHasSavedRecently(false), 2000);
    }
  };

  // Handle Export JSON
  const handleExportJson = () => {
    exportPlanAsJson(plan);
    showToast('Downloaded JSON configuration');
  };

  // Handle Import JSON
  const handleImportJson = async (file: File) => {
    try {
      const imported = await importPlanFromJson(file);
      setPlan(imported);
      setSelectedTable(null);
      setSelectedFixture(null);
      showToast('Successfully loaded seating plan');
    } catch (err: any) {
      alert(`Could not load JSON: ${err.message || 'Invalid format'}`);
    }
  };

  // Handle Export Venue PDF
  const handleExportPDF = () => {
    exportVenuePDF(plan);
    showToast('Generating official venue PDF spec...');
  };

  // Add Table
  const handleAddTable = (shape: TableShape, capacity: number) => {
    const id = `table_${Date.now()}`;
    const count = plan.tables.length + 1;
    // Position near center
    const x = 500 + (count % 3) * 160;
    const y = 300 + Math.floor(count / 3) * 140;

    const newTable: Table = {
      id,
      name: `Table ${count}`,
      shape,
      capacity,
      x,
      y,
      rotation: 0
    };

    setPlan(prev => ({
      ...prev,
      tables: [...prev.tables, newTable]
    }));

    setSelectedTable(newTable);
    showToast(`Added ${shape} Table ${count}`);
  };

  // Add Fixture
  const handleAddFixture = (type: FixtureType, label: string) => {
    const id = `fix_${Date.now()}`;
    const newFixture: VenueFixture = {
      id,
      type,
      label,
      x: 600,
      y: 400,
      width: type === 'dance_floor' ? 260 : 160,
      height: type === 'dance_floor' ? 200 : 100,
      rotation: 0
    };

    setPlan(prev => ({
      ...prev,
      fixtures: [...prev.fixtures, newFixture]
    }));
    showToast(`Added ${label}`);
  };

  // Update Table Position
  const handleUpdateTablePosition = useCallback((tableId: string, x: number, y: number) => {
    setPlan(prev => ({
      ...prev,
      tables: prev.tables.map(t => (t.id === tableId ? { ...t, x, y } : t))
    }));
  }, []);

  // Update Fixture Position
  const handleUpdateFixturePosition = useCallback((fixtureId: string, x: number, y: number) => {
    setPlan(prev => ({
      ...prev,
      fixtures: prev.fixtures.map(f => (f.id === fixtureId ? { ...f, x, y } : f))
    }));
  }, []);

  // Update Table properties
  const handleUpdateTable = (updatedFields: Partial<Table>) => {
    if (!selectedTable) return;
    setPlan(prev => ({
      ...prev,
      tables: prev.tables.map(t =>
        t.id === selectedTable.id ? { ...t, ...updatedFields } : t
      )
    }));
    setSelectedTable(prev => (prev ? { ...prev, ...updatedFields } : null));
  };

  // Delete Table
  const handleDeleteTable = (tableId: string) => {
    setPlan(prev => ({
      ...prev,
      tables: prev.tables.filter(t => t.id !== tableId),
      // Unassign guests sitting at this table
      guests: prev.guests.map(g => (g.tableId === tableId ? { ...g, tableId: null, seatNumber: null } : g))
    }));
    setSelectedTable(null);
    showToast('Table deleted');
  };

  // Add Guest
  const handleAddGuest = (guestData: Omit<Guest, 'id'>) => {
    const id = `guest_${Date.now()}`;
    const newGuest: Guest = { ...guestData, id };
    setPlan(prev => ({
      ...prev,
      guests: [...prev.guests, newGuest]
    }));
    showToast(`Added guest ${newGuest.name}`);
  };

  // Assign Guest to Table
  const handleAssignGuest = (guestId: string, tableId: string | null, seatNumber?: number) => {
    setPlan(prev => {
      const table = tableId ? prev.tables.find(t => t.id === tableId) : null;
      let finalSeatNumber: number | null = seatNumber || null;

      // If assigning to a table without explicit seat number, find first available seat
      if (table && !finalSeatNumber) {
        const occupiedSeats = new Set(
          prev.guests.filter(g => g.tableId === tableId && g.id !== guestId).map(g => g.seatNumber)
        );
        for (let s = 1; s <= table.capacity; s++) {
          if (!occupiedSeats.has(s)) {
            finalSeatNumber = s;
            break;
          }
        }
      }

      return {
        ...prev,
        guests: prev.guests.map(g => {
          if (g.id === guestId) {
            return {
              ...g,
              tableId,
              seatNumber: tableId ? finalSeatNumber : null
            };
          }
          return g;
        })
      };
    });
  };

  // Unassign Guest
  const handleUnassignGuest = (guestId: string) => {
    handleAssignGuest(guestId, null);
  };

  // Add direct guest to selected table
  const handleAddNewGuestToTable = (name: string, dietary: DietaryRequirement, isVip: boolean) => {
    if (!selectedTable) return;
    const id = `guest_${Date.now()}`;
    // Find next seat
    const occupiedSeats = new Set(
      plan.guests.filter(g => g.tableId === selectedTable.id).map(g => g.seatNumber)
    );
    let nextSeat = 1;
    for (let s = 1; s <= selectedTable.capacity; s++) {
      if (!occupiedSeats.has(s)) {
        nextSeat = s;
        break;
      }
    }

    const newGuest: Guest = {
      id,
      name,
      dietary,
      isVip,
      rsvp: 'confirmed',
      group: 'General',
      tableId: selectedTable.id,
      seatNumber: nextSeat
    };

    setPlan(prev => ({
      ...prev,
      guests: [...prev.guests, newGuest]
    }));
    showToast(`Added ${name} to ${selectedTable.name}`);
  };

  // Delete Guest
  const handleDeleteGuest = (guestId: string) => {
    setPlan(prev => ({
      ...prev,
      guests: prev.guests.filter(g => g.id !== guestId)
    }));
  };

  const unassignedGuestsCount = plan.guests.filter(g => g.tableId === null).length;
  const seatedGuestsCount = plan.guests.filter(g => g.tableId !== null).length;

  return (
    <div className="w-screen h-screen flex flex-col bg-neutral-100 overflow-hidden text-neutral-900">
      {/* Top Bar Navigation */}
      <TopBar
        weddingName={plan.weddingName}
        venueName={plan.venueName}
        onSaveToLocalStorage={handleSaveToLocalStorage}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onExportPDF={handleExportPDF}
        onOpenExpoCode={() => setIsExpoModalOpen(true)}
        hasSavedRecently={hasSavedRecently}
        deviceView={deviceView}
        onChangeDeviceView={setDeviceView}
      />

      {/* Secondary Status & Settings Strip */}
      <div className="h-9 px-6 bg-white border-b border-neutral-200/80 flex items-center justify-between text-xs font-medium text-neutral-500 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-neutral-900 font-semibold">{plan.weddingName}</span>
          <span className="text-neutral-300">·</span>
          <span>{plan.venueName}</span>
          <span className="text-neutral-300">·</span>
          <span>{plan.date}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-neutral-900 font-bold tabular-nums">{seatedGuestsCount}</span>
            <span>seated</span>
            <span className="text-neutral-300">/</span>
            <span className="text-amber-700 font-bold tabular-nums">{unassignedGuestsCount}</span>
            <span>unassigned</span>
          </div>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 transition-colors font-semibold"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage with Optional iOS Device Frame */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        <IosDeviceFrame deviceView={deviceView}>
          <Canvas
            plan={plan}
            selectedTableId={selectedTable ? selectedTable.id : null}
            selectedFixtureId={selectedFixture ? selectedFixture.id : null}
            draggingGuest={draggingGuest}
            snapToGrid={snapToGrid}
            showGrid={showGrid}
            onSelectTable={setSelectedTable}
            onSelectFixture={setSelectedFixture}
            onUpdateTablePosition={handleUpdateTablePosition}
            onUpdateFixturePosition={handleUpdateFixturePosition}
            onAssignGuestToTable={(guestId, tableId) => handleAssignGuest(guestId, tableId)}
          />

          {/* Floating iOS Bottom Dock */}
          <AddTableMenu
            onAddTable={handleAddTable}
            onAddFixture={handleAddFixture}
            onOpenGuestDrawer={() => setIsGuestDrawerOpen(true)}
            unassignedGuestsCount={unassignedGuestsCount}
            snapToGrid={snapToGrid}
            onToggleSnap={() => setSnapToGrid(!snapToGrid)}
            showGrid={showGrid}
            onToggleGrid={() => setShowGrid(!showGrid)}
          />
        </IosDeviceFrame>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals & Drawers */}
      {selectedTable && (
        <TableInspectorModal
          table={selectedTable}
          allGuests={plan.guests}
          onClose={() => setSelectedTable(null)}
          onUpdateTable={handleUpdateTable}
          onDeleteTable={handleDeleteTable}
          onAssignGuest={handleAssignGuest}
          onUnassignGuest={handleUnassignGuest}
          onAddNewGuestToTable={handleAddNewGuestToTable}
        />
      )}

      <GuestManagementDrawer
        isOpen={isGuestDrawerOpen}
        guests={plan.guests}
        tables={plan.tables}
        onClose={() => setIsGuestDrawerOpen(false)}
        onAddGuest={handleAddGuest}
        onAssignGuest={handleAssignGuest}
        onDeleteGuest={handleDeleteGuest}
        onStartDragGuest={(guest) => {
          setDraggingGuest(guest);
          setIsGuestDrawerOpen(false);
        }}
        onEndDragGuest={() => setDraggingGuest(null)}
      />

      <ExpoCodeModal
        isOpen={isExpoModalOpen}
        onClose={() => setIsExpoModalOpen(false)}
      />

      <PlanSettingsModal
        plan={plan}
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={(updated) => setPlan(prev => ({ ...prev, ...updated }))}
        onResetToSample={() => {
          setPlan(INITIAL_SEATING_PLAN);
          setSelectedTable(null);
          showToast('Loaded sample wedding template');
        }}
        onClearAll={() => {
          setPlan(prev => ({
            ...prev,
            tables: [],
            guests: prev.guests.map(g => ({ ...g, tableId: null, seatNumber: null }))
          }));
          setSelectedTable(null);
          showToast('Cleared all tables');
        }}
      />
    </div>
  );
}
