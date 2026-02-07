import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { TurfCard } from '@/components/features/turf-booking/turf-card';
import { turfs } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const turfImages = Object.fromEntries(
    PlaceHolderImages.map((img) => [img.id, img.imageUrl])
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6">
        <section className="mb-12 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline mb-4">
            Find Your Perfect Pitch
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground md:text-xl">
            Browse available turfs, check amenities, and book your slot in minutes.
          </p>
        </section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {turfs.map((turf) => (
            <TurfCard
              key={turf.id}
              turf={turf}
              imageUrl={
                turfImages[turf.imageId] || 'https://picsum.photos/seed/placeholder/600/400'
              }
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
