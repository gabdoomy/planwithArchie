import React from 'react';
import type { Guest, TableItem } from '../types/seating';
import { X, Edit2, Star, Trash2, Plus, Minus, RotateCw } from 'lucide-react';

interface TableInspectorProps {
  table: TableItem | null;
  guestName: string;
  guestDiet: string;
  guestIsVip: boolean;
  editingGuestId: string | null;
  onClose: () => void;
  onDeleteTable: () => void;
  onRemoveGuest: (guestId: string) => void;
  onEditGuest: (guest: Guest) => void;
  onGuestNameChange: (value: string) => void;
  onGuestDietChange: (value: string) => void;
  onToggleVip: () => void;
  onSubmitGuest: () => void;
  onCancelEdit: () => void;
  onUpdateTable: (updates: Partial<TableItem>) => void;
}

export default function TableInspector({
  table,
  guestName,
  guestDiet,
  guestIsVip,
  editingGuestId,
  onClose,
  onDeleteTable,
  onRemoveGuest,
  onEditGuest,
  onGuestNameChange,
  onGuestDietChange,
  onToggleVip,
  onSubmitGuest,
  onCancelEdit,
  onUpdateTable
}: TableInspectorProps) {
  if (!table) return null;

  const currentScale = table.scale ?? 1;
  const currentLengthScale = table.lengthScale ?? 1;
  const currentWidthScale = table.widthScale ?? 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg max-h-[90vh] bg-[#fbf7ef] rounded-3xl shadow-2xl border border-[#e5d9c8] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5d9c8] flex items-start justify-between gap-4 bg-[#f8f2e6]">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold tracking-wider text-[#84796d] uppercase block">
              Table Name · Tap to Edit
            </span>
            <div className="relative mt-1 flex items-center">
              <input
                type="text"
                value={table.name}
                onChange={e => onUpdateTable({ name: e.target.value })}
                placeholder="Enter table name"
                className="w-full text-lg font-bold text-[#51463c] bg-transparent border-b border-transparent hover:border-[#b8a48c] focus:border-[#766354] focus:outline-hidden pb-0.5 pr-6 transition-colors"
              />
              <Edit2 className="w-3.5 h-3.5 text-[#84796d] absolute right-1 pointer-events-none" />
            </div>
            <p className="text-xs font-semibold text-[#84796d] mt-1 capitalize">
              {table.shape} Table · {table.guests.length} / {table.capacity} Seats
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-bold text-[#fffaf2] bg-[#766354] hover:bg-[#685648] active:scale-95 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Done
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Seated Guests Section */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#84796d]">
                Seated Guests ({table.guests.length})
              </h3>
              <span className="text-[11px] font-medium text-[#84796d]">
                {table.capacity - table.guests.length} seats open
              </span>
            </div>

            {table.guests.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#e5d9c8] text-center text-xs text-[#9a8d7c] italic bg-[#fcf9f2]">
                No people seated at this table yet.
              </div>
            ) : (
              <div className="space-y-2">
                {table.guests.map((guest, idx) => (
                  <div
                    key={guest.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#fcf9f2] border border-[#e5d9c8] hover:border-[#b8a48c] transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-6 h-6 rounded-full bg-[#efe5d6] border border-[#d8cbb8] flex items-center justify-center text-[10px] font-bold text-[#766354] shrink-0">
                        {idx + 1}
                      </div>
                      <div
                        onClick={() => onEditGuest(guest)}
                        className="min-w-0 cursor-pointer flex-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#51463c] truncate">
                            {guest.name}
                          </span>
                          {guest.isVip && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold bg-[#eee1c9] text-[#705b3d] border border-[#ad9166] rounded-md shrink-0 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-[#ad9166]" /> VIP
                            </span>
                          )}
                        </div>
                        {guest.dietary && (
                          <span className="text-[11px] text-[#a35f59] font-medium block truncate">
                            {guest.dietary}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveGuest(guest.id)}
                      className="px-2.5 py-1 text-xs font-medium text-[#a35f59] hover:bg-[#faeae7] rounded-lg transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add / Edit Person Form */}
          <div className="p-4 rounded-2xl bg-[#f4edde] border border-[#e5d9c8] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#766354]">
              {editingGuestId ? 'Edit Person' : 'Add Person to Table'}
            </h3>

            <input
              type="text"
              placeholder="Guest Full Name..."
              value={guestName}
              onChange={e => onGuestNameChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSubmitGuest();
                }
              }}
              className="w-full px-3.5 py-2 text-sm bg-[#fcf9f2] border border-[#d8cbb8] rounded-xl text-[#51463c] placeholder-[#9a8d7c] focus:outline-hidden focus:border-[#766354] transition-colors"
            />

            <input
              type="text"
              placeholder="Dietary Note (e.g. Vegetarian, Nut Allergy)"
              value={guestDiet}
              onChange={e => onGuestDietChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSubmitGuest();
                }
              }}
              className="w-full px-3.5 py-2 text-sm bg-[#fcf9f2] border border-[#d8cbb8] rounded-xl text-[#51463c] placeholder-[#9a8d7c] focus:outline-hidden focus:border-[#766354] transition-colors"
            />

            {/* VIP Toggle */}
            <button
              type="button"
              onClick={onToggleVip}
              className={`w-full py-2 px-3 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                guestIsVip
                  ? 'bg-[#eee1c9] border-[#ad9166] text-[#705b3d]'
                  : 'bg-[#fcf9f2] border-[#d8cbb8] text-[#84796d] hover:bg-[#efe5d6]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${guestIsVip ? 'fill-[#705b3d] text-[#705b3d]' : 'text-[#84796d]'}`} />
              <span>{guestIsVip ? 'VIP guest' : 'Mark as VIP'}</span>
            </button>

            <button
              type="button"
              onClick={onSubmitGuest}
              disabled={!guestName.trim()}
              className="w-full py-2.5 text-xs font-bold text-[#fffaf2] bg-[#766354] hover:bg-[#685648] disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              {editingGuestId ? 'Save Changes' : '+ Seat Guest'}
            </button>

            {editingGuestId && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="w-full py-1.5 text-xs font-medium text-[#84796d] hover:text-[#51463c] transition-colors cursor-pointer text-center"
              >
                Cancel editing
              </button>
            )}
          </div>

          {/* Table Geometry & Sizing Controls */}
          <div className="p-4 rounded-2xl bg-[#fcf9f2] border border-[#e5d9c8] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#84796d]">
              Table Configuration
            </h3>

            {/* Seats Stepper */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#51463c]">Seats</span>
              <div className="flex items-center gap-3 bg-[#efe5d6] px-2 py-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => onUpdateTable({ capacity: table.capacity - 1 })}
                  disabled={table.capacity <= Math.max(1, table.guests.length)}
                  className="w-6 h-6 flex items-center justify-center font-bold text-[#51463c] disabled:opacity-30 hover:bg-[#e4d7c6] rounded-lg cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-[#51463c] w-6 text-center tabular-nums">
                  {table.capacity}
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateTable({ capacity: table.capacity + 1 })}
                  className="w-6 h-6 flex items-center justify-center font-bold text-[#51463c] hover:bg-[#e4d7c6] rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Overall Size Stepper */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#51463c]">Overall Size</span>
              <div className="flex items-center gap-3 bg-[#efe5d6] px-2 py-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => onUpdateTable({ scale: Math.max(0.6, Number((currentScale - 0.1).toFixed(1))) })}
                  disabled={currentScale <= 0.6}
                  className="w-6 h-6 flex items-center justify-center font-bold text-[#51463c] disabled:opacity-30 hover:bg-[#e4d7c6] rounded-lg cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-bold text-[#51463c] w-10 text-center tabular-nums">
                  {Math.round(currentScale * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateTable({ scale: Math.min(1.8, Number((currentScale + 0.1).toFixed(1))) })}
                  disabled={currentScale >= 1.8}
                  className="w-6 h-6 flex items-center justify-center font-bold text-[#51463c] disabled:opacity-30 hover:bg-[#e4d7c6] rounded-lg cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Rectangle-specific Length & Width */}
            {table.shape === 'rectangle' && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#51463c]">Length</span>
                  <div className="flex items-center gap-3 bg-[#efe5d6] px-2 py-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => onUpdateTable({
                        lengthScale: Math.max(0.6, Math.round((currentLengthScale - 0.1) * 10) / 10)
                      })}
                      disabled={currentLengthScale <= 0.6}
                      className="w-6 h-6 flex items-center justify-center font-bold text-[#51463c] disabled:opacity-30 hover:bg-[#e4d7c6] rounded-lg cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-[#51463c] w-10 text-center tabular-nums">
                      {Math.round(currentLengthScale * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateTable({
                        lengthScale: Math.min(2.5, Math.round((currentLengthScale + 0.1) * 10) / 10)
                      })}
                      disabled={currentLengthScale >= 2.5}
                      className="w-6 h-6 flex items-center justify-center font-bold text-[#51463c] disabled:opacity-30 hover:bg-[#e4d7c6] rounded-lg cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#51463c]">Width</span>
                  <div className="flex items-center gap-3 bg-[#efe5d6] px-2 py-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => onUpdateTable({
                        widthScale: Math.max(0.6, Math.round((currentWidthScale - 0.1) * 10) / 10)
                      })}
                      disabled={currentWidthScale <= 0.6}
                      className="w-6 h-6 flex items-center justify-center font-bold text-[#51463c] disabled:opacity-30 hover:bg-[#e4d7c6] rounded-lg cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-[#51463c] w-10 text-center tabular-nums">
                      {Math.round(currentWidthScale * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateTable({
                        widthScale: Math.min(2.5, Math.round((currentWidthScale + 0.1) * 10) / 10)
                      })}
                      disabled={currentWidthScale >= 2.5}
                      className="w-6 h-6 flex items-center justify-center font-bold text-[#51463c] disabled:opacity-30 hover:bg-[#e4d7c6] rounded-lg cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Rotation */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#51463c]">Orientation</span>
              <button
                type="button"
                onClick={() =>
                  onUpdateTable({
                    rotation: ((table.rotation ?? 0) + (table.shape === 'rectangle' ? 45 : 90)) % 360
                  })
                }
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#51463c] bg-[#efe5d6] hover:bg-[#e4d7c6] rounded-xl transition-all cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Rotate ({table.rotation ?? 0}°)</span>
              </button>
            </div>
          </div>

          {/* Delete Table Button */}
          <button
            type="button"
            onClick={onDeleteTable}
            className="w-full py-2.5 px-4 text-xs font-bold text-[#a35f59] border border-[#f0d8d4] hover:bg-[#fcf1ef] active:scale-98 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete This Table</span>
          </button>
        </div>
      </div>
    </div>
  );
}
