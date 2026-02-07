'use client';

import { useState } from 'react';
import { QuickBookingForm } from './quick-booking-form';
import { TurfGrid } from './turf-grid';

export function HomeBookingSection() {
  const [selectedTurfId, setSelectedTurfId] = useState<string | null>(null);

  return (
    <>
      <section className="mb-12 max-w-md">
        <QuickBookingForm selectedTurfId={selectedTurfId} />
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-4">Available Turfs</h2>
        <TurfGrid onTurfSelect={setSelectedTurfId} />
      </section>
    </>
  );
}
