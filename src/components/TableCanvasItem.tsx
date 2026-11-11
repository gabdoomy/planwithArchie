import React from 'react';
import { Table, Guest } from '../types/seating';
import { Users, RotateCw } from 'lucide-react';

interface TableCanvasItemProps {
  table: Table;
  guests: Guest[];
  isSelected: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  zoom: number;
  onPointerDown: (e: React.PointerEvent, table: Table) => void;
  onTableClick: (table: Table) => void;
}

export const TableCanvasItem: React.FC<TableCanvasItemProps> = ({
  table,
  guests,
  isSelected,
  isDragging,
  isDropTarget,
  zoom,
  onPointerDown,
  onTableClick
}) => {
  const tableGuests = guests.filter(g => g.tableId === table.id);
  const seatedCount = tableGuests.length;
  const isFull = seatedCount >= table.capacity;

  // Geometry dimensions based on shape and capacity
  let width = 120;
  let height = 120;
  let borderRadius = '50%';

  if (table.shape === 'round') {
    // Dynamic diameter based on capacity
    const diameter = Math.max(110, 80 + table.capacity * 6);
    width = diameter;
    height = diameter;
    borderRadius = '50%';
  } else if (table.shape === 'square') {
    const size = Math.max(100, 80 + (table.capacity / 4) * 20);
    width = size;
    height = size;
    borderRadius = '16px';
  } else if (table.shape === 'rectangle') {
    const sideSeats = Math.ceil(table.capacity / 2);
    width = Math.max(140, sideSeats * 36 + 40);
    height = 90;
    borderRadius = '16px';
  }

  // Calculate seat indicator positions around the table
  const seats: { x: number; y: number; seatNum: number; guest?: Guest }[] = [];
  const chairOffset = 22; // distance from edge

  if (table.shape === 'round') {
    const radius = width / 2;
    for (let i = 0; i < table.capacity; i++) {
      const angle = (i * 2 * Math.PI) / table.capacity - Math.PI / 2;
      const sx = radius + Math.cos(angle) * (radius + chairOffset);
      const sy = radius + Math.sin(angle) * (radius + chairOffset);
      const seatNum = i + 1;
      const guest = tableGuests.find(g => g.seatNumber === seatNum) || tableGuests[i];
      seats.push({ x: sx, y: sy, seatNum, guest });
    }
  } else if (table.shape === 'rectangle') {
    const sideSeats = Math.ceil(table.capacity / 2);
    // Top side seats
    for (let i = 0; i < sideSeats; i++) {
      const sx = 30 + ((width - 60) * (i + 0.5)) / sideSeats;
      const sy = -chairOffset;
      const seatNum = i + 1;
      const guest = tableGuests.find(g => g.seatNumber === seatNum) || tableGuests[i];
      seats.push({ x: sx, y: sy, seatNum, guest });
    }
    // Bottom side seats
    for (let i = 0; i < sideSeats; i++) {
      const sx = 30 + ((width - 60) * (i + 0.5)) / sideSeats;
      const sy = height + chairOffset;
      const seatNum = sideSeats + i + 1;
      const guest = tableGuests.find(g => g.seatNumber === seatNum) || tableGuests[sideSeats + i];
      seats.push({ x: sx, y: sy, seatNum, guest });
    }
  } else {
    // Square: 4 sides
    const seatsPerSide = Math.max(1, Math.round(table.capacity / 4));
    let seatIndex = 1;
    // Top
    for (let i = 0; i < seatsPerSide; i++) {
      const sx = ((width) * (i + 0.5)) / seatsPerSide;
      const sy = -chairOffset;
      const guest = tableGuests.find(g => g.seatNumber === seatIndex) || tableGuests[seatIndex - 1];
      seats.push({ x: sx, y: sy, seatNum: seatIndex++, guest });
    }
    // Right
    for (let i = 0; i < seatsPerSide; i++) {
      const sx = width + chairOffset;
      const sy = ((height) * (i + 0.5)) / seatsPerSide;
      const guest = tableGuests.find(g => g.seatNumber === seatIndex) || tableGuests[seatIndex - 1];
      seats.push({ x: sx, y: sy, seatNum: seatIndex++, guest });
    }
    // Bottom
    for (let i = 0; i < seatsPerSide; i++) {
      const sx = ((width) * (i + 0.5)) / seatsPerSide;
      const sy = height + chairOffset;
      const guest = tableGuests.find(g => g.seatNumber === seatIndex) || tableGuests[seatIndex - 1];
      seats.push({ x: sx, y: sy, seatNum: seatIndex++, guest });
    }
    // Left
    for (let i = 0; i < seatsPerSide; i++) {
      const sx = -chairOffset;
      const sy = ((height) * (i + 0.5)) / seatsPerSide;
      const guest = tableGuests.find(g => g.seatNumber === seatIndex) || tableGuests[seatIndex - 1];
      seats.push({ x: sx, y: sy, seatNum: seatIndex++, guest });
    }
  }

  // Dietary warning count at table
  const dietaryCount = tableGuests.filter(g => g.dietary && g.dietary !== 'none').length;
  const vipCount = tableGuests.filter(g => g.isVip).length;

  return (
    <div
      style={{
        transform: `translate(${table.x}px, ${table.y}px) rotate(${table.rotation || 0}deg)`,
        position: 'absolute',
        top: 0,
        left: 0,
        touchAction: 'none'
      }}
      className={`group select-none transition-shadow ${
        isDragging ? 'cursor-grabbing z-50' : 'cursor-grab z-20'
      }`}
      onPointerDown={(e) => onPointerDown(e, table)}
      onClick={(e) => {
        e.stopPropagation();
        onTableClick(table);
      }}
    >
      {/* Walking Clearance Aisle Halo when selected or dragging (36-inch service standard) */}
      {(isSelected || isDragging) && (
        <div
          style={{
            position: 'absolute',
            top: -42,
            left: -42,
            width: width + 84,
            height: height + 84,
            borderRadius: table.shape === 'round' ? '50%' : '24px',
            pointerEvents: 'none'
          }}
          className="border border-dashed border-amber-400/50 bg-amber-500/5 transition-all"
        >
          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full whitespace-nowrap shadow-xs">
            3ft Service Aisle Clearance
          </span>
        </div>
      )}

      {/* Drop Target Indicator */}
      {isDropTarget && (
        <div
          style={{
            position: 'absolute',
            top: -12,
            left: -12,
            width: width + 24,
            height: height + 24,
            borderRadius: table.shape === 'round' ? '50%' : '20px',
            pointerEvents: 'none'
          }}
          className="ring-4 ring-emerald-500/80 bg-emerald-500/10 animate-pulse"
        />
      )}

      {/* Chairs around table */}
      {seats.map((seat) => {
        const isOccupied = !!seat.guest;
        const initials = seat.guest
          ? seat.guest.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)
          : `${seat.seatNum}`;

        return (
          <div
            key={seat.seatNum}
            style={{
              position: 'absolute',
              left: seat.x - 12,
              top: seat.y - 12,
              width: 24,
              height: 24,
              borderRadius: '50%'
            }}
            title={seat.guest ? `${seat.guest.name} (${seat.guest.dietary})` : `Seat ${seat.seatNum} (Empty)`}
            className={`flex items-center justify-center text-[9px] font-semibold transition-transform duration-150 ${
              isOccupied
                ? seat.guest?.isVip
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs ring-1 ring-amber-400'
                  : 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-400 border border-neutral-300'
            }`}
          >
            {initials}
          </div>
        );
      })}

      {/* Main Table Body */}
      <div
        style={{
          width,
          height,
          borderRadius,
          backgroundColor: '#ffffff'
        }}
        className={`relative flex flex-col items-center justify-center border-2 transition-all duration-150 ${
          isSelected
            ? 'border-neutral-900 shadow-xl ring-2 ring-neutral-900/10'
            : isDropTarget
            ? 'border-emerald-600 shadow-lg'
            : 'border-neutral-300 hover:border-neutral-400 shadow-sm'
        }`}
      >
        {/* Table Name */}
        <div className="px-2 text-center max-w-[90%]">
          <p className="text-xs font-bold text-neutral-900 tracking-tight leading-tight truncate">
            {table.name}
          </p>
          <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-neutral-500 font-medium">
            <Users className="w-2.5 h-2.5 text-neutral-400" />
            <span className={isFull ? 'text-amber-700 font-semibold' : 'text-neutral-600'}>
              {seatedCount}/{table.capacity}
            </span>
          </div>
        </div>

        {/* Status badges below name (Dietary & VIP indicators) */}
        {(dietaryCount > 0 || vipCount > 0) && (
          <div className="absolute -bottom-2 flex items-center gap-1">
            {vipCount > 0 && (
              <span className="bg-amber-100 border border-amber-300 text-amber-800 text-[8px] font-bold px-1.5 py-0.2 rounded-full shadow-2xs">
                VIP
              </span>
            )}
            {dietaryCount > 0 && (
              <span className="bg-rose-50 border border-rose-200 text-rose-700 text-[8px] font-bold px-1.5 py-0.2 rounded-full shadow-2xs">
                {dietaryCount} diet
              </span>
            )}
          </div>
        )}

        {/* Small Shape indicator icon in top right on hover/selected */}
        {isSelected && (
          <div className="absolute -top-2.5 -right-2.5 bg-neutral-900 text-white p-1 rounded-full shadow-sm">
            <RotateCw className="w-2.5 h-2.5" />
          </div>
        )}
      </div>
    </div>
  );
};
