import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BookingList } from '@/components/features/admin/booking-list';

export default function AdminPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6">
        <section className="mb-8">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline mb-2">
            Admin Panel
          </h1>
          <p className="text-muted-foreground">
            Manage all turf bookings here.
          </p>
        </section>
        <BookingList />
      </main>
      <Footer />
    </div>
  );
}
