'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { bookingAssistantRecommendations } from '@/ai/flows/booking-assistant-recommendations';
import type { BookingAssistantRecommendationsOutput } from '@/ai/flows/booking-assistant-recommendations';
import { AiRecommendations } from './ai-recommendations';

type BookingFormValues = z.infer<typeof bookingSchema>;

const ADMIN_WHATSAPP_NUMBER = '1234567890'; // IMPORTANT: Replace with a real number

export function BookingDialog({ turf }: { turf: Turf }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'form' | 'loading' | 'recommendations' | 'confirmed'>('form');
  const [recommendations, setRecommendations] =
    useState<BookingAssistantRecommendationsOutput['recommendations'] | null>(null);
  const { toast } = useToast();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      timeSlot: '',
      whatsappNumber: '',
    },
  });

  async function onSubmit(data: BookingFormValues) {
    setView('loading');
    setRecommendations(null);

    // Simulate checking for availability. Turf 1 from 18:00-20:00 is always "unavailable".
    const isUnavailable = turf.id === '1' && data.timeSlot === '18:00 - 20:00';

    if (isUnavailable) {
      try {
        const [startHourString] = data.timeSlot.split(':');
        const startHour = parseInt(startHourString, 10);
        
        const preferredStartTime = new Date(data.date);
        preferredStartTime.setHours(startHour, 0, 0, 0);

        const preferredEndTime = new Date(preferredStartTime);
        preferredEndTime.setHours(startHour + 2);

        const result = await bookingAssistantRecommendations({
          turfId: turf.id,
          preferredStartTime: preferredStartTime.toISOString(),
          preferredEndTime: preferredEndTime.toISOString(),
          userId: 'user-123', // In a real app, this would be the logged-in user's ID
        });
        
        if (result.recommendations && result.recommendations.length > 0) {
          setRecommendations(result.recommendations);
          setView('recommendations');
        } else {
          throw new Error("No alternative slots found.");
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'AI Assistant Error',
          description: 'Could not fetch recommendations. Please try another time slot.',
        });
        setView('form');
      }
    } else {
      // Slot is available
      setTimeout(() => setView('confirmed'), 500); // Simulate a short delay
    }
  }

  function handleRecommendationSelect(startTime: string, endTime: string) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const newTimeSlot = `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
    
    form.setValue('date', start);
    form.setValue('timeSlot', newTimeSlot);
    setView('confirmed');
  }

  function handleWhatsAppRedirect() {
    const data = form.getValues();
    const message = encodeURIComponent(
      `Hi! I'd like to request a booking for ${turf.name} on ${format(
        data.date,
        'PPP'
      )} from ${data.timeSlot}. My WhatsApp number is ${data.whatsappNumber}. Please confirm.`
    );
    const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  }
  
  function resetAndClose() {
    form.reset();
    setView('form');
    setRecommendations(null);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetAndClose();
        } else {
          setOpen(true);
        }
      }}>
      <DialogTrigger asChild>
        <Button variant="accent" className="w-full sm:w-auto">Book Now</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date() || date < new Date('1900-01-01')}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeSlot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Slot (2 hours)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a time slot" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={slot} value={slot}>
                            {slot}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
            <h3 className="text-xl font-semibold">Slot Available!</h3>
            <p className="text-muted-foreground">
              Your selected slot is available. Proceed to WhatsApp to confirm your booking with the admin.
            </p>
            <div className="text-left bg-secondary p-4 rounded-md w-full">
              <h4 className="font-bold mb-2">Booking Summary</h4>
              <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><strong>Turf:</strong> {turf.name}</p>
              <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><strong>Date:</strong> {format(form.getValues('date'), 'PPP')}</p>
              <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /><strong>Time:</strong> {form.getValues('timeSlot')}</p>
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
