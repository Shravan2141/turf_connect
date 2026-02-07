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
import { MapPin, IndianRupee } from 'lucide-react';
import { BookingDialog } from './booking-dialog';
import { AmenityIcon } from './amenity-icon';
import { buttonVariants } from '@/components/ui/button';

type TurfCardProps = {
  turf: Turf;
  imageUrl: string;
};

export function TurfCard({ turf, imageUrl }: TurfCardProps) {
  return (
    <BookingDialog turf={turf}>
      <Card className="flex h-full cursor-pointer flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
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
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              data-ai-hint="soccer field"
            />
          </div>
          <div>
            <h4 className="mb-2 font-semibold">Amenities</h4>
            <div className="grid grid-cols-2 gap-2">
              {turf.amenities.map((amenity) => (
                <AmenityIcon key={amenity} amenity={amenity} />
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="mt-auto flex items-center justify-between bg-secondary/50 p-4">
          <div>
            <div className="flex items-center text-lg font-bold">
              <IndianRupee className="mr-1 h-5 w-5" />
              {turf.price}
              <span className="ml-1 text-sm font-normal text-muted-foreground">/2 hrs</span>
            </div>
            <p className="text-xs text-muted-foreground">*Price may vary depending on the time slot.</p>
          </div>
          <div className={buttonVariants({ variant: 'accent' })}>Book Now</div>
        </CardFooter>
      </Card>
    </BookingDialog>
  );
}
