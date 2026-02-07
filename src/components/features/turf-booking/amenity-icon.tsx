'use client';

import type { Amenity } from '@/lib/types';
import { Car, Lightbulb, Users, PersonStanding } from 'lucide-react';
import type { ComponentProps } from 'react';

const iconMap: Record<Amenity['name'], React.ElementType> = {
  Floodlights: Lightbulb,
  Washroom: PersonStanding,
  Parking: Car,
  Gallery: Users,
};

type AmenityIconProps = ComponentProps<'div'> & {
  amenity: Amenity['name'];
};

export function AmenityIcon({ amenity, ...props }: AmenityIconProps) {
  const Icon = iconMap[amenity];
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground" {...props}>
      <Icon className="h-4 w-4 text-primary" />
      <span>{amenity}</span>
    </div>
  );
}
