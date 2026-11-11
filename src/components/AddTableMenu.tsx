import React, { useState } from 'react';
import { TableShape, FixtureType } from '../types/seating';
import { Plus, Users, Grid, Disc3, Sparkles, SlidersHorizontal, ChevronUp, ChevronDown } from 'lucide-react';

interface AddTableMenuProps {
  onAddTable: (shape: TableShape, capacity: number) => void;
  onAddFixture: (type: FixtureType, label: string) => void;
  onOpenGuestDrawer: () => void;
  unassignedGuestsCount: number;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
}

export const AddTableMenu: React.FC<AddTableMenuProps> = ({
  onAddTable,
  onAddFixture,
  onOpenGuestDrawer,
  unassignedGuestsCount,
  snapToGrid,
  onToggleSnap,
  showGrid,
  onToggleGrid
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showFixturesMenu, setShowFixturesMenu] = useState(false);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center gap-2 max-w-full px-4">
      {/* Popover for Table Shapes & Capacities */}
      {showAddMenu && (
        <div className="p-3 bg-white/95 backdrop-blur-xl border border-neutral-200/80 rounded-2xl shadow-2xl flex items-center gap-2 mb-1 animate-in zoom-in-95 duration-150">
          <div className="flex items-center gap-1.5">
            {/* Round Table Option */}
            <button
              onClick={() => {
                onAddTable('round', 8);
                setShowAddMenu(false);
              }}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-neutral-100 transition-colors group min-w-[72px]"
            >
              <div className="w-8 h-8 rounded-full border-2 border-neutral-800 bg-white group-hover:scale-105 transition-transform flex items-center justify-center text-[10px] font-bold text-neutral-800">
                8
              </div>
              <span className="text-[11px] font-semibold text-neutral-700">Round</span>
            </button>

            {/* Rectangle Table Option */}
            <button
              onClick={() => {
                onAddTable('rectangle', 8);
                setShowAddMenu(false);
              }}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-neutral-100 transition-colors group min-w-[72px]"
            >
              <div className="w-10 h-6 rounded-md border-2 border-neutral-800 bg-white group-hover:scale-105 transition-transform flex items-center justify-center text-[10px] font-bold text-neutral-800">
                8
              </div>
              <span className="text-[11px] font-semibold text-neutral-700">Rectangle</span>
            </button>

            {/* Square Table Option */}
            <button
              onClick={() => {
                onAddTable('square', 4);
                setShowAddMenu(false);
              }}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-neutral-100 transition-colors group min-w-[72px]"
            >
              <div className="w-7 h-7 rounded-md border-2 border-neutral-800 bg-white group-hover:scale-105 transition-transform flex items-center justify-center text-[10px] font-bold text-neutral-800">
                4
              </div>
              <span className="text-[11px] font-semibold text-neutral-700">Square</span>
            </button>
          </div>

          <div className="h-10 w-px bg-neutral-200 mx-1" />

          {/* Quick venue fixtures toggle */}
          <button
            onClick={() => {
              setShowFixturesMenu(!showFixturesMenu);
            }}
            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl hover:bg-neutral-100 transition-colors min-w-[72px]"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-neutral-700">Fixtures</span>
          </button>
        </div>
      )}

      {/* Popover for Venue Fixtures */}
      {showFixturesMenu && (
        <div className="p-2.5 bg-white/95 backdrop-blur-xl border border-neutral-200/80 rounded-2xl shadow-2xl flex items-center gap-1.5 mb-1 animate-in zoom-in-95 duration-150 flex-wrap max-w-sm justify-center">
          <button
            onClick={() => {
              onAddFixture('dance_floor', 'Dance Floor');
              setShowFixturesMenu(false);
              setShowAddMenu(false);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
          >
            Dance Floor
          </button>
          <button
            onClick={() => {
              onAddFixture('bar', 'Cocktail Bar');
              setShowFixturesMenu(false);
              setShowAddMenu(false);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
          >
            Bar
          </button>
          <button
            onClick={() => {
              onAddFixture('stage_dj', 'Stage / DJ');
              setShowFixturesMenu(false);
              setShowAddMenu(false);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
          >
            Stage / DJ
          </button>
          <button
            onClick={() => {
              onAddFixture('entrance', 'Main Entrance');
              setShowFixturesMenu(false);
              setShowAddMenu(false);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
          >
            Entrance
          </button>
          <button
            onClick={() => {
              onAddFixture('cake_table', 'Cake Table');
              setShowFixturesMenu(false);
              setShowAddMenu(false);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
          >
            Cake Table
          </button>
        </div>
      )}

      {/* Main Bottom Floating Dock */}
      <div className="flex items-center gap-2 p-1.5 bg-neutral-900/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl border border-neutral-800">
        {/* Add Table Button */}
        <button
          onClick={() => {
            setShowAddMenu(!showAddMenu);
            setShowFixturesMenu(false);
          }}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
            showAddMenu
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'bg-white/10 hover:bg-white/20 text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Add Table</span>
          {showAddMenu ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>

        <div className="h-6 w-px bg-white/20 mx-0.5" />

        {/* Guest Roster Button */}
        <button
          onClick={onOpenGuestDrawer}
          className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-semibold text-xs bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <Users className="w-4 h-4" />
          <span>Guests</span>
          {unassignedGuestsCount > 0 && (
            <span className="bg-amber-400 text-neutral-950 font-bold text-[10px] px-1.5 py-0.2 rounded-full tabular-nums shadow-xs">
              {unassignedGuestsCount}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-white/20 mx-0.5" />

        {/* Snap to Grid Button */}
        <button
          onClick={onToggleSnap}
          title={snapToGrid ? 'Snap to 20px grid: ON' : 'Snap to grid: OFF'}
          className={`p-2.5 rounded-xl text-xs transition-colors ${
            snapToGrid ? 'bg-amber-400 text-neutral-950 font-bold' : 'text-neutral-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        {/* Grid Background Button */}
        <button
          onClick={onToggleGrid}
          title={showGrid ? 'Blueprint grid: ON' : 'Blueprint grid: OFF'}
          className={`p-2.5 rounded-xl text-xs transition-colors ${
            showGrid ? 'text-white bg-white/20' : 'text-neutral-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <span className="text-[10px] font-bold">GRID</span>
        </button>
      </div>
    </div>
  );
};
