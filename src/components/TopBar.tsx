import React, { useRef } from 'react';
import { Download, Upload, FileText, Smartphone, Check, Sparkles } from 'lucide-react';

interface TopBarProps {
  weddingName: string;
  venueName: string;
  onSaveToLocalStorage: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onExportPDF: () => void;
  onOpenExpoCode: () => void;
  hasSavedRecently: boolean;
  deviceView: 'fullscreen' | 'iphone' | 'ipad';
  onChangeDeviceView: (view: 'fullscreen' | 'iphone' | 'ipad') => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  weddingName,
  venueName,
  onSaveToLocalStorage,
  onExportJson,
  onImportJson,
  onExportPDF,
  onOpenExpoCode,
  hasSavedRecently,
  deviceView,
  onChangeDeviceView
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-neutral-200">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      <div className="flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand Wordmark & Mobile Tag */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
            AP
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-tight text-neutral-900 whitespace-nowrap">
              AislePlan
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-semibold border border-neutral-200">
              Expo SDK 58.0.22
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links & Actions (Single-line whitespace-nowrap) */}
        <nav className="flex items-center gap-4 text-xs font-semibold text-neutral-600">
          <button
            onClick={onSaveToLocalStorage}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:text-neutral-900 ${
              hasSavedRecently ? 'text-emerald-700 font-bold' : ''
            }`}
          >
            {hasSavedRecently ? <Check className="w-3.5 h-3.5" /> : null}
            <span>{hasSavedRecently ? 'Saved' : 'Save JSON'}</span>
          </button>

          <button
            onClick={onExportJson}
            className="flex items-center gap-1.5 hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 hover:text-neutral-900 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Import JSON</span>
          </button>

          <button
            onClick={onOpenExpoCode}
            className="flex items-center gap-1.5 text-indigo-700 hover:text-indigo-900 font-bold transition-colors whitespace-nowrap shrink-0"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Expo Mobile App</span>
          </button>

          {/* Device Frame View Selector */}
          <div className="hidden md:flex items-center gap-1 p-0.5 bg-neutral-100 rounded-lg text-[11px]">
            <button
              onClick={() => onChangeDeviceView('iphone')}
              className={`px-2 py-1 rounded-md transition-all whitespace-nowrap ${
                deviceView === 'iphone'
                  ? 'bg-white text-neutral-900 font-bold shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              iPhone
            </button>
            <button
              onClick={() => onChangeDeviceView('ipad')}
              className={`px-2 py-1 rounded-md transition-all whitespace-nowrap ${
                deviceView === 'ipad'
                  ? 'bg-white text-neutral-900 font-bold shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              iPad
            </button>
            <button
              onClick={() => onChangeDeviceView('fullscreen')}
              className={`px-2 py-1 rounded-md transition-all whitespace-nowrap ${
                deviceView === 'fullscreen'
                  ? 'bg-white text-neutral-900 font-bold shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Canvas
            </button>
          </div>
        </nav>

        {/* Zone 3: 1 Primary CTA */}
        <div className="flex items-center shrink-0">
          <button
            onClick={onExportPDF}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-all shadow-xs whitespace-nowrap shrink-0 active:scale-98"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Venue PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
