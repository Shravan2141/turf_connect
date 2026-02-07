import type { LucideIcon } from 'lucide-react';

export type Amenity = {
  name: 'Floodlights' | 'Washroom' | 'Parking' | 'Gallery';
  icon: LucideIcon;
};

export type Turf = {
  id: string;
  name: string;
  location: string;
  price: number;
  amenities: Amenity['name'][];
  imageId: string;
};
