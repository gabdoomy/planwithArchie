export type TableShape = 'round' | 'square' | 'rectangle';

export type RSVPStatus = 'confirmed' | 'pending' | 'declined';

export type DietaryRequirement = 
  | 'none'
  | 'vegetarian'
  | 'vegan'
  | 'gluten_free'
  | 'nut_allergy'
  | 'halal'
  | 'kosher'
  | 'kid';

export type FixtureType = 
  | 'dance_floor'
  | 'stage_dj'
  | 'bar'
  | 'entrance'
  | 'cake_table'
  | 'gift_table'
  | 'restroom';

export interface Guest {
  id: string;
  name: string;
  rsvp: RSVPStatus;
  dietary: DietaryRequirement;
  tableId: string | null;
  seatNumber: number | null; // 1-indexed seat position around the table
  group: string; // e.g. "Bridal Party", "Family", "Friends", "Colleagues"
  isVip?: boolean;
  notes?: string;
  plusOne?: string;
}

export interface Table {
  id: string;
  name: string;
  shape: TableShape;
  capacity: number;
  x: number;
  y: number;
  rotation: number; // in degrees (0, 45, 90, 180, etc.)
  color?: string;
  notes?: string;
}

export interface VenueFixture {
  id: string;
  type: FixtureType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface SeatingPlan {
  id: string;
  version: string;
  weddingName: string;
  coupleNames: string;
  date: string;
  venueName: string;
  tables: Table[];
  guests: Guest[];
  fixtures: VenueFixture[];
  canvasWidth: number;
  canvasHeight: number;
  lastSavedAt: string;
}
