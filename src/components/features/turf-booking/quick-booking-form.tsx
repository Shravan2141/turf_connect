'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, IndianRupee, Loader2 } from 'lucide-react';
import { addBooking, getBookedSlots } from '@/lib/booking-service';
import { getAllTurfs } from '@/lib/turf-service';
import { timeSlots } from '@/lib/data';
import type { Turf } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/features/auth/auth-provider';
import { getPriceForSlot } from '@/lib/pricing';
import { bookingSchema } from '@/lib/schemas';

const ADMIN_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER || '1234567890';

const quickBookingSchema = z.object({
  turfId: z.string().min(1, 'Please select a turf.'),
  date: z.date({
    required_error: 'A date is required.',
    invalid_type_error: 'Please select a valid date.',
  }).refine((date) => {
    // Ensure date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today;
  }, 'Date cannot be in the past.'),
  timeSlots: z.array(z.string()).min(1, 'Please select at least one time slot.'),
  whatsappNumber: z
    .string()
    .min(10, 'Please enter a valid WhatsApp number.')
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format.'),
}).refine((data) => {
  // Ensure timeSlots is only selected if date is selected
  if (!data.date && data.timeSlots.length > 0) {
    return false;
  }
  return true;
}, {
  message: 'Please select a date before choosing time slots.',
  path: ['timeSlots'],
});

type QuickBookingFormValues = z.infer<typeof quickBookingSchema>;

type QuickBookingFormProps = {
  selectedTurfId?: string | null;
  onBookingComplete?: () => void;
  compact?: boolean;
};

export function QuickBookingForm({ selectedTurfId: initialTurfId, onBookingComplete, compact }: QuickBookingFormProps) {
  const { user } = useAuth();
  const [turfs, setTurfs] = useState<Turf[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getAllTurfs().then((data) => {
      setTurfs(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const handler = () => getAllTurfs().then(setTurfs);
    window.addEventListener('turfs-updated', handler);
    return () => window.removeEventListener('turfs-updated', handler);
  }, []);

  const form = useForm<QuickBookingFormValues>({
    resolver: zodResolver(quickBookingSchema),
    defaultValues: { whatsappNumber: '', timeSlots: [] },
  });

  const selectedDate = form.watch('date');
  const selectedTurfId = form.watch('turfId');

  useEffect(() => {
    async function fetchBookedSlots() {
      if (selectedDate && selectedTurfId && user) {
        setLoadingSlots(true);
        try {
          const slots = await getBookedSlots(selectedTurfId, selectedDate);
          setBookedSlots(slots);
        } catch (err) {
          console.error('Failed to fetch booked slots:', err);
          setBookedSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      } else {
        setBookedSlots([]);
      }
    }
    fetchBookedSlots();
  }, [selectedDate, selectedTurfId, user]);

  useEffect(() => {
    if (user?.phoneNumber && form.getValues('whatsappNumber') === '') {
      form.setValue('whatsappNumber', user.phoneNumber);
    }
  }, [user, form]);

  useEffect(() => {
    if (initialTurfId) {
      form.setValue('turfId', initialTurfId);
    }
  }, [initialTurfId, form]);

  async function onSubmit(data: QuickBookingFormValues) {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Login Required',
        description: 'Please log in to book a turf.',
      });
      return;
    }

    const turf = turfs.find((t) => t.id === data.turfId);
    if (!turf) return;

    setSubmitting(true);
    try {
      // Add a booking for each selected time slot
      for (const timeSlot of data.timeSlots) {
        await addBooking({
          turfId: data.turfId,
          date: format(data.date, 'yyyy-MM-dd'),
          timeSlot,
          whatsappNumber: data.whatsappNumber.replace(/\s/g, '').trim(),
          userId: user.uid,
          userName: user.displayName || 'Unknown User',
          status: 'pending',
          createdAt: new Date().toISOString(),
        });
      }

      // Calculate total price
      const totalPrice = data.timeSlots.reduce((sum, slot) => {
        return sum + getPriceForSlot(turf, slot, data.date);
      }, 0);

      const message = encodeURIComponent(
        `Hi! I'd like to request a booking for ${turf.name} on ${format(data.date, 'PPP')} for the following slots: ${data.timeSlots.join(', ')} for a total of ₹${totalPrice}. My WhatsApp number is ${data.whatsappNumber}. Please confirm.`
      );
      const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${message}`;
      window.open(whatsappUrl, '_blank');

      form.reset({ turfId: initialTurfId || '', date: undefined, timeSlots: [], whatsappNumber: user.phoneNumber || '' });
      toast({ title: 'Booking Requested', description: 'Proceed to WhatsApp to confirm with the admin.' });
      
      // Close dialog after successful booking
      onBookingComplete?.();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Booking Failed',
        description: 'Could not save your booking. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (turfs.length === 0) {
    return null;
  }

  return (
    <>
      {!compact && (
        <Card id="quick-booking-form">
          <CardHeader>
            <CardTitle>Book a Slot</CardTitle>
            <CardDescription>
              Select turf, date, and time to send a booking request. You must be logged in to book.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderForm()}
          </CardContent>
        </Card>
      )}
      {compact && renderForm()}
    </>
  );

  function renderForm() {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="turfId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Turf</FormLabel>
                  {initialTurfId ? (
                    // Display as locked/read-only when pre-selected from turf card
                    <div className="w-full p-3 rounded-md border border-gray-300 bg-gray-50 text-gray-800 font-medium">
                      {turfs.find((t) => t.id === field.value)?.name || 'Selected Turf'}
                    </div>
                  ) : (
                    // Allow selection when no turf is pre-selected
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a turf" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {turfs.map((turf) => (
                          <SelectItem key={turf.id} value={turf.id}>
                            {turf.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
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
                          variant="outline"
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
                    {selectedDate && selectedTurfId && timeSlots.map((slot) => {
                      const isBooked = bookedSlots.includes(slot);
                      const isSelected = field.value.includes(slot);
                      const turf = turfs.find((t) => t.id === selectedTurfId);
                      const price = turf && selectedDate ? getPriceForSlot(turf, slot, selectedDate) : 0;
                      
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
                            <div className="text-foreground font-medium flex items-center justify-center gap-1 mt-1">
                              <IndianRupee className="h-3.5 w-3.5" />
                              {price}
                            </div>
                          {/* <div className="text-xs mt-0.5">₹{price}</div> */}
                          {isBooked && <div className="text-xs mt-1">Booked</div>}
                        </button>
                      );
                    })}
                  </div>
                  {!selectedDate && <p className="text-sm text-destructive mt-1">Please select a date first</p>}
                  {selectedDate && !selectedTurfId && <p className="text-sm text-destructive mt-1">Please select a turf first</p>}
                  {selectedDate && field.value.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {field.value.join(', ')}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch('turfId') && form.watch('date') && form.watch('timeSlots').length > 0 && (() => {
              const turf = turfs.find((t) => t.id === form.watch('turfId'));
              const totalPrice = form.watch('timeSlots').reduce((sum, slot) => {
                return sum + getPriceForSlot(turf!, slot, form.watch('date'));
              }, 0);
              return turf ? (
                <div className="rounded-lg border bg-muted/50 p-3">
                  <p className="text-sm font-medium text-muted-foreground">Total Price</p>
                  <p className="text-xl font-semibold flex items-center gap-1">
                    <IndianRupee className="h-5 w-5" />
                    {totalPrice}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ({form.watch('timeSlots').length} hour{form.watch('timeSlots').length > 1 ? 's' : ''})
                  </p>
                </div>
              ) : null;
            })()}
            <FormField
              control={form.control}
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+91 98765 43210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" variant="accent" disabled={!user || submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : !user ? (
                'Log in to Book'
              ) : (
                'Request Booking'
              )}
            </Button>
          </form>
        </Form>
      );
    }
}