'use client';



import { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { z } from 'zod';

import { format } from 'date-fns';

import { CalendarIcon, IndianRupee, Loader2, Trash2, MessageSquare } from 'lucide-react';

import { addBooking, getBookedSlots, convertSlotsToTimeRange, getAllBookings, deleteBooking, updateBookingStatus } from '@/lib/booking-service';

import type { Booking } from '@/lib/booking-service';

import { getAllTurfs } from '@/lib/turf-service';

import { timeSlots } from '@/lib/data';

import {

  Table,

  TableBody,

  TableCell,

  TableHead,

  TableHeader,

  TableRow,

} from '@/components/ui/table';

import { Button } from '@/components/ui/button';

import {

  Card,

  CardContent,

  CardDescription,

  CardHeader,

  CardTitle,

} from '@/components/ui/card';

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

import { useAuth } from '../auth/auth-provider';

import { getPriceForSlot, getPriceForTimeRange } from '@/lib/pricing';



const manualBookingSchema = z.object({

  turfId: z.string().min(1, 'Please select a turf.'),

  date: z.date({ required_error: 'A date is required.' }),

  timeSlots: z.array(z.string()).min(1, 'Please select at least one time slot.'),

  whatsappNumber: z.string().min(1, 'WhatsApp number is required.').regex(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid WhatsApp number (e.g., +91 98765 43210)'),

});



type ManualBookingFormValues = z.infer<typeof manualBookingSchema>;



export function BookingList() {

  const { user } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);

  const [turfs, setTurfs] = useState<Awaited<ReturnType<typeof getAllTurfs>>>([]);

  const [loading, setLoading] = useState(true);

  const [calendarOpen, setCalendarOpen] = useState(false);

  const [bookedSlots, setBookedSlots] = useState<string[]>([]);

  const [loadingSlots, setLoadingSlots] = useState(false);

  const [confirming, setConfirming] = useState<string | null>(null);

  const { toast } = useToast();

  

  const fetchBookings = async () => {

    setLoading(true);

    try {

      const [allBookings, allTurfs] = await Promise.all([getAllBookings(), getAllTurfs()]);

      setBookings(allBookings);

      setTurfs(allTurfs);

    } catch (err) {

      console.error('Failed to fetch bookings/turfs:', err);

      toast({

        variant: 'destructive',

        title: 'Failed to load data',

        description: 'Ensure Firestore rules are deployed and you are logged in.',

      });

    } finally {

      setLoading(false);

    }

  };



  useEffect(() => {

    fetchBookings();

  }, []);



  useEffect(() => {

    const handler = () => fetchBookings();

    window.addEventListener('turfs-updated', handler);

    return () => window.removeEventListener('turfs-updated', handler);

  }, []);



  



  



  const handleDelete = async (bookingId: string) => {

    try {

      await deleteBooking(bookingId);

      await fetchBookings();

      toast({ title: 'Booking Deleted', description: 'The booking has been removed.' });

    } catch (error) {

      toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete booking.' });

    }

  };

  

  const handleConfirm = async (booking: Booking) => {
    setConfirming(booking.id);
    try {
      // Update status to confirmed
      await updateBookingStatus(booking.id, 'confirmed');
      
      // Get turf info for message
      const turf = turfs.find(t => t.id === booking.turfId);
      const bookingDate = new Date(booking.date.replace(/-/g, '/'));
      
      // Calculate total price for time range
      let totalPrice = 0;
      let timeDisplay = '';
      
      if (turf && booking.startTime && booking.endTime) {
        // New format with time range - use centralized function
        totalPrice = getPriceForTimeRange(turf, booking.startTime, booking.endTime, bookingDate);
        timeDisplay = booking.timeRange || `${booking.startTime} - ${booking.endTime}`;
      } else if (turf && booking.timeSlot) {
        // Old format with individual slot
        totalPrice = getPriceForSlot(turf, booking.timeSlot, bookingDate);
        timeDisplay = booking.timeSlot;
      } else {
        totalPrice = 0;
        timeDisplay = 'Unknown time';
      }

      // Create WhatsApp message (same as pending bookings)
      const message = encodeURIComponent(
        `Hi ${booking.userName}! Your booking for ${turf?.name} on ${format(bookingDate, 'PPP')} from ${timeDisplay} (₹${totalPrice}) has been confirmed. Thank you!`
      );
      
      // Open WhatsApp with user's number
      const whatsappUrl = `https://wa.me/${booking.whatsappNumber.replace(/\D/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      // Refresh bookings
      await fetchBookings();
      toast({
        title: 'Booking Confirmed',
        description: 'Confirmation message sent via WhatsApp.',
      });
    } catch (error) {
      console.error('Error confirming booking:', error);
      toast({
        variant: 'destructive',
        title: 'Confirmation Failed',
        description: 'Could not confirm booking.',
      });
    } finally {
      setConfirming(null);
    }
  };

  const handleSendConfirmation = async (booking: Booking) => {
    setConfirming(booking.id);
    try {
      // Get turf info for message
      const turf = turfs.find(t => t.id === booking.turfId);
      const bookingDate = new Date(booking.date.replace(/-/g, '/'));
      
      // Calculate total price for time range
      let totalPrice = 0;
      let timeDisplay = '';
      
      if (turf && booking.startTime && booking.endTime) {
        // New format with time range - use centralized function
        totalPrice = getPriceForTimeRange(turf, booking.startTime, booking.endTime, bookingDate);
        timeDisplay = booking.timeRange || `${booking.startTime} - ${booking.endTime}`;
      } else if (turf && booking.timeSlot) {
        // Old format with individual slot
        totalPrice = getPriceForSlot(turf, booking.timeSlot, bookingDate);
        timeDisplay = booking.timeSlot;
      } else {
        totalPrice = 0;
        timeDisplay = 'Unknown time';
      }

      // Create WhatsApp message (same as pending bookings)
      const message = encodeURIComponent(
        `Hi ${booking.userName}! Your booking for ${turf?.name} on ${format(bookingDate, 'PPP')} from ${timeDisplay} (₹${totalPrice}) has been confirmed. Thank you!`
      );
      
      // Open WhatsApp with user's number
      const whatsappUrl = `https://wa.me/${booking.whatsappNumber.replace(/\D/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      toast({
        title: 'Confirmation Sent',
        description: 'WhatsApp confirmation message sent successfully.',
      });
    } catch (error) {
      console.error('Error sending confirmation:', error);
      toast({
        variant: 'destructive',
        title: 'Message Failed',
        description: 'Could not send confirmation message.',
      });
    } finally {
      setConfirming(null);
    }
  };

  

  const form = useForm<ManualBookingFormValues>({

    resolver: zodResolver(manualBookingSchema),

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

  async function onSubmit(data: ManualBookingFormValues) {

    if (!user) {

        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });

        return;

    }



    // Additional validation

    if (!selectedTurfId) {

        toast({ variant: 'destructive', title: 'Validation Error', description: 'Please select a turf.' });

        return;

    }



    if (!selectedDate) {

        toast({ variant: 'destructive', title: 'Validation Error', description: 'Please select a date.' });

        return;

    }



    if (data.timeSlots.length === 0) {

        toast({ variant: 'destructive', title: 'Validation Error', description: 'Please select at least one time slot.' });

        return;

    }



    // Check if selected slots are already booked

    const alreadyBookedSlots = data.timeSlots.filter(slot => bookedSlots.includes(slot));

    if (alreadyBookedSlots.length > 0) {

        toast({ 

            variant: 'destructive', 

            title: 'Slots Already Booked', 

            description: `The following time slots are already booked: ${alreadyBookedSlots.join(', ')}` 

        });

        return;

    }



    try {

      // Convert selected slots to time range

      const { startTime, endTime, timeRange } = convertSlotsToTimeRange(data.timeSlots);

      

      // Create a single booking with merged time range

      await addBooking({

          turfId: data.turfId,

          date: format(data.date, 'yyyy-MM-dd'),

          startTime,

          endTime,

          timeRange,

          whatsappNumber: data.whatsappNumber?.trim() || 'N/A (Admin)',

          userId: user.uid,

          userName: user.displayName || 'Admin',

          status: 'confirmed',

          createdAt: new Date().toISOString(),

      });

      await fetchBookings();

      form.reset({ turfId: '', date: undefined, timeSlots: [], whatsappNumber: '' });

      toast({ 

        title: 'Booking Added', 

        description: `Successfully created booking for ${timeRange}.` 

      });

    } catch (error) {

        console.error('Error adding booking:', error);

        toast({ 

            variant: 'destructive', 

            title: 'Error', 

            description: 'Failed to add booking. Please try again.' 

        });

    }

  }



  return (

    <div className="space-y-8">

        {/* Confirmed Bookings Section */}

        <Card>

            <CardHeader>

                <CardTitle>Current Bookings</CardTitle>

                <CardDescription>A list of all confirmed bookings.</CardDescription>

            </CardHeader>

            <CardContent>

                <div className="border rounded-md">

                    <Table>

                    <TableHeader>

                        <TableRow>

                        <TableHead>Turf</TableHead>

                        <TableHead>Date</TableHead>

                        <TableHead>Time Range</TableHead>

                        <TableHead>Price</TableHead>

                        <TableHead>Booked By</TableHead>

                        <TableHead>WhatsApp</TableHead>

                        <TableHead className="text-right">Action</TableHead>

                        </TableRow>

                    </TableHeader>

                    <TableBody>

                        {loading ? (

                            <TableRow>

                                <TableCell colSpan={7} className="text-center h-24">

                                  <Loader2 className="mx-auto h-6 w-6 animate-spin" />

                                </TableCell>

                            </TableRow>

                        ) : bookings.length > 0 ? (

                            bookings.filter(b => b.status === 'confirmed').map((booking) => {

                                const turf = turfs.find(t => t.id === booking.turfId);

                                const bookingDate = new Date(booking.date.replace(/-/g, '/'));

                                

                                // Calculate total price for the time range

                                let totalPrice = 0;

                                if (turf && booking.startTime && booking.endTime) {

                                  const startHour = parseInt(booking.startTime.split(':')[0]);

                                  const endHour = parseInt(booking.endTime.split(':')[0]);

                                  

                                  for (let hour = startHour; hour < endHour; hour++) {

                                    const slotStart = hour.toString().padStart(2, '0') + ':00';

                                    const slotEnd = (hour + 1).toString().padStart(2, '0') + ':00';

                                    const slot = `${slotStart} - ${slotEnd}`;

                                    totalPrice += getPriceForSlot(turf, slot, bookingDate);

                                  }

                                }

                                

                                return (

                                <TableRow key={booking.id} className="align-middle">

                                    <TableCell className="font-medium whitespace-nowrap">{turf?.name || 'Unknown'}</TableCell>

                                    <TableCell className="whitespace-nowrap">{format(bookingDate, 'PPP')}</TableCell>

                                    <TableCell className="whitespace-nowrap">{booking.timeRange || booking.timeSlot}</TableCell>

                                    <TableCell className="whitespace-nowrap">

                                        <span className="inline-flex items-center gap-1">

                                            <IndianRupee className="h-4 w-4" />

                                            {totalPrice}

                                        </span>

                                    </TableCell>

                                    <TableCell className="whitespace-nowrap">{booking.userName || '—'}</TableCell>

                                    <TableCell className="whitespace-nowrap">{booking.whatsappNumber || '—'}</TableCell>

                                    <TableCell className="text-right space-x-2 min-w-[120px] whitespace-nowrap">

                                    <Button

                                      variant="ghost"

                                      size="sm"

                                      onClick={() => handleSendConfirmation(booking)}

                                      disabled={confirming === booking.id}

                                    >

                                      {confirming === booking.id ? (

                                        <Loader2 className="h-4 w-4 animate-spin" />

                                      ) : (

                                        <MessageSquare className="h-4 w-4 text-blue-600" />

                                      )}

                                    </Button>

                                    <Button

                                        variant="ghost"

                                        size="icon"

                                        onClick={() => handleDelete(booking.id)}

                                    >

                                        <Trash2 className="h-4 w-4 text-destructive" />

                                    </Button>

                                    </TableCell>

                                </TableRow>

                                );

                            })

                        ) : (

                            <TableRow>

                                <TableCell colSpan={7} className="text-center h-24">

                                No bookings found.

                                </TableCell>

                            </TableRow>

                        )}

                    </TableBody>

                    </Table>

                </div>

            </CardContent>

        </Card>



        {/* Manual Booking Form Section */}

        <Card>

            <CardHeader>

                <CardTitle>Add a Booking</CardTitle>

                <CardDescription>Manually block a slot.</CardDescription>

            </CardHeader>

            <CardContent>

                 <Form {...form}>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField

                            control={form.control}

                            name="turfId"

                            render={({ field }) => (

                            <FormItem>

                                <FormLabel htmlFor="turfId">Turf</FormLabel>

                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>

                                <FormControl>

                                    <SelectTrigger><SelectValue placeholder="Select a turf" /></SelectTrigger>

                                </FormControl>

                                <SelectContent>

                                    {turfs.map((turf) => (

                                    <SelectItem key={turf.id} value={turf.id}>{turf.name}</SelectItem>

                                    ))}

                                </SelectContent>

                                    </Select>

                                <FormMessage />

                            </FormItem>

                            )}

                        />

                        <FormField

                            control={form.control}

                            name="date"

                            render={({ field }) => (

                            <FormItem className="flex flex-col">

                                <FormLabel htmlFor="date">Date</FormLabel>

                                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>

                                <PopoverTrigger asChild>

                                    <FormControl>

                                    <Button variant={'outline'} className={cn('w-full pl-4 text-left font-normal h-11 transition-colors', !field.value && 'text-muted-foreground', field.value && 'border-primary/30 bg-primary/5')}>

                                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}

                                        <CalendarIcon className="ml-auto h-4 w-4 text-primary/70" />

                                    </Button>

                                    </FormControl>

                                </PopoverTrigger>

                                <PopoverContent className="w-auto p-0 overflow-hidden rounded-xl border-2 shadow-xl z-[100]" align="start">

                                    <Calendar

                                    mode="single"

                                    selected={field.value}

                                    onSelect={(date) => { field.onChange(date); setCalendarOpen(false); }}

                                    defaultMonth={new Date()}

                                    startMonth={new Date()}

                                    endMonth={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)}

                                    disabled={[

                                      { before: new Date(new Date().setHours(0, 0, 0, 0)) },

                                      { after: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },

                                    ]}

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

                                <FormLabel htmlFor="timeSlots">Time Slots (1 hour each)</FormLabel>

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

                                            

                                            // Check if selection creates a continuous block

                                            const sortedSlots = [...newValue].sort();

                                            let isContinuous = true;

                                            for (let i = 1; i < sortedSlots.length; i++) {

                                              const currentIndex = timeSlots.indexOf(sortedSlots[i]);

                                              const prevIndex = timeSlots.indexOf(sortedSlots[i - 1]);

                                              if (currentIndex !== prevIndex + 1) {

                                                isContinuous = false;

                                                break;

                                              }

                                            }

                                            

                                            if (isContinuous) {

                                              field.onChange(newValue);

                                            } else {

                                              toast({

                                                variant: 'destructive',

                                                title: 'Invalid Selection',

                                                description: 'Please select continuous time slots only (e.g., 9:00 AM, 10:00 AM, 11:00 AM).'

                                              });

                                            }

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

                            const turf = turfs.find(t => t.id === form.watch('turfId'));

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

                                <FormLabel htmlFor="whatsappNumber">WhatsApp Number</FormLabel>

                                <FormControl>

                                    <Input placeholder="+91 98765 43210" {...field} />

                                </FormControl>

                                <FormMessage />

                            </FormItem>

                            )}

                        />

                        <Button type="submit" className="w-full">Add Booking</Button>

                    </form>

                </Form>

            </CardContent>

        </Card>

    </div>

  );

}

