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
  timeSlot: string;
  whatsappNumber: string;
  userId: string;
  userName: string;
  status?: 'pending' | 'confirmed'; // pending by default, admin changes to confirmed
  createdAt?: string;
};

const db = getFirestore(app);
const bookingsCollection = collection(db, 'bookings');

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

// Get booked time slots for a specific turf and date
export const getBookedSlots = async (turfId: string, date: Date): Promise<string[]> => {
  const dateString = format(date, 'yyyy-MM-dd');
  try {
    const q = query(bookingsCollection, where("turfId", "==", turfId), where("date", "==", dateString));
    const snapshot = await getDocs(q);
    const slots = snapshot.docs.map(doc => doc.data().timeSlot as string);
    return slots;
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
