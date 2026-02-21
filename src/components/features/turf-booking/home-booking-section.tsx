'use client';

import { useState } from 'react';
import { BookingFormDialog } from './booking-form-dialog';
import { TurfGrid } from './turf-grid';
import { LoginButton } from '@/components/features/auth/login-button';

export function HomeBookingSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTurfId, setSelectedTurfId] = useState<string | null>(null);

  const handleTurfSelect = (turfId: string) => {
    setSelectedTurfId(turfId);
    setDialogOpen(true);
  };

  return (
    <>
      <BookingFormDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
        selectedTurfId={selectedTurfId}
      />
      {/* Hidden login button for programmatic triggering */}
      <div className="sr-only">
        <LoginButton data-login-trigger />
      </div>
      <section>
        <h2 className="text-xl font-semibold mb-4">Available Turfs</h2>
        <TurfGrid onTurfSelect={handleTurfSelect} />
      </section>
    </>
  );
}
