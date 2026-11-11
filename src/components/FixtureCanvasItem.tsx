import React from 'react';
import { VenueFixture } from '../types/seating';
import { Music, GlassWater, LogIn, Disc3, Cake, Gift, DoorClosed } from 'lucide-react';

interface FixtureCanvasItemProps {
  fixture: VenueFixture;
  isSelected: boolean;
  isDragging: boolean;
  onPointerDown: (e: React.PointerEvent, fixture: VenueFixture) => void;
  onSelect: (fixture: VenueFixture) => void;
}

export const FixtureCanvasItem: React.FC<FixtureCanvasItemProps> = ({
  fixture,
  isSelected,
  isDragging,
  onPointerDown,
  onSelect
}) => {
  const getIcon = () => {
    switch (fixture.type) {
      case 'dance_floor':
        return <Disc3 className="w-5 h-5 text-amber-700/70" />;
      case 'stage_dj':
        return <Music className="w-5 h-5 text-indigo-700/70" />;
      case 'bar':
        return <GlassWater className="w-5 h-5 text-purple-700/70" />;
      case 'entrance':
        return <LogIn className="w-5 h-5 text-emerald-700/70" />;
      case 'cake_table':
        return <Cake className="w-4 h-4 text-pink-700/70" />;
      case 'gift_table':
        return <Gift className="w-4 h-4 text-sky-700/70" />;
      case 'restroom':
        return <DoorClosed className="w-4 h-4 text-neutral-600" />;
      default:
        return null;
    }
  };

  const getStyleClass = () => {
    switch (fixture.type) {
      case 'dance_floor':
        return 'bg-amber-50/60 border-amber-300 text-amber-900';
      case 'stage_dj':
        return 'bg-indigo-50/60 border-indigo-300 text-indigo-900';
      case 'bar':
        return 'bg-purple-50/60 border-purple-300 text-purple-900';
      case 'entrance':
        return 'bg-emerald-50/60 border-emerald-300 text-emerald-900';
      case 'cake_table':
        return 'bg-pink-50/60 border-pink-300 text-pink-900';
      case 'gift_table':
        return 'bg-sky-50/60 border-sky-300 text-sky-900';
      default:
        return 'bg-neutral-100/70 border-neutral-300 text-neutral-800';
    }
  };

  return (
    <div
      style={{
        transform: `translate(${fixture.x}px, ${fixture.y}px) rotate(${fixture.rotation || 0}deg)`,
        width: fixture.width,
        height: fixture.height,
        position: 'absolute',
        top: 0,
        left: 0,
        touchAction: 'none'
      }}
      className={`select-none rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-shadow ${getStyleClass()} ${
        isDragging ? 'cursor-grabbing z-40 opacity-90' : 'cursor-grab z-10'
      } ${isSelected ? 'ring-2 ring-neutral-900 shadow-md' : 'shadow-2xs'}`}
      onPointerDown={(e) => onPointerDown(e, fixture)}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(fixture);
      }}
    >
      {getIcon()}
      <span className="text-[11px] font-bold tracking-tight text-center mt-1 leading-tight">
        {fixture.label}
      </span>
      <span className="text-[9px] opacity-60 tracking-wider uppercase mt-0.5">
        Fixture
      </span>
    </div>
  );
};
