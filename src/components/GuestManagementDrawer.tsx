import React, { useState } from 'react';
import { Guest, Table, DietaryRequirement, RSVPStatus } from '../types/seating';
import { X, Search, Plus, UserPlus, GripVertical, CheckCircle2, Clock, AlertCircle, Utensils, Star } from 'lucide-react';

interface GuestManagementDrawerProps {
  isOpen: boolean;
  guests: Guest[];
  tables: Table[];
  onClose: () => void;
  onAddGuest: (guest: Omit<Guest, 'id'>) => void;
  onAssignGuest: (guestId: string, tableId: string | null) => void;
  onDeleteGuest: (guestId: string) => void;
  onStartDragGuest: (guest: Guest) => void;
  onEndDragGuest: () => void;
}

export const GuestManagementDrawer: React.FC<GuestManagementDrawerProps> = ({
  isOpen,
  guests,
  tables,
  onClose,
  onAddGuest,
  onAssignGuest,
  onDeleteGuest,
  onStartDragGuest,
  onEndDragGuest
}) => {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unassigned' | 'seated'>('unassigned');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Guest Form State
  const [name, setName] = useState('');
  const [group, setGroup] = useState('Friends');
  const [rsvp, setRsvp] = useState<RSVPStatus>('confirmed');
  const [dietary, setDietary] = useState<DietaryRequirement>('none');
  const [isVip, setIsVip] = useState(false);
  const [targetTableId, setTargetTableId] = useState<string>('');

  if (!isOpen) return null;

  const filteredGuests = guests.filter((g) => {
    const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.group.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filterMode === 'unassigned') return g.tableId === null;
    if (filterMode === 'seated') return g.tableId !== null;
    return true;
  });

  const unassignedCount = guests.filter(g => g.tableId === null).length;
  const seatedCount = guests.filter(g => g.tableId !== null).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddGuest({
      name: name.trim(),
      group: group.trim() || 'General',
      rsvp,
      dietary,
      isVip,
      tableId: targetTableId || null,
      seatNumber: null
    });

    setName('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-md h-full bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">Guest Roster</h2>
            <p className="text-xs text-neutral-500 font-medium">
              {seatedCount} seated · {unassignedCount} unassigned
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-neutral-100 space-y-3 bg-neutral-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guests by name or group..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium"
            />
          </div>

          {/* Segmented Controls for Filter */}
          <div className="flex items-center gap-1 p-1 bg-neutral-200/60 rounded-xl">
            <button
              onClick={() => setFilterMode('unassigned')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterMode === 'unassigned'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Unassigned ({unassignedCount})
            </button>
            <button
              onClick={() => setFilterMode('seated')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterMode === 'seated'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Seated ({seatedCount})
            </button>
            <button
              onClick={() => setFilterMode('all')}
              className={`flex-1 py-1 text-xs font-semibold rounded-lg transition-colors ${
                filterMode === 'all'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All ({guests.length})
            </button>
          </div>
        </div>

        {/* Add Guest Button / Form */}
        <div className="p-4 border-b border-neutral-100">
          {!showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 px-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Wedding Guest</span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-900">New Guest Details</span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs text-neutral-400 hover:text-neutral-600"
                >
                  Cancel
                </button>
              </div>

              <input
                type="text"
                placeholder="Full Name (e.g. Julian Hayes)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg text-neutral-700"
                >
                  <option value="Bridal Party">Bridal Party</option>
                  <option value="Bride's Family">Bride's Family</option>
                  <option value="Groom's Family">Groom's Family</option>
                  <option value="Friends">Friends</option>
                  <option value="Colleagues">Colleagues</option>
                  <option value="International">International</option>
                </select>

                <select
                  value={dietary}
                  onChange={(e) => setDietary(e.target.value as DietaryRequirement)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg text-neutral-700"
                >
                  <option value="none">Standard Diet</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                  <option value="gluten_free">Gluten-Free</option>
                  <option value="nut_allergy">Nut Allergy</option>
                  <option value="halal">Halal</option>
                  <option value="kosher">Kosher</option>
                  <option value="kid">Kid Meal</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVip}
                    onChange={(e) => setIsVip(e.target.checked)}
                    className="rounded text-neutral-900 focus:ring-0"
                  />
                  <span>VIP Guest</span>
                </label>

                <button
                  type="submit"
                  className="px-4 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800"
                >
                  Save Guest
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Guest List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredGuests.length === 0 ? (
            <div className="py-12 text-center text-neutral-400">
              <p className="text-xs font-medium">No guests found</p>
            </div>
          ) : (
            filteredGuests.map((guest) => {
              const table = tables.find(t => t.id === guest.tableId);
              return (
                <div
                  key={guest.id}
                  draggable
                  onDragStart={() => onStartDragGuest(guest)}
                  onDragEnd={() => onEndDragGuest()}
                  className="p-3 bg-white border border-neutral-200 rounded-xl hover:border-neutral-300 transition-all shadow-2xs flex items-center justify-between group cursor-grab active:cursor-grabbing"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-3.5 h-3.5 text-neutral-300 group-hover:text-neutral-500" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-neutral-900">{guest.name}</span>
                        {guest.isVip && (
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mt-0.5">
                        <span>{guest.group}</span>
                        {guest.dietary && guest.dietary !== 'none' && (
                          <>
                            <span>·</span>
                            <span className="text-rose-600 font-medium">
                              {guest.dietary.replace('_', ' ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Table Assignment or Quick Assign Dropdown */}
                  <div className="flex items-center gap-2">
                    <select
                      value={guest.tableId || ''}
                      onChange={(e) => onAssignGuest(guest.id, e.target.value || null)}
                      className={`text-[11px] font-semibold py-1 px-2 rounded-lg border focus:outline-none ${
                        table
                          ? 'bg-neutral-100 border-neutral-300 text-neutral-800'
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}
                    >
                      <option value="">Unassigned</option>
                      {tables.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => onDeleteGuest(guest.id)}
                      className="text-neutral-300 hover:text-rose-600 p-1 rounded-md transition-colors"
                      title="Remove guest"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
