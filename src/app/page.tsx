import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { HomeBookingSection } from '@/components/features/turf-booking/home-booking-section';

export default function Home() {
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
        <HomeBookingSection />
      </main>
      <Footer />
    </div>
  );
}
