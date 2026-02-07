'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Trash2 } from 'lucide-react';
import { addBooking, deleteBooking, getAllBookings } from '@/lib/booking-service';
import type { Booking } from '@/lib/booking-service';
import { turfs, timeSlots } from '@/lib/data';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../auth/auth-provider';

const manualBookingSchema = z.object({
  turfId: z.string().min(1, 'Please select a turf.'),
  date: z.date({ required_error: 'A date is required.' }),
  timeSlot: z.string().min(1, 'Please select a time slot.'),
});

type ManualBookingFormValues = z.infer<typeof manualBookingSchema>;

export function BookingList() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const { toast } = useToast();

  const fetchBookings = async () => {
    setLoading(true);
    const allBookings = await getAllBookings();
    setBookings(allBookings);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
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
  
  const form = useForm<ManualBookingFormValues>({
    resolver: zodResolver(manualBookingSchema),
  });
  
  async function onSubmit(data: ManualBookingFormValues) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    try {
      await addBooking({
          turfId: data.turfId,
          date: format(data.date, 'yyyy-MM-dd'),
          timeSlot: data.timeSlot,
          whatsappNumber: 'N/A (Admin)',
          userId: user.uid,
          userName: user.displayName || 'Admin',
      });
      await fetchBookings();
      form.reset({ turfId: '', timeSlot: ''});
      toast({ title: 'Booking Added', description: 'The new booking has been created.' });
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to add booking.' });
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
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
                            <TableHead>Time Slot</TableHead>
                            <TableHead>Booked By</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                      <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : bookings.length > 0 ? (
                                bookings.map((booking) => {
                                    const turf = turfs.find(t => t.id === booking.turfId);
                                    return (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">{turf?.name || 'Unknown'}</TableCell>
                                        <TableCell>{format(new Date(booking.date.replace(/-/g, '/')), 'PPP')}</TableCell>
                                        <TableCell>{booking.timeSlot}</TableCell>
                                        <TableCell>{booking.userName || booking.whatsappNumber}</TableCell>
                                        <TableCell className="text-right">
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
                                    <TableCell colSpan={5} className="text-center h-24">
                                    No bookings found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div>
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
                                    <FormLabel>Turf</FormLabel>
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
                                    <FormLabel>Date</FormLabel>
                                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                        <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={(date) => { field.onChange(date); setCalendarOpen(false); }}
                                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
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
                                    <FormLabel>Time Slot</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select a time slot" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {timeSlots.map((slot) => (<SelectItem key={slot} value={slot}>{slot}</SelectItem>))}
                                    </SelectContent>
                                    </Select>
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
    </div>
  );
}
