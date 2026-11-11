import React, { useState } from 'react';
import { Table, Guest, TableShape, DietaryRequirement } from '../types/seating';
import { X, Users, Trash2, RotateCw, Plus, UserMinus, ShieldAlert, Check } from 'lucide-react';

interface TableInspectorModalProps {
  table: Table;
  allGuests: Guest[];
  onClose: () => void;
  onUpdateTable: (updated: Partial<Table>) => void;
  onDeleteTable: (tableId: string) => void;
  onAssignGuest: (guestId: string, tableId: string, seatNumber?: number) => void;
  onUnassignGuest: (guestId: string) => void;
  onAddNewGuestToTable: (name: string, dietary: DietaryRequirement, isVip: boolean) => void;
}

export const TableInspectorModal: React.FC<TableInspectorModalProps> = ({
  table,
  allGuests,
  onClose,
  onUpdateTable,
  onDeleteTable,
  onAssignGuest,
  onUnassignGuest,
  onAddNewGuestToTable
}) => {
  const [tableName, setTableName] = useState(table.name);
  const [selectedShape, setSelectedShape] = useState<TableShape>(table.shape);
  const [capacity, setCapacity] = useState(table.capacity);
  const [showAddGuestForm, setShowAddGuestForm] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestDiet, setNewGuestDiet] = useState<DietaryRequirement>('none');
  const [newGuestVip, setNewGuestVip] = useState(false);
  const [activeSeatForPicker, setActiveSeatForPicker] = useState<number | null>(null);

  const seatedGuests = allGuests.filter(g => g.tableId === table.id);
  const unassignedGuests = allGuests.filter(g => g.tableId === null);

  const handleSaveName = () => {
    if (tableName.trim() && tableName !== table.name) {
      onUpdateTable({ name: tableName.trim() });
    }
  };

  const handleShapeChange = (shape: TableShape) => {
    setSelectedShape(shape);
    onUpdateTable({ shape });
  };

  const handleCapacityChange = (newCap: number) => {
    const clamped = Math.max(2, Math.min(20, newCap));
    setCapacity(clamped);
    onUpdateTable({ capacity: clamped });
  };

  const handleRotate = () => {
    const nextRotation = ((table.rotation || 0) + 45) % 360;
    onUpdateTable({ rotation: nextRotation });
  };

  const handleAddGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName.trim()) return;
    onAddNewGuestToTable(newGuestName.trim(), newGuestDiet, newGuestVip);
    setNewGuestName('');
    setNewGuestDiet('none');
    setNewGuestVip(false);
    setShowAddGuestForm(false);
  };

  // Build seat slots from 1 to capacity
  const seatSlots = Array.from({ length: capacity }, (_, i) => {
    const seatNum = i + 1;
    const guest = seatedGuests.find(g => g.seatNumber === seatNum) || seatedGuests[i];
    return { seatNum, guest };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="w-full sm:max-w-lg max-h-[85vh] bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200 animate-in slide-in-from-bottom duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* iOS Drag Handle on Mobile */}
        <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto my-2.5 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">Table Inspector</h2>
            <p className="text-xs text-neutral-500 font-medium">Configure geometry & seated guests</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Table Name Input */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Table Name / Label
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="flex-1 px-3.5 py-2 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium"
                placeholder="e.g. Table 1, Head Table..."
              />
              <button
                type="button"
                onClick={handleRotate}
                title="Rotate Table 45°"
                className="p-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl transition-colors flex items-center gap-1 text-xs font-semibold"
              >
                <RotateCw className="w-4 h-4" />
                <span>{table.rotation || 0}°</span>
              </button>
            </div>
          </div>

          {/* Shape Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
              Table Shape
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleShapeChange('round')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedShape === 'round'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-full border border-current" />
                <span>Round</span>
              </button>

              <button
                type="button"
                onClick={() => handleShapeChange('rectangle')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedShape === 'rectangle'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="w-4 h-2.5 rounded-xs border border-current" />
                <span>Rectangle</span>
              </button>

              <button
                type="button"
                onClick={() => handleShapeChange('square')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedShape === 'square'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded-xs border border-current" />
                <span>Square</span>
              </button>
            </div>
          </div>

          {/* Capacity Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-700">
                Seating Capacity
              </label>
              <span className="text-xs font-bold text-neutral-900 tabular-nums">
                {seatedGuests.length} / {capacity} Seats Filled
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[4, 6, 8, 10, 12].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleCapacityChange(num)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    capacity === num
                      ? 'bg-neutral-900 text-white border-neutral-900'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {num}
                </button>
              ))}
              <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
                <button
                  type="button"
                  onClick={() => handleCapacityChange(capacity - 1)}
                  className="px-2.5 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-200"
                >
                  -
                </button>
                <span className="px-2 text-xs font-bold text-neutral-800 tabular-nums">{capacity}</span>
                <button
                  type="button"
                  onClick={() => handleCapacityChange(capacity + 1)}
                  className="px-2.5 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-200"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Seat Layout & Guests */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Seat Assignments
              </h3>
              <button
                type="button"
                onClick={() => setShowAddGuestForm(!showAddGuestForm)}
                className="text-xs font-semibold text-neutral-900 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Guest</span>
              </button>
            </div>

            {/* Quick Add Guest Form */}
            {showAddGuestForm && (
              <form onSubmit={handleAddGuestSubmit} className="p-3 mb-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-2">
                <input
                  type="text"
                  placeholder="Guest Full Name..."
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <select
                    value={newGuestDiet}
                    onChange={(e) => setNewGuestDiet(e.target.value as DietaryRequirement)}
                    className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-neutral-300 rounded-lg"
                  >
                    <option value="none">Standard Meal</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten_free">Gluten-Free</option>
                    <option value="nut_allergy">Nut Allergy</option>
                    <option value="halal">Halal</option>
                    <option value="kosher">Kosher</option>
                    <option value="kid">Kid Meal</option>
                  </select>

                  <label className="flex items-center gap-1 text-xs text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newGuestVip}
                      onChange={(e) => setNewGuestVip(e.target.checked)}
                      className="rounded text-neutral-900 focus:ring-0"
                    />
                    <span>VIP</span>
                  </label>

                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800"
                  >
                    Add
                  </button>
                </div>
              </form>
            )}

            {/* List of seats */}
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {seatSlots.map(({ seatNum, guest }) => (
                <div
                  key={seatNum}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-100 bg-neutral-50/60 hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-700 text-[10px] font-bold flex items-center justify-center">
                      {seatNum}
                    </span>
                    {guest ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-neutral-900">{guest.name}</span>
                          {guest.isVip && (
                            <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1 rounded-sm">
                              VIP
                            </span>
                          )}
                        </div>
                        {guest.dietary && guest.dietary !== 'none' && (
                          <span className="text-[10px] text-rose-600 font-medium">
                            {guest.dietary.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400 italic">Empty Chair</span>
                    )}
                  </div>

                  <div>
                    {guest ? (
                      <button
                        type="button"
                        onClick={() => onUnassignGuest(guest.id)}
                        title="Remove from table"
                        className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveSeatForPicker(activeSeatForPicker === seatNum ? null : seatNum)}
                        className="px-2.5 py-1 text-xs font-semibold text-neutral-900 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Unassigned Guest Picker Popover */}
            {activeSeatForPicker !== null && (
              <div className="mt-3 p-3 bg-neutral-100 rounded-xl border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-800">
                    Assign Guest to Seat {activeSeatForPicker}
                  </span>
                  <button
                    onClick={() => setActiveSeatForPicker(null)}
                    className="text-xs text-neutral-500 hover:text-neutral-800"
                  >
                    Cancel
                  </button>
                </div>
                {unassignedGuests.length === 0 ? (
                  <p className="text-xs text-neutral-500 py-1">No unassigned guests available.</p>
                ) : (
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {unassignedGuests.map((ug) => (
                      <button
                        key={ug.id}
                        type="button"
                        onClick={() => {
                          onAssignGuest(ug.id, table.id, activeSeatForPicker);
                          setActiveSeatForPicker(null);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-800 flex items-center justify-between border border-neutral-200"
                      >
                        <span>{ug.name}</span>
                        <span className="text-[10px] text-neutral-400">{ug.group}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 bg-neutral-50 border-t border-neutral-100">
          <button
            type="button"
            onClick={() => {
              if (confirm(`Are you sure you want to delete ${table.name}? Seated guests will be unassigned.`)) {
                onDeleteTable(table.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Table</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
