'use client';

import { useEffect, useState } from 'react';
import { TurfCard } from './turf-card';
import { getAllTurfs } from '@/lib/turf-service';
import type { Turf } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Loader2 } from 'lucide-react';

type TurfGridProps = {
  onTurfSelect?: (turfId: string) => void;
};

export function TurfGrid({ onTurfSelect }: TurfGridProps) {
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllTurfs().then((data) => {
      setTurfs(data);
      setLoading(false);
    });
  }, []);

  const turfImages = Object.fromEntries(
    PlaceHolderImages.map((img) => [img.id, img.imageUrl])
  );

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (turfs.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-16">
        No turfs available at the moment. Check back later.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {turfs.map((turf) => (
        <TurfCard
          key={turf.id}
          turf={turf}
          imageUrl={
            turfImages[turf.imageId] || 'https://picsum.photos/seed/placeholder/600/400'
          }
          onTurfSelect={onTurfSelect}
        />
      ))}
    </div>
  );
}
