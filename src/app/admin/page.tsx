'use client';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { BookingList } from '@/components/features/admin/booking-list';
import { useAuth } from '@/components/features/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);
  
  if (loading || !isAdmin) {
    return (
       <div className="flex flex-col min-h-screen bg-background">
        <Header />
        <main className="flex-1 container mx-auto py-8 px-4 md:px-6 flex items-center justify-center">
          <div className="text-center">
            {loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : <p>Unauthorized Access.</p>}
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
