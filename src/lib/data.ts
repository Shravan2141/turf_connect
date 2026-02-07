import type { Turf } from './types';

export const turfs: Turf[] = [
  {
    id: '1',
    name: 'Greenfield Arena',
    location: 'Downtown, Cityville',
    price: 50,
    amenities: ['Floodlights', 'Washroom', 'Parking'],
    imageId: 'turf-1',
  },
  {
    id: '2',
    name: 'Soccer Central',
    location: 'Suburbia, Townsville',
    price: 45,
    amenities: ['Washroom', 'Parking', 'Gallery'],
    imageId: 'turf-2',
  },
  {
    id: '3',
    name: 'The Pitch',
    location: 'Uptown, Metropolis',
    price: 60,
    amenities: ['Floodlights', 'Washroom', 'Parking', 'Gallery'],
    imageId: 'turf-3',
  },
  {
    id: '4',
    name: 'Victory Field',
    location: 'Eastside, Boroughburg',
    price: 55,
    amenities: ['Floodlights', 'Parking'],
    imageId: 'turf-4',
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
