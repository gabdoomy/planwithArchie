import React, { useState, useEffect, useRef } from 'react';
import type { EventSummary } from '../types/seating';
import { ArrowLeft, Trash2, Plus, Download, Upload, Check } from 'lucide-react';

interface EventSettingsProps {
  events: EventSummary[];
  currentEventId: string;
  onClose: () => void;
  onRename: (name: string) => void;
  onCreate: (name: string) => void;
  onSwitch: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export default function EventSettings({
  events,
  currentEventId,
  onClose,
  onRename,
  onCreate,
  onSwitch,
  onDelete,
  onExport,
  onImport
}: EventSettingsProps) {
  const currentEvent = events.find(e => e.id === currentEventId);
  const [eventName, setEventName] = useState(currentEvent?.name ?? '');
  const [newEventName, setNewEventName] = useState('');
  const [savedNameNotice, setSavedNameNotice] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEventName(currentEvent?.name ?? '');
  }, [currentEvent?.id, currentEvent?.name]);

  const saveEventName = () => {
    const name = eventName.trim();
    if (!name || name === currentEvent?.name) return;
    onRename(name);
    setSavedNameNotice(true);
    setTimeout(() => setSavedNameNotice(false), 2000);
  };

  const createEvent = () => {
    const name = newEventName.trim();
    if (!name) return;
    onCreate(name);
    setNewEventName('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg max-h-[90vh] bg-[#fbf7ef] rounded-3xl shadow-2xl border border-[#e5d9c8] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#e5d9c8] flex items-center justify-between gap-4 bg-[#f8f2e6]">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#51463c]">Event Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[#51463c] bg-[#efe5d6] hover:bg-[#e4d7c6] active:scale-95 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Section 1: Current Event Name */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#84796d]">
              Current Event Name
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') saveEventName();
                }}
                placeholder="Event name"
                className="flex-1 px-3.5 py-2 text-sm bg-[#fcf9f2] border border-[#d8cbb8] rounded-xl text-[#51463c] placeholder-[#9a8d7c] focus:outline-hidden focus:border-[#766354] transition-colors"
              />
              <button
                onClick={saveEventName}
                className="px-3.5 py-2 text-xs font-bold text-[#fffaf2] bg-[#766354] hover:bg-[#685648] active:scale-95 rounded-xl transition-all cursor-pointer shrink-0"
              >
                {savedNameNotice ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Saved
                  </span>
                ) : (
                  'Save'
                )}
              </button>
            </div>
          </div>

          {/* Section 2: Your Events */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#84796d]">
              Your Events ({events.length})
            </h3>
            <div className="space-y-1.5">
              {events.map(event => {
                const isActive = event.id === currentEventId;
                return (
                  <div
                    key={event.id}
                    className={`flex items-center justify-between gap-3 p-3 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-[#efe5d6] border-[#ad9166]/50 shadow-2xs'
                        : 'bg-[#fcf9f2] border-[#e5d9c8] hover:border-[#b8a48c]'
                    }`}
                  >
                    <button
                      onClick={() => !isActive && onSwitch(event.id)}
                      className={`flex-1 text-left text-sm font-semibold truncate cursor-pointer ${
                        isActive ? 'text-[#51463c] font-bold' : 'text-[#766354]'
                      }`}
                    >
                      {event.name}
                      {isActive && (
                        <span className="ml-2 text-[10px] font-bold bg-[#eee1c9] text-[#705b3d] px-2 py-0.5 rounded-full border border-[#ad9166]">
                          Active
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(event.id)}
                      disabled={events.length <= 1}
                      title={events.length <= 1 ? 'Cannot delete the only event' : 'Delete event'}
                      className="px-2.5 py-1 text-xs font-medium text-[#a35f59] hover:bg-[#faeae7] disabled:opacity-30 disabled:pointer-events-none rounded-lg transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Create an Event */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#84796d]">
              Create an Event
            </h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newEventName}
                onChange={e => setNewEventName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') createEvent();
                }}
                placeholder="New event name..."
                className="flex-1 px-3.5 py-2 text-sm bg-[#fcf9f2] border border-[#d8cbb8] rounded-xl text-[#51463c] placeholder-[#9a8d7c] focus:outline-hidden focus:border-[#766354] transition-colors"
              />
              <button
                onClick={createEvent}
                disabled={!newEventName.trim()}
                className="flex items-center gap-1 px-3.5 py-2 text-xs font-bold text-[#fffaf2] bg-[#766354] hover:bg-[#685648] disabled:opacity-50 disabled:pointer-events-none active:scale-95 rounded-xl transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create</span>
              </button>
            </div>
          </div>

          {/* Section 4: Seating Plan Configuration (Export / Import) */}
          <div className="space-y-2.5 pt-2 border-t border-[#e5d9c8]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#84796d]">
              Seating Plan Configuration
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onExport}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#efe5d6] hover:bg-[#e4d7c6] active:scale-98 text-xs font-bold text-[#51463c] rounded-xl transition-all cursor-pointer shadow-2xs border border-[#e5d9c8]"
              >
                <Download className="w-3.5 h-3.5 text-[#766354]" />
                <span>Export JSON</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#efe5d6] hover:bg-[#e4d7c6] active:scale-98 text-xs font-bold text-[#51463c] rounded-xl transition-all cursor-pointer shadow-2xs border border-[#e5d9c8]"
              >
                <Upload className="w-3.5 h-3.5 text-[#766354]" />
                <span>Import JSON</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <p className="text-[11px] text-[#84796d] leading-normal italic">
              Importing replaces the seating plan for the current event.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
