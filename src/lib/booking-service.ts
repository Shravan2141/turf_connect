'use client';

import { format } from 'date-fns';
import { app } from './firebase';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  updateDoc,
  query, 
  where,
  doc
} from 'firebase/firestore';

export type Booking = {
  id: string;
  turfId: string;
  date: string; // YYYY-MM-DD format
  startTime?: string; // Start time in HH:mm format (new format)
  endTime?: string; // End time in HH:mm format (new format)
  timeRange?: string; // Formatted time range (e.g., "00:00 - 04:00") (new format)
  timeSlot?: string; // Individual time slot (old format, for backward compatibility)
  whatsappNumber: string;
  userId: string;
  userName: string;
  status?: 'pending' | 'confirmed'; // pending by default, admin changes to confirmed
  createdAt?: string;
};

const db = getFirestore(app);
const bookingsCollection = collection(db, 'bookings');

// Helper function to convert multiple slots into time range
export const convertSlotsToTimeRange = (slots: string[]): { startTime: string; endTime: string; timeRange: string } => {
  if (slots.length === 0) {
    throw new Error('No slots provided');
  }
  
  // Sort slots and get first and last
  const sortedSlots = [...slots].sort();
  const firstSlot = sortedSlots[0]; // e.g., "00:00 - 01:00"
  const lastSlot = sortedSlots[sortedSlots.length - 1]; // e.g., "03:00 - 04:00"
  
  // Extract start time from first slot and end time from last slot
  const startTime = firstSlot.split(' - ')[0]; // "00:00"
  const endTime = lastSlot.split(' - ')[1]; // "04:00"
  
  // Create formatted time range
  const timeRange = `${startTime} - ${endTime}`;
  
  return { startTime, endTime, timeRange };
};

// Get all bookings, sorted by date
export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    const snapshot = await getDocs(query(bookingsCollection));
    const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
    return bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error fetching all bookings: ", error);
    return [];
  }
};

// Get booked time slots for a specific turf and date (returns individual slots for UI compatibility)
export const getBookedSlots = async (turfId: string, date: Date): Promise<string[]> => {
  const dateString = format(date, 'yyyy-MM-dd');
  try {
    const q = query(bookingsCollection, where("turfId", "==", turfId), where("date", "==", dateString));
    const snapshot = await getDocs(q);
    const allSlots: string[] = [];
    
    // Convert time ranges back to individual slots for UI compatibility
    snapshot.docs.forEach(doc => {
      const booking = doc.data() as Booking;
      
      // Handle new format with timeRange
      if (booking.startTime && booking.endTime) {
        const startHour = parseInt(booking.startTime.split(':')[0]);
        const endHour = parseInt(booking.endTime.split(':')[0]);
        
        // Generate individual slots from the range
        for (let hour = startHour; hour < endHour; hour++) {
          const slotStart = hour.toString().padStart(2, '0') + ':00';
          const slotEnd = (hour + 1).toString().padStart(2, '0') + ':00';
          allSlots.push(`${slotStart} - ${slotEnd}`);
        }
      } else if (booking.timeSlot) {
        // Handle old format with timeSlot
        allSlots.push(booking.timeSlot);
      }
    });
    
    return allSlots;
  } catch (error) {
    console.error("Error fetching booked slots: ", error);
    return [];
  }
};

// Add a new booking
export const addBooking = async (newBookingData: Omit<Booking, 'id'>): Promise<Booking> => {
  try {
    const docRef = await addDoc(bookingsCollection, newBookingData);
    return { id: docRef.id, ...newBookingData };
  } catch (error) {
    console.error("Error adding booking: ", error);
    throw error;
  }
};

// Delete a booking
export const deleteBooking = async (bookingId: string): Promise<void> => {
  try {
    const bookingDoc = doc(db, 'bookings', bookingId);
    await deleteDoc(bookingDoc);
  } catch (error) {
    console.error("Error deleting booking: ", error);
    throw error;
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId: string, status: 'pending' | 'confirmed'): Promise<void> => {
  try {
    const bookingDoc = doc(db, 'bookings', bookingId);
    await updateDoc(bookingDoc, { status });
  } catch (error) {
    console.error("Error updating booking status: ", error);
    throw error;
  }
};
