import React, { useState } from 'react';
import { X, Calendar, MapPin, Heart, RotateCcw } from 'lucide-react';
import { SeatingPlan } from '../types/seating';
import { INITIAL_SEATING_PLAN } from '../utils/storage';

interface PlanSettingsModalProps {
  plan: SeatingPlan;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Partial<SeatingPlan>) => void;
  onResetToSample: () => void;
  onClearAll: () => void;
}

export const PlanSettingsModal: React.FC<PlanSettingsModalProps> = ({
  plan,
  isOpen,
  onClose,
  onSave,
  onResetToSample,
  onClearAll
}) => {
  const [weddingName, setWeddingName] = useState(plan.weddingName);
  const [coupleNames, setCoupleNames] = useState(plan.coupleNames);
  const [date, setDate] = useState(plan.date);
  const [venueName, setVenueName] = useState(plan.venueName);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      weddingName: weddingName.trim(),
      coupleNames: coupleNames.trim(),
      date,
      venueName: venueName.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div>
            <h2 className="text-base font-bold text-neutral-900 tracking-tight">Event Specification</h2>
            <p className="text-xs text-neutral-500 font-medium">Customise wedding info & venue details</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Event Title
            </label>
            <input
              type="text"
              value={weddingName}
              onChange={(e) => setWeddingName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium"
              placeholder="e.g. Elena & Marcus's Wedding"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">
              Couple Names
            </label>
            <input
              type="text"
              value={coupleNames}
              onChange={(e) => setCoupleNames(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium"
              placeholder="e.g. Elena Rostova & Marcus Vance"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Event Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Venue Location
              </label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium"
                placeholder="e.g. The Glasshouse Orangery"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset layout and guest list to sample wedding template?')) {
                  onResetToSample();
                  onClose();
                }
              }}
              className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Load Sample Plan</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors shadow-xs"
            >
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
