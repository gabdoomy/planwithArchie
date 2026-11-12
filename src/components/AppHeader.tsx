import React from 'react';
import { Heart, Save, Settings, Share2, Check } from 'lucide-react';

interface AppHeaderProps {
  title: string;
  onSave: () => void;
  onExport: () => void;
  onSettings: () => void;
  savedRecently?: boolean;
}

export default function AppHeader({
  title,
  onSave,
  onExport,
  onSettings,
  savedRecently
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#fbf7ef] border-b border-[#e5d9c8] select-none shrink-0">
      <div className="flex items-center justify-between gap-6 px-6 py-3.5">
        {/* Zone 1: Branding and Event Title */}
        <div className="flex items-center gap-3 shrink-0 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#eee1c9] flex items-center justify-center shrink-0 shadow-2xs">
            <Heart className="w-3.5 h-3.5 text-[#766354] fill-[#766354]" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-extrabold tracking-tight text-[#51463c] leading-tight truncate">
              {title}
            </h1>
            <p className="text-[11px] font-medium text-[#84796d] italic leading-none mt-0.5">
              Wedding Seating Chart · by ArchieLabs
            </p>
          </div>
        </div>

        {/* Zone 2: Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onSave}
            title="Save layout to local storage"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#51463c] bg-[#efe5d6] hover:bg-[#e7dcce] rounded-xl transition-all shadow-2xs active:scale-97 cursor-pointer"
          >
            {savedRecently ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-emerald-800 font-bold">Saved</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-[#766354]" />
                <span>Save</span>
              </>
            )}
          </button>

          <button
            onClick={onSettings}
            title="Manage Events & Seating Plans"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#51463c] bg-[#efe5d6] hover:bg-[#e7dcce] rounded-xl transition-all shadow-2xs active:scale-97 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-[#766354]" />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            onClick={onExport}
            title="Export Venue PDF Specification"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#fffaf2] bg-[#766354] hover:bg-[#685648] rounded-xl transition-all shadow-2xs active:scale-97 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#fffaf2]" />
            <span>PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
}
