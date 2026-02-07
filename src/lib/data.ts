import type { Turf } from './types';

export const turfs: Turf[] = [
  {
    id: '1',
    name: 'Pavallion Sports Arena T1',
    location: 'Downtown, Cityville',
    price: 1000,
    amenities: ['Floodlights', 'Washroom', 'Parking'],
    imageId: 'turf-1',
  },
  {
    id: '2',
    name: 'Pavallion Sports Arena T2',
    location: 'Suburbia, Townsville',
    price: 1000,
    amenities: ['Washroom', 'Parking', 'Gallery'],
    imageId: 'turf-2',
  },
  {
    id: '3',
    name: 'Pavallion Sports Arena T3',
    location: 'Uptown, Metropolis',
    price: 1000,
    amenities: ['Floodlights', 'Washroom', 'Parking', 'Gallery'],
    imageId: 'turf-3',
  },
];

export const timeSlots = [
  '06:00 - 08:00',
  '08:00 - 10:00',
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  '18:00 - 20:00',
  '20:00 - 22:00',
  '22:00 - 00:00',
];
