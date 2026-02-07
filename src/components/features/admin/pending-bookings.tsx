'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { IndianRupee, Loader2, CheckCircle, Trash2 } from 'lucide-react';
import { deleteBooking, getAllBookings, updateBookingStatus } from '@/lib/booking-service';
import type { Booking } from '@/lib/booking-service';
import { getAllTurfs } from '@/lib/turf-service';
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
import { useToast } from '@/hooks/use-toast';
import { getPriceForSlot } from '@/lib/pricing';

const ADMIN_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER || '1234567890';

export function PendingBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [turfs, setTurfs] = useState<Awaited<ReturnType<typeof getAllTurfs>>>([]);
  const [loading, setLoading] = useState(true);
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
        description: 'Could not fetch pending bookings.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const pendingBookings = bookings.filter(b => !b.status || b.status === 'pending');

  const handleConfirm = async (booking: Booking) => {
    setConfirming(booking.id);
    try {
      // Update status to confirmed
      await updateBookingStatus(booking.id, 'confirmed');
      
      // Get turf info for message
      const turf = turfs.find(t => t.id === booking.turfId);
      const bookingDate = new Date(booking.date.replace(/-/g, '/'));
      const price = turf ? getPriceForSlot(turf, booking.timeSlot, bookingDate) : 0;

      // Create WhatsApp message
      const message = encodeURIComponent(
        `Hi ${booking.userName}! Your booking for ${turf?.name} on ${format(bookingDate, 'PPP')} from ${booking.timeSlot} (₹${price}) has been confirmed. Thank you!`
      );
      
      // Open WhatsApp with user's number
      const whatsappUrl = `https://wa.me/${booking.whatsappNumber.replace(/\D/g, '')}?text=${message}`;
      window.open(whatsappUrl, '_blank');

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
        description: 'Could not confirm the booking.',
      });
    } finally {
      setConfirming(null);
    }
  };

  const handleDelete = async (bookingId: string) => {
    try {
      await deleteBooking(bookingId);
      await fetchBookings();
      toast({
        title: 'Booking Rejected',
        description: 'The pending booking has been removed.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reject booking.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Booking Requests</CardTitle>
        <CardDescription>
          {pendingBookings.length === 0
            ? 'No pending requests'
            : `${pendingBookings.length} pending request${pendingBookings.length !== 1 ? 's' : ''}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Turf</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time Slot</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Requested By</TableHead>
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
              ) : pendingBookings.length > 0 ? (
                pendingBookings.map((booking) => {
                  const turf = turfs.find(t => t.id === booking.turfId);
                  const bookingDate = new Date(booking.date.replace(/-/g, '/'));
                  const price = turf ? getPriceForSlot(turf, booking.timeSlot, bookingDate) : 0;
                  return (
                    <TableRow key={booking.id} className="bg-amber-50/50">
                      <TableCell className="font-medium">{turf?.name || 'Unknown'}</TableCell>
                      <TableCell>{format(bookingDate, 'PPP')}</TableCell>
                      <TableCell>{booking.timeSlot}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1">
                          <IndianRupee className="h-4 w-4" />
                          {price}
                        </span>
                      </TableCell>
                      <TableCell>{booking.userName || '—'}</TableCell>
                      <TableCell>{booking.whatsappNumber || '—'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConfirm(booking)}
                          disabled={confirming === booking.id}
                        >
                          {confirming === booking.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                          )}
                          Confirm
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(booking.id)}
                          disabled={confirming === booking.id}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                    No pending booking requests at the moment.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
