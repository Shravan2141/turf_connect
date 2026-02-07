'use client';

import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BookingList } from '@/components/features/admin/booking-list';
import { PendingBookings } from '@/components/features/admin/pending-bookings';
import { TurfManagement } from '@/components/features/admin/turf-management';
import { useAuth } from '@/components/features/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    // Redirect if not logged in or not an admin
    if (!user || !isAdmin) {
      router.replace('/');
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !user || !isAdmin) {
    return (
       <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 container mx-auto py-8 px-4 md:px-6 flex items-center justify-center">
          <div className="text-center">
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            ) : (
              <p className="text-muted-foreground">
                {!user ? 'Please log in to access the admin panel.' : 'You do not have permission to access this page.'}
              </p>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto py-8 px-4 md:px-6">
        <section className="mb-8">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline mb-2">
            Pavallion Sports Arena
          </h1>
          <p className="text-muted-foreground">
            Manage turfs and bookings here.
          </p>
        </section>
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Turf Management</h2>
          <TurfManagement />
        </section>
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Pending Booking Requests</h2>
          <PendingBookings />
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-4">Confirmed Bookings</h2>
          <BookingList />
        </section>
      </main>
      <Footer />
    </div>
  );
}
