import Image from 'next/image';
import type { Turf } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MapPin, DollarSign } from 'lucide-react';
import { BookingDialog } from './booking-dialog';
import { AmenityIcon } from './amenity-icon';

type TurfCardProps = {
  turf: Turf;
  imageUrl: string;
};

export function TurfCard({ turf, imageUrl }: TurfCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{turf.name}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {turf.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="aspect-video overflow-hidden rounded-md">
          <Image
            src={imageUrl}
            alt={turf.name}
            width={600}
            height={400}
            className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
            data-ai-hint="soccer field"
          />
        </div>
        <div>
          <h4 className="font-semibold mb-2">Amenities</h4>
          <div className="grid grid-cols-2 gap-2">
            {turf.amenities.map((amenity) => (
              <AmenityIcon key={amenity} amenity={amenity} />
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center bg-secondary/50 p-4">
        <div className="flex items-center font-bold text-lg">
          <DollarSign className="h-5 w-5 mr-1" />
          {turf.price}
          <span className="text-sm font-normal text-muted-foreground ml-1">/2 hrs</span>
        </div>
        <BookingDialog turf={turf} />
      </CardFooter>
    </Card>
  );
}
