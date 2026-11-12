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
  dj: '#a28f9d',
  bar: '#8b9b8a',
  dancefloor: '#b48b82',
  cakebar: '#ad9166',
  other: '#8b8172'
};

export const venueItemDimensions: Record<VenueItemType, { width: number; height: number }> = {
  dj: { width: 100, height: 64 },
  bar: { width: 130, height: 58 },
  dancefloor: { width: 150, height: 120 },
  cakebar: { width: 100, height: 76 },
  other: { width: 110, height: 68 }
};
