import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { Guest, TableItem } from '../types/seating';
import { venueItemColors, venueItemDimensions, venueItemIcons } from '../venueItems';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface FloorPlanCanvasProps {
  tables: TableItem[];
  selectedId: string | null;
  onDragEnd: (id: string, x: number, y: number) => void;
  onSelect: (table: TableItem) => void;
}

export default function FloorPlanCanvas({
  tables,
  selectedId,
  onDragEnd,
  onSelect
}: FloorPlanCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Viewport transformation: pan and zoom
  const [pan, setPan] = useState({ x: 80, y: 60 });
  const [zoom, setZoom] = useState(1);

  // Canvas background panning state
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Handle Canvas background drag (pan)
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    // Only start pan if clicking directly on the canvas background, not on a table
    if ((e.target as HTMLElement).closest('.table-node-item')) return;

    isPanningRef.current = true;
    panStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!isPanningRef.current) return;
    const dx = e.clientX - panStartRef.current.x;
    const dy = e.clientY - panStartRef.current.y;
    setPan({
      x: panStartRef.current.panX + dx,
      y: panStartRef.current.panY + dy
    });
  };

  const handleCanvasPointerUp = (e: React.PointerEvent) => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      try {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom(prev => Math.min(2.5, Math.max(0.4, prev * zoomFactor)));
  };

  // Reset zoom & pan to show content
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 80, y: 60 });
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      onWheel={handleWheel}
      className="relative w-full h-full overflow-hidden select-none bg-[#f4edde] cursor-grab active:cursor-grabbing touch-none"
      style={{
        backgroundImage: `radial-gradient(circle, #e5d8c3 1.2px, transparent 1.2px)`,
        backgroundSize: '24px 24px',
        backgroundPosition: `${pan.x}px ${pan.y}px`
      }}
    >
      {/* Transformed Stage */}
      <div
        className="absolute top-0 left-0 origin-top-left will-change-transform"
        style={{
          transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`
        }}
      >
        {tables.map(table => (
          <TableCanvasNode
            key={table.id}
            table={table}
            isSelected={table.id === selectedId}
            zoom={zoom}
            onDragEnd={(x, y) => onDragEnd(table.id, x, y)}
            onSelect={() => onSelect(table)}
          />
        ))}
      </div>

      {/* Canvas HUD Controls (Zoom In/Out, Reset) */}
      <div className="absolute bottom-24 right-5 z-20 flex flex-col items-center gap-1.5 bg-[#fcf9f2] p-1.5 rounded-2xl shadow-lg border border-[#e5d9c8]/90">
        <button
          onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
          title="Zoom In"
          className="w-8 h-8 flex items-center justify-center rounded-xl text-[#51463c] hover:bg-[#efe5d6] active:scale-95 transition-all cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-[10px] font-bold text-[#84796d] px-1 select-none tabular-nums">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
          title="Zoom Out"
          className="w-8 h-8 flex items-center justify-center rounded-xl text-[#51463c] hover:bg-[#efe5d6] active:scale-95 transition-all cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-5 h-px bg-[#e5d9c8] my-0.5" />
        <button
          onClick={handleResetView}
          title="Reset View"
          className="w-8 h-8 flex items-center justify-center rounded-xl text-[#51463c] hover:bg-[#efe5d6] active:scale-95 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Canvas Legend */}
      <div className="absolute top-4 left-5 z-10 hidden sm:flex items-center gap-4 bg-[#fcf9f2]/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#e5d9c8]/80 text-[11px] font-medium text-[#766354] shadow-2xs pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#fcf9f2] border border-[#d8cbb8] flex items-center justify-center text-[8px] text-[#84796d]">1</span>
          <span>Open seat</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#766354] flex items-center justify-center text-[7px] text-[#fffaf2] font-bold">SL</span>
          <span>Guest</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#eee1c9] border border-[#ad9166] flex items-center justify-center text-[7px] text-[#705b3d] font-bold">VIP</span>
          <span>VIP</span>
        </div>
      </div>
    </div>
  );
}

interface TableCanvasNodeProps {
  table: TableItem;
  isSelected: boolean;
  zoom: number;
  onDragEnd: (x: number, y: number) => void;
  onSelect: () => void;
}

function TableCanvasNode({
  table,
  isSelected,
  zoom,
  onDragEnd,
  onSelect
}: TableCanvasNodeProps) {
  const [pos, setPos] = useState({ x: table.x, y: table.y });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, initialX: table.x, initialY: table.y });
  const hasMovedRef = useRef(false);

  useEffect(() => {
    setPos({ x: table.x, y: table.y });
  }, [table.x, table.y]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = {
      pointerX: e.clientX,
      pointerY: e.clientY,
      initialX: pos.x,
      initialY: pos.y
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = (e.clientX - dragStartRef.current.pointerX) / zoom;
    const dy = (e.clientY - dragStartRef.current.pointerY) / zoom;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedRef.current = true;
    }

    setPos({
      x: dragStartRef.current.initialX + dx,
      y: dragStartRef.current.initialY + dy
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (!hasMovedRef.current) {
      onSelect();
    } else {
      onDragEnd(Math.round(pos.x), Math.round(pos.y));
    }
  };

  const scale = table.scale ?? 1;

  // Venue item rendering
  if (table.venueType) {
    const dims = venueItemDimensions[table.venueType];
    const width = dims.width * scale * (table.lengthScale ?? 1);
    const height = dims.height * scale * (table.widthScale ?? 1);
    const color = venueItemColors[table.venueType];
    const isDanceFloor = table.venueType === 'dancefloor';

    return (
      <div
        className="table-node-item absolute select-none cursor-move group"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: `${width}px`,
          height: `${height}px`,
          transform: `rotate(${table.rotation ?? 0}deg)`,
          transformOrigin: 'center center'
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div
          className={`w-full h-full rounded-xl flex flex-col items-center justify-center transition-shadow shadow-xs ${
            isSelected ? 'ring-3 ring-[#766354] ring-offset-2 ring-offset-[#f4edde]' : 'hover:shadow-md'
          }`}
          style={{
            backgroundColor: `${color}25`,
            borderColor: color,
            borderWidth: '2px',
            borderStyle: isDanceFloor ? 'dashed' : 'solid'
          }}
        >
          <span className="text-sm font-bold select-none" style={{ color }}>
            {venueItemIcons[table.venueType]}
          </span>
          <span className="text-xs font-bold text-[#51463c] text-center px-1 truncate max-w-full select-none leading-tight mt-0.5">
            {table.name}
          </span>
          <span className="text-[9px] font-medium text-[#817260]">
            Venue area
          </span>
        </div>
      </div>
    );
  }

  // Regular Table rendering
  let tableWidth = 100 * scale;
  let tableHeight = 100 * scale;
  let borderRadiusClass = 'rounded-full';

  if (table.shape === 'round') {
    tableWidth = 100 * scale;
    tableHeight = 100 * scale;
    borderRadiusClass = 'rounded-full';
  } else if (table.shape === 'rectangle') {
    tableWidth = 136 * scale * (table.lengthScale ?? 1);
    tableHeight = 80 * scale * (table.widthScale ?? 1);
    borderRadiusClass = 'rounded-2xl';
  } else {
    tableWidth = 92 * scale;
    tableHeight = 92 * scale;
    borderRadiusClass = 'rounded-2xl';
  }

  // Chairs layout calculation
  const chairs: { x: number; y: number; seatNum: number; guest?: Guest }[] = [];
  const chairSize = 24;

  if (table.shape === 'round') {
    const radius = tableWidth / 2;
    const chairDistance = radius + 15;
    for (let i = 0; i < table.capacity; i++) {
      const angle = (i * 2 * Math.PI) / table.capacity - Math.PI / 2;
      chairs.push({
        x: radius + Math.cos(angle) * chairDistance - chairSize / 2,
        y: radius + Math.sin(angle) * chairDistance - chairSize / 2,
        seatNum: i + 1,
        guest: table.guests[i]
      });
    }
  } else if (table.shape === 'rectangle') {
    const topSeats = Math.ceil(table.capacity / 2);
    const bottomSeats = Math.floor(table.capacity / 2);
    for (let i = 0; i < topSeats; i++) {
      chairs.push({
        x: 20 + ((tableWidth - 40) * (i + 0.5)) / topSeats - chairSize / 2,
        y: -chairSize / 2 - 3,
        seatNum: i + 1,
        guest: table.guests[i]
      });
    }
    for (let i = 0; i < bottomSeats; i++) {
      chairs.push({
        x: 20 + ((tableWidth - 40) * (i + 0.5)) / bottomSeats - chairSize / 2,
        y: tableHeight - chairSize / 2 + 3,
        seatNum: topSeats + i + 1,
        guest: table.guests[topSeats + i]
      });
    }
  } else {
    const perimeter = 2 * (tableWidth + tableHeight);
    for (let i = 0; i < table.capacity; i++) {
      const position = ((i + 0.5) * perimeter) / table.capacity;
      let x: number;
      let y: number;
      if (position < tableWidth) {
        x = position;
        y = -chairSize / 2 - 3;
      } else if (position < tableWidth + tableHeight) {
        x = tableWidth + chairSize / 2 + 3;
        y = position - tableWidth;
      } else if (position < 2 * tableWidth + tableHeight) {
        x = tableWidth - (position - tableWidth - tableHeight);
        y = tableHeight + chairSize / 2 + 3;
      } else {
        x = -chairSize / 2 - 3;
        y = tableHeight - (position - 2 * tableWidth - tableHeight);
      }
      chairs.push({
        x: x - chairSize / 2,
        y: y - chairSize / 2,
        seatNum: i + 1,
        guest: table.guests[i]
      });
    }
  }

  return (
    <div
      className="table-node-item absolute select-none cursor-move group"
      style={{
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: `${tableWidth}px`,
        height: `${tableHeight}px`,
        transform: `rotate(${table.rotation ?? 0}deg)`,
        transformOrigin: 'center center'
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Chairs */}
      {chairs.map(seat => {
        const guest = seat.guest;
        const isVip = guest?.isVip;

        let chairBg = 'bg-[#fcf9f2]';
        let chairBorder = 'border-[#d8cbb8]';
        let chairText = 'text-[#84796d]';

        if (guest) {
          if (isVip) {
            chairBg = 'bg-[#eee1c9]';
            chairBorder = 'border-[#ad9166]';
            chairText = 'text-[#705b3d] font-bold';
          } else {
            chairBg = 'bg-[#766354]';
            chairBorder = 'border-[#766354]';
            chairText = 'text-[#fffaf2] font-semibold';
          }
        }

        const initialLabel = guest ? getInitials(guest.name) : String(seat.seatNum);

        return (
          <div
            key={seat.seatNum}
            title={guest ? `${guest.name}${guest.dietary ? ` (${guest.dietary})` : ''}${isVip ? ' [VIP]' : ''}` : `Seat ${seat.seatNum} (empty)`}
            className={`absolute w-6 h-6 rounded-full border flex items-center justify-center text-[8px] transition-transform select-none shadow-2xs pointer-events-none ${chairBg} ${chairBorder} ${chairText}`}
            style={{
              left: `${seat.x}px`,
              top: `${seat.y}px`,
              transform: `rotate(-${table.rotation ?? 0}deg)` // Counter-rotate text so it stays upright!
            }}
          >
            {initialLabel}
          </div>
        );
      })}

      {/* Main Table Surface */}
      <div
        className={`w-full h-full bg-[#fcf9f2] border-2 border-[#b8a48c] flex flex-col items-center justify-center transition-all shadow-sm ${borderRadiusClass} ${
          isSelected
            ? 'ring-3 ring-[#766354] ring-offset-2 ring-offset-[#f4edde] shadow-md'
            : 'group-hover:border-[#9c8973] group-hover:shadow-md'
        }`}
      >
        <span
          className="text-xs font-bold text-[#51463c] text-center px-1.5 truncate max-w-full leading-tight select-none"
          style={{ transform: `rotate(-${table.rotation ?? 0}deg)` }}
        >
          {table.name}
        </span>
        <span
          className="text-[10px] font-medium text-[#84796d] leading-none mt-0.5 select-none"
          style={{ transform: `rotate(-${table.rotation ?? 0}deg)` }}
        >
          {table.guests.length} / {table.capacity}
        </span>
      </div>
    </div>
  );
}

function getInitials(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
