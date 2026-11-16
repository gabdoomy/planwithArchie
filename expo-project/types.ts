export type TableShape = 'round' | 'square' | 'rectangle';
export type VenueItemType = 'dj' | 'bar' | 'dancefloor' | 'cakebar' | 'other';

export interface Guest {
  id: string;
  name: string;
  dietary?: string;
  isVip?: boolean;
  seatIndex?: number;
}

export interface TableItem {
  id: string;
  name: string;
  shape: TableShape;
  capacity: number;
  scale?: number;
  lengthScale?: number;
  widthScale?: number;
  rotation?: number;
  x: number;
  y: number;
  guests: Guest[];
  venueType?: VenueItemType;
}
