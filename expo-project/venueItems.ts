import type { VenueItemType } from './types';

export const venueItemLabels: Record<VenueItemType, string> = {
  dj: 'DJ',
  bar: 'Bar',
  dancefloor: 'Dance Floor',
  cakebar: 'Cake Bar',
  other: 'Other'
};

export const venueItemIcons: Record<VenueItemType, string> = {
  dj: '♫',
  bar: '▰',
  dancefloor: '✦',
  cakebar: '✿',
  other: '◆'
};

export const venueItemColors: Record<VenueItemType, string> = {
  dj: '#7c3aed',
  bar: '#0891b2',
  dancefloor: '#db2777',
  cakebar: '#d97706',
  other: '#475569'
};

export const venueItemDimensions: Record<VenueItemType, { width: number; height: number }> = {
  dj: { width: 100, height: 64 },
  bar: { width: 130, height: 58 },
  dancefloor: { width: 150, height: 120 },
  cakebar: { width: 100, height: 76 },
  other: { width: 110, height: 68 }
};
