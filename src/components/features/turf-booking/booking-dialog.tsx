'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, getDay } from 'date-fns';
import { CalendarIcon, Loader2, PartyPopper, CheckCircle } from 'lucide-react';
import { bookingSchema } from '@/lib/schemas';
import type { z } from 'zod';
import type { Turf } from '@/lib/types';
import { timeSlots } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { bookingAssistantRecommendations } from '@/ai/flows/booking-assistant-recommendations';
import type { BookingAssistantRecommendationsOutput } from '@/ai/flows/booking-assistant-recommendations';
import { AiRecommendations } from './ai-recommendations';
import { addBooking, getBookedSlots } from '@/lib/booking-service';
import { useAuth } from '@/components/features/auth/auth-provider';
import { getPriceForSlot } from '@/lib/pricing';

type BookingFormValues = z.infer<typeof bookingSchema>;

// IMPORTANT: Replace with a real number in your .env file
const ADMIN_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER || '1234567890';

export function BookingDialog({ turf, children }: { turf: Turf, children: React.ReactNode }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [view, setView] = useState<'form' | 'loading' | 'recommendations' | 'confirmed'>('form');
  const [recommendations, setRecommendations] =
    useState<BookingAssistantRecommendationsOutput['recommendations'] | null>(null);
  const { toast } = useToast();
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: undefined,
      timeSlots: [],
      whatsappNumber: '',
    },
  });

  const selectedDate = form.watch('date');

  useEffect(() => {
    async function fetchBookedSlots() {
      if (selectedDate && user) {
        setLoadingSlots(true);
        try {
          const slots = await getBookedSlots(turf.id, selectedDate);
          setBookedSlots(slots);
        } catch (err) {
          console.error('Failed to fetch booked slots:', err);
          setBookedSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      } else if (selectedDate && !user) {
        setBookedSlots([]);
      }
    }
    fetchBookedSlots();
  }, [selectedDate, turf.id, open, user]);

  useEffect(() => {
    if (user && form.getValues('whatsappNumber') === '') {
        form.setValue('whatsappNumber', user.phoneNumber || '');
    }
  }, [user, form, open]);


  async function onSubmit(data: BookingFormValues) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please log in to book a slot.',
      });
      return;
    }

    setView('loading');
    setRecommendations(null);

    // Check if any selected slots are unavailable
    const unavailableSlots = data.timeSlots.filter(slot => bookedSlots.includes(slot));
    
    if (unavailableSlots.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Slot Not Available',
        description: `The following slots are no longer available: ${unavailableSlots.join(', ')}. Please select different slots.`,
      });
      setView('form');
      return;
    }

    // All selected slots are available
    setTimeout(() => setView('confirmed'), 500);
  }

  function handleRecommendationSelect(startTime: string, endTime: string) {
    const start = new Date(startTime);
    const newTimeSlot = `${format(start, 'HH:mm')} - ${format(new Date(endTime), 'HH:mm')}`;
    
    form.setValue('date', start);
    form.setValue('timeSlots', [newTimeSlot]);
    setView('confirmed');
  }

  async function handleWhatsAppRedirect() {
    const data = form.getValues();
    if (!data.date || !user || data.timeSlots.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a date, time slots, and be logged in before confirming.',
      });
      return;
    }
    
    try {
      // Add a booking for each selected time slot
      for (const timeSlot of data.timeSlots) {
        await addBooking({
          turfId: turf.id,
          date: format(data.date, 'yyyy-MM-dd'),
          timeSlot,
          whatsappNumber: data.whatsappNumber,
          userId: user.uid,
          userName: user.displayName || 'Unknown User'
        });
      }
      
      // Calculate total price
      const totalPrice = data.timeSlots.reduce((sum, slot) => {
        return sum + getPriceForSlot(turf, slot, data.date);
      }, 0);

      const message = encodeURIComponent(
        `Hi! I'd like to request a booking for ${turf.name} on ${format(
          data.date,
          'PPP'
        )} for the following slots: ${data.timeSlots.join(', ')} for a total of ₹${totalPrice}. My WhatsApp number is ${data.whatsappNumber}. Please confirm.`
      );
      const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${message}`;
      window.open(whatsappUrl, '_blank');
      resetAndClose();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: 'Could not save your booking. Please try again.',
      });
    }
  }
  
  function resetAndClose() {
    form.reset();
    setView('form');
    setRecommendations(null);
    setBookedSlots([]);
    setOpen(false);
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      if (user) {
        setOpen(true);
      } else {
        toast({
          title: 'Login Required',
          description: 'Please log in to book a turf.',
          variant: 'destructive',
        });
      }
    } else {
      resetAndClose();
    }
  };


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          // Keep dialog open when interacting with Popover (calendar) or Select (time slot) - they render in portals
          if (
            target.closest('[data-radix-popper-content-wrapper]') ||
            target.closest('[data-radix-select-viewport]')
          ) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Book {turf.name}</DialogTitle>
          <DialogDescription>
            Select a date and time to send a booking request.
          </DialogDescription>
        </DialogHeader>
        
        {view === 'loading' && (
          <div className="flex flex-col items-center justify-center gap-4 py-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Checking availability...</p>
          </div>
        )}

        {view === 'form' && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-4 text-left font-normal h-11 transition-colors pointer-events-auto',
                              !field.value && 'text-muted-foreground',
                              field.value && 'border-primary/30 bg-primary/5'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 text-primary/70" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-auto p-0 overflow-visible rounded-xl border-2 shadow-2xl z-[9999] pointer-events-auto" 
                        align="start"
                        side="bottom"
                        sideOffset={5}
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setCalendarOpen(false);
                          }}
                          defaultMonth={new Date()}
                          startMonth={new Date()}
                          endMonth={new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)}
                          disabled={(date) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const maxDate = new Date();
                            maxDate.setDate(maxDate.getDate() + 180);
                            return date < today || date > maxDate;
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeSlots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Slots (1 hour each)</FormLabel>
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {selectedDate && timeSlots.map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        const isSelected = field.value.includes(slot);
                        const price = getPriceForSlot(turf, slot, selectedDate);
                        
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isBooked || loadingSlots}
                            onClick={() => {
                              if (!isBooked) {
                                const newValue = isSelected 
                                  ? field.value.filter(s => s !== slot)
                                  : [...field.value, slot];
                                field.onChange(newValue);
                              }
                            }}
                            className={cn(
                              'p-2 text-xs rounded-md border transition-all duration-200 cursor-pointer',
                              isBooked 
                                ? 'bg-red-100 border-red-300 text-red-700 cursor-not-allowed opacity-60'
                                : isSelected
                                ? 'bg-primary text-primary-foreground border-primary font-semibold'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-primary hover:bg-primary/5'
                            )}
                          >
                            <div className="font-medium">{slot}</div>
                            <div className="text-xs mt-0.5">₹{price}</div>
                            {isBooked && <div className="text-xs mt-1">Booked</div>}
                          </button>
                        );
                      })}
                    </div>
                    {!selectedDate && <p className="text-sm text-destructive mt-1">Please select a date first</p>}
                    {selectedDate && field.value.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Selected: {field.value.join(', ')}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" variant="accent">Request Booking</Button>
            </form>
          </Form>
        )}
        
        {view === 'recommendations' && recommendations && (
           <AiRecommendations recommendations={recommendations} onSelect={handleRecommendationSelect} />
        )}

        {view === 'confirmed' && (
          <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
            <PartyPopper className="h-12 w-12 text-green-500" />
            <h3 className="text-xl font-semibold">Slots Available!</h3>
            <p className="text-muted-foreground">
              Your selected slots are available. Proceed to WhatsApp to confirm your booking with the admin.
            </p>
            <div className="text-left bg-secondary p-4 rounded-md w-full">
              <h4 className="font-bold mb-2">Booking Summary</h4>
              <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><strong>Turf:</strong> {turf.name}</p>
              <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><strong>Date:</strong> {form.getValues('date') ? format(form.getValues('date')!, 'PPP') : ''}</p>
              <div className="flex items-start gap-2 mt-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Time Slots:</strong>
                  <div className="ml-2 mt-1 space-y-1">
                    {form.getValues('timeSlots').map((slot) => (
                      <div key={slot} className="text-sm">
                        {slot} - ₹{getPriceForSlot(turf, slot, form.getValues('date')!)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="flex items-center gap-2 mt-2"><CheckCircle className="h-4 w-4 text-green-500" /><strong>Total Price:</strong> ₹{form.getValues('timeSlots').reduce((sum, slot) => sum + getPriceForSlot(turf, slot, form.getValues('date')!), 0)}</p>
            </div>
            <Button onClick={handleWhatsAppRedirect} className="w-full mt-4" variant="accent">
              Confirm on WhatsApp
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
