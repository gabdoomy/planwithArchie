import React from 'react';
import type { TableItem } from '../types/seating';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface VenueItemEditorProps {
  item: TableItem | null;
  onClose: () => void;
  onUpdate: (updates: Partial<TableItem>) => void;
  onDelete: () => void;
}

export default function VenueItemEditor({
  item,
  onClose,
  onUpdate,
  onDelete
}: VenueItemEditorProps) {
  if (!item) return null;

  const currentLengthScale = item.lengthScale ?? 1;
  const currentWidthScale = item.widthScale ?? 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-sm bg-[#fbf7ef] rounded-3xl shadow-2xl border border-[#e5d9c8] p-6 space-y-6 animate-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-[#51463c]">{item.name}</h2>
            <p className="text-xs text-[#84796d] mt-0.5">Resize or remove this venue area</p>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-bold text-[#fffaf2] bg-[#766354] hover:bg-[#685648] active:scale-95 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Done
          </button>
        </div>

        {/* Steppers */}
        <div className="space-y-3 bg-[#fcf9f2] p-4 rounded-2xl border border-[#e5d9c8]">
          {/* Length */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#51463c]">Length</span>
            <div className="flex items-center gap-3 bg-[#efe5d6] px-2 py-1 rounded-xl">
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    lengthScale: Math.max(0.5, Math.round((currentLengthScale - 0.1) * 10) / 10)
                  })
                }
                disabled={currentLengthScale <= 0.5}
                className="w-6 h-6 flex items-center justify-center font-bold text-[#51463c] disabled:opacity-30 hover:bg-[#e4d7c6] rounded-lg cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-[#51463c] w-10 text-center tabular-nums">
                {Math.round(currentLengthScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    lengthScale: Math.min(3, Math.round((currentLengthScale + 0.1) * 10) / 10)
                  })
                }
                disabled={currentLengthScale >= 3}
                className="w-6 h-6 flex items-center justify-center font-bold text-[#51463c] disabled:opacity-30 hover:bg-[#e4d7c6] rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Width */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#51463c]">Width</span>
            <div className="flex items-center gap-3 bg-[#efe5d6] px-2 py-1 rounded-xl">
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    widthScale: Math.max(0.5, Math.round((currentWidthScale - 0.1) * 10) / 10)
                  })
                }
                disabled={currentWidthScale <= 0.5}
                className="w-6 h-6 flex items-center justify-center font-bold text-[#51463c] disabled:opacity-30 hover:bg-[#e4d7c6] rounded-lg cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-[#51463c] w-10 text-center tabular-nums">
                {Math.round(currentWidthScale * 100)}%
              </span>
              <button
                type="button"
                onClick={() =>
                  onUpdate({
                    widthScale: Math.min(3, Math.round((currentWidthScale + 0.1) * 10) / 10)
                  })
                }
                disabled={currentWidthScale >= 3}
                className="w-6 h-6 flex items-center justify-center font-bold text-[#51463c] disabled:opacity-30 hover:bg-[#e4d7c6] rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={onDelete}
          className="w-full py-2.5 px-4 text-xs font-bold text-[#a35f59] border border-[#f0d8d4] hover:bg-[#fcf1ef] active:scale-98 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete {item.name}</span>
        </button>
      </div>
    </div>
  );
}
