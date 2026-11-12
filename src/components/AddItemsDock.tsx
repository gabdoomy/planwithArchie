import React from 'react';
import type { TableShape, VenueItemType } from '../types/seating';
import { venueItemIcons, venueItemLabels } from '../venueItems';

interface AddItemsDockProps {
  onAddTable: (shape: TableShape) => void;
  onAddVenueItem: (type: VenueItemType) => void;
}

export default function AddItemsDock({ onAddTable, onAddVenueItem }: AddItemsDockProps) {
  const venueTypes: VenueItemType[] = ['dj', 'bar', 'dancefloor', 'cakebar', 'other'];

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 max-w-[95vw] overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-1.5 p-1.5 bg-[#fbf7ef]/95 backdrop-blur-md rounded-2xl border border-[#e5d9c8] shadow-xl">
        {/* Tables Section */}
        <button
          onClick={() => onAddTable('round')}
          className="flex flex-col items-center justify-center gap-1 min-w-[62px] px-2.5 py-1.5 rounded-xl hover:bg-[#efe5d6] active:scale-95 transition-all text-[#51463c] cursor-pointer group"
          title="Add Round Table"
        >
          <div className="w-5 h-5 rounded-full border-2 border-[#766354] group-hover:bg-[#766354]/10 transition-colors" />
          <span className="text-[10px] font-bold tracking-tight">Round</span>
        </button>

        <button
          onClick={() => onAddTable('rectangle')}
          className="flex flex-col items-center justify-center gap-1 min-w-[62px] px-2.5 py-1.5 rounded-xl hover:bg-[#efe5d6] active:scale-95 transition-all text-[#51463c] cursor-pointer group"
          title="Add Rectangle Table"
        >
          <div className="w-6 h-4 rounded-sm border-2 border-[#766354] group-hover:bg-[#766354]/10 transition-colors" />
          <span className="text-[10px] font-bold tracking-tight">Rectangle</span>
        </button>

        <button
          onClick={() => onAddTable('square')}
          className="flex flex-col items-center justify-center gap-1 min-w-[62px] px-2.5 py-1.5 rounded-xl hover:bg-[#efe5d6] active:scale-95 transition-all text-[#51463c] cursor-pointer group"
          title="Add Square Table"
        >
          <div className="w-4.5 h-4.5 rounded-sm border-2 border-[#766354] group-hover:bg-[#766354]/10 transition-colors" />
          <span className="text-[10px] font-bold tracking-tight">Square</span>
        </button>

        {/* Divider */}
        <div className="w-px h-7 bg-[#e5d9c8] mx-0.5" />

        {/* Venue Items Section */}
        {venueTypes.map(type => (
          <button
            key={type}
            onClick={() => onAddVenueItem(type)}
            className="flex flex-col items-center justify-center gap-0.5 min-w-[58px] px-2 py-1.5 rounded-xl hover:bg-[#efe5d6] active:scale-95 transition-all text-[#51463c] cursor-pointer"
            title={`Add ${venueItemLabels[type]}`}
          >
            <span className="text-sm leading-none font-bold text-[#766354]">
              {venueItemIcons[type]}
            </span>
            <span className="text-[10px] font-bold tracking-tight truncate max-w-[60px]">
              {venueItemLabels[type]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
