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
    <div className="absolute top-4 left-4 z-30 max-h-[calc(100vh-5.5rem)] overflow-y-auto no-scrollbar select-none">
      <div className="flex flex-col items-center gap-1 p-1.5 bg-[#fbf7ef]/95 backdrop-blur-md rounded-2xl border border-[#e5d9c8] shadow-xl">
        {/* Tables Section */}
        <button
          onClick={() => onAddTable('round')}
          className="w-12 py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-[#efe5d6] active:scale-95 transition-all text-[#51463c] cursor-pointer group"
          title="Add Round Table"
        >
          <div className="w-4.5 h-4.5 rounded-full border-2 border-[#766354] group-hover:bg-[#766354]/10 transition-colors" />
          <span className="text-[9px] font-bold tracking-tight leading-none">Round</span>
        </button>

        <button
          onClick={() => onAddTable('rectangle')}
          className="w-12 py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-[#efe5d6] active:scale-95 transition-all text-[#51463c] cursor-pointer group"
          title="Add Rectangle Table"
        >
          <div className="w-5.5 h-3.5 rounded-xs border-2 border-[#766354] group-hover:bg-[#766354]/10 transition-colors" />
          <span className="text-[9px] font-bold tracking-tight leading-none">Rect</span>
        </button>

        <button
          onClick={() => onAddTable('square')}
          className="w-12 py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-[#efe5d6] active:scale-95 transition-all text-[#51463c] cursor-pointer group"
          title="Add Square Table"
        >
          <div className="w-4 h-4 rounded-xs border-2 border-[#766354] group-hover:bg-[#766354]/10 transition-colors" />
          <span className="text-[9px] font-bold tracking-tight leading-none">Square</span>
        </button>

        {/* Divider */}
        <div className="w-7 h-px bg-[#e5d9c8] my-0.5" />

        {/* Venue Items Section */}
        {venueTypes.map(type => (
          <button
            key={type}
            onClick={() => onAddVenueItem(type)}
            className="w-12 py-1.5 px-0.5 rounded-xl flex flex-col items-center justify-center gap-0.5 hover:bg-[#efe5d6] active:scale-95 transition-all text-[#51463c] cursor-pointer"
            title={`Add ${venueItemLabels[type]}`}
          >
            <span className="text-sm leading-none font-bold text-[#766354]">
              {venueItemIcons[type]}
            </span>
            <span className="text-[9px] font-bold tracking-tight truncate max-w-[46px] leading-none text-center">
              {type === 'dancefloor' ? 'Dance' : type === 'cakebar' ? 'Cake' : venueItemLabels[type]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
