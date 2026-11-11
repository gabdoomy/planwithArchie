import React, { useRef, useState, useCallback, useEffect } from 'react';
import { SeatingPlan, Table, Guest, VenueFixture, TableShape } from '../types/seating';
import { TableCanvasItem } from './TableCanvasItem';
import { FixtureCanvasItem } from './FixtureCanvasItem';
import { ZoomIn, ZoomOut, Maximize2, Grid, Move, Plus } from 'lucide-react';

interface CanvasProps {
  plan: SeatingPlan;
  selectedTableId: string | null;
  selectedFixtureId: string | null;
  draggingGuest: Guest | null;
  snapToGrid: boolean;
  showGrid: boolean;
  onSelectTable: (table: Table | null) => void;
  onSelectFixture: (fixture: VenueFixture | null) => void;
  onUpdateTablePosition: (tableId: string, x: number, y: number) => void;
  onUpdateFixturePosition: (fixtureId: string, x: number, y: number) => void;
  onAssignGuestToTable: (guestId: string, tableId: string) => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  plan,
  selectedTableId,
  selectedFixtureId,
  draggingGuest,
  snapToGrid,
  showGrid,
  onSelectTable,
  onSelectFixture,
  onUpdateTablePosition,
  onUpdateFixturePosition,
  onAssignGuestToTable
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number; startPanX: number; startPanY: number } | null>(null);

  // Table drag state
  const [draggedTableId, setDraggedTableId] = useState<string | null>(null);
  const tableDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    initialTableX: number;
    initialTableY: number;
    tableId: string;
  } | null>(null);

  // Fixture drag state
  const [draggedFixtureId, setDraggedFixtureId] = useState<string | null>(null);
  const fixtureDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    initialFixtureX: number;
    initialFixtureY: number;
    fixtureId: string;
  } | null>(null);

  // Hovered table when dragging guest
  const [hoveredTableForGuest, setHoveredTableForGuest] = useState<string | null>(null);

  // Grid snap helper
  const snapValue = (val: number) => {
    if (!snapToGrid) return Math.round(val);
    const gridSize = 20;
    return Math.round(val / gridSize) * gridSize;
  };

  // Center canvas on mount
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const initialZoom = Math.min(
        (clientWidth - 60) / plan.canvasWidth,
        (clientHeight - 60) / plan.canvasHeight,
        0.95
      );
      setZoom(Math.max(0.65, initialZoom));
      setPan({
        x: Math.max(20, (clientWidth - plan.canvasWidth * initialZoom) / 2),
        y: Math.max(20, (clientHeight - plan.canvasHeight * initialZoom) / 2)
      });
    }
  }, [plan.canvasWidth, plan.canvasHeight]);

  // Handle canvas background drag (pan)
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    // Only pan if clicking direct canvas background
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('canvas-background')) {
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      onSelectTable(null);
      onSelectFixture(null);
    }
  };

  // Handle table pointer down (start drag)
  const handleTablePointerDown = (e: React.PointerEvent, table: Table) => {
    e.stopPropagation();
    onSelectTable(table);
    onSelectFixture(null);
    setDraggedTableId(table.id);

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    tableDragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      initialTableX: table.x,
      initialTableY: table.y,
      tableId: table.id
    };
  };

  // Handle fixture pointer down
  const handleFixturePointerDown = (e: React.PointerEvent, fixture: VenueFixture) => {
    e.stopPropagation();
    onSelectFixture(fixture);
    onSelectTable(null);
    setDraggedFixtureId(fixture.id);

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);

    fixtureDragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      initialFixtureX: fixture.x,
      initialFixtureY: fixture.y,
      fixtureId: fixture.id
    };
  };

  // Global pointer move
  const handlePointerMove = (e: React.PointerEvent) => {
    // Canvas Pan
    if (isPanning && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan({
        x: panStartRef.current.startPanX + dx,
        y: panStartRef.current.startPanY + dy
      });
      return;
    }

    // Table Drag
    if (tableDragRef.current && draggedTableId) {
      const dx = (e.clientX - tableDragRef.current.startX) / zoom;
      const dy = (e.clientY - tableDragRef.current.startY) / zoom;

      let newX = snapValue(tableDragRef.current.initialTableX + dx);
      let newY = snapValue(tableDragRef.current.initialTableY + dy);

      // Clamp within floor boundaries
      newX = Math.max(60, Math.min(plan.canvasWidth - 140, newX));
      newY = Math.max(60, Math.min(plan.canvasHeight - 140, newY));

      onUpdateTablePosition(draggedTableId, newX, newY);
      return;
    }

    // Fixture Drag
    if (fixtureDragRef.current && draggedFixtureId) {
      const dx = (e.clientX - fixtureDragRef.current.startX) / zoom;
      const dy = (e.clientY - fixtureDragRef.current.startY) / zoom;

      let newX = snapValue(fixtureDragRef.current.initialFixtureX + dx);
      let newY = snapValue(fixtureDragRef.current.initialFixtureY + dy);

      newX = Math.max(20, Math.min(plan.canvasWidth - 120, newX));
      newY = Math.max(20, Math.min(plan.canvasHeight - 120, newY));

      onUpdateFixturePosition(draggedFixtureId, newX, newY);
      return;
    }

    // Check hover for guest drag drop
    if (draggingGuest) {
      const canvasRect = containerRef.current?.getBoundingClientRect();
      if (canvasRect) {
        const mouseCanvasX = (e.clientX - canvasRect.left - pan.x) / zoom;
        const mouseCanvasY = (e.clientY - canvasRect.top - pan.y) / zoom;

        // Check which table pointer is over
        const found = plan.tables.find(t => {
          const dist = Math.hypot(t.x - mouseCanvasX, t.y - mouseCanvasY);
          return dist < 85;
        });

        setHoveredTableForGuest(found ? found.id : null);
      }
    }
  };

  // Global pointer up
  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
    }
    if (draggedTableId) {
      setDraggedTableId(null);
      tableDragRef.current = null;
    }
    if (draggedFixtureId) {
      setDraggedFixtureId(null);
      fixtureDragRef.current = null;
    }

    // If dragging guest and dropped over a table
    if (draggingGuest && hoveredTableForGuest) {
      onAssignGuestToTable(draggingGuest.id, hoveredTableForGuest);
      setHoveredTableForGuest(null);
    }
  };

  // Wheel zoom / trackpad pinch
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
      setZoom(prev => Math.min(1.8, Math.max(0.4, prev * zoomFactor)));
    } else {
      // Pan with 2 finger scroll
      setPan(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-neutral-100 select-none touch-none"
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      {/* Zoom and Canvas Controls Float Bar */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-md rounded-xl border border-neutral-200 shadow-sm">
        <button
          onClick={() => setZoom(z => Math.max(0.4, +(z - 0.1).toFixed(2)))}
          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          onClick={() => setZoom(1.0)}
          className="px-2 py-1 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors tabular-nums"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          onClick={() => setZoom(z => Math.min(1.8, +(z + 0.1).toFixed(2)))}
          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-neutral-200 mx-0.5" />

        <button
          onClick={() => {
            if (containerRef.current) {
              const { clientWidth, clientHeight } = containerRef.current;
              const fit = Math.min((clientWidth - 80) / plan.canvasWidth, (clientHeight - 80) / plan.canvasHeight);
              setZoom(fit);
              setPan({
                x: (clientWidth - plan.canvasWidth * fit) / 2,
                y: (clientHeight - plan.canvasHeight * fit) / 2
              });
            }
          }}
          className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          title="Fit Canvas to Viewport"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Guest Drag Float Prompt */}
      {draggingGuest && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-neutral-900 text-white text-xs font-medium px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
          <span>Drop guest on any table to seat</span>
        </div>
      )}

      {/* Scaled & Translated Floor Plan World */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: plan.canvasWidth,
          height: plan.canvasHeight
        }}
        className={`relative rounded-2xl bg-white border-2 border-neutral-300 shadow-xl transition-transform duration-75 ${
          showGrid ? 'blueprint-grid' : ''
        }`}
      >
        {/* Venue Perimeter Dimension Markers */}
        <div className="absolute -top-7 left-0 right-0 flex items-center justify-between text-[11px] font-medium text-neutral-400">
          <span>Main Ballroom Hall (60ft × 40ft)</span>
          <span>North Wall (Windows)</span>
        </div>

        {/* Fixtures (Dance Floor, Bar, DJ Stage, Entrance) */}
        {plan.fixtures.map((fixture) => (
          <FixtureCanvasItem
            key={fixture.id}
            fixture={fixture}
            isSelected={selectedFixtureId === fixture.id}
            isDragging={draggedFixtureId === fixture.id}
            onPointerDown={handleFixturePointerDown}
            onSelect={onSelectFixture}
          />
        ))}

        {/* Tables */}
        {plan.tables.map((table) => (
          <TableCanvasItem
            key={table.id}
            table={table}
            guests={plan.guests}
            isSelected={selectedTableId === table.id}
            isDragging={draggedTableId === table.id}
            isDropTarget={hoveredTableForGuest === table.id}
            zoom={zoom}
            onPointerDown={handleTablePointerDown}
            onTableClick={onSelectTable}
          />
        ))}
      </div>
    </div>
  );
};
