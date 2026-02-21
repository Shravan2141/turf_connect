'use client';

import { useState } from 'react';
import { QuickBookingForm } from './quick-booking-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/components/features/auth/auth-provider';
import { LoginButton } from '@/components/features/auth/login-button';

type BookingFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTurfId?: string | null;
};

export function BookingFormDialog({ open, onOpenChange, selectedTurfId }: BookingFormDialogProps) {
  const { user } = useAuth();

  // if user isn't logged in, render a small login prompt instead of the form
  if (!user) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-2xl">Login Required</DialogTitle>
            <DialogDescription>
              You must be logged in to book a turf. Please sign in with Google.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-6 flex justify-center">
            <LoginButton />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[500px] max-h-[90vh]"
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          // Keep dialog open when interacting with Popover (calendar) or Select (time slot/turf) - they render in portals
          if (
            target.closest('[data-radix-popover-content]') ||
            target.closest('[data-radix-popper-content-wrapper]') ||
            target.closest('[data-radix-select-viewport]') ||
            target.closest('[role="dialog"][data-state="open"]')
          ) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Book Your Turf</DialogTitle>
          <DialogDescription>
            Select your preferred turf, date, and time to send a booking request.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 max-h-[calc(90vh-180px)] overflow-y-auto">
          <QuickBookingForm 
            selectedTurfId={selectedTurfId} 
            onBookingComplete={() => onOpenChange(false)}
            compact={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
