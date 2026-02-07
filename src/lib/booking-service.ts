'use client';

import { format } from 'date-fns';

export type Booking = {
  id: string;
  turfId: string;
  date: string; // YYYY-MM-DD format
  timeSlot: string;
  whatsappNumber: string;
};

const BOOKINGS_STORAGE_KEY = 'pavallion-bookings';

// Helper to get bookings from localStorage
const getStoredBookings = (): Booking[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  const stored = localStorage.getItem(BOOKINGS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Helper to save bookings to localStorage
const storeBookings = (bookings: Booking[]) => {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
};

// Get all bookings, sorted by date
export const getAllBookings = (): Booking[] => {
  return getStoredBookings().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Get booked time slots for a specific turf and date
export const getBookedSlots = (turfId: string, date: Date): string[] => {
  const dateString = format(date, 'yyyy-MM-dd');
  const allBookings = getStoredBookings();
  return allBookings
    .filter((b) => b.turfId === turfId && b.date === dateString)
    .map((b) => b.timeSlot);
};

// Add a new booking
export const addBooking = (newBooking: Omit<Booking, 'id'>): Booking => {
  const allBookings = getStoredBookings();
  const bookingWithId: Booking = {
    ...newBooking,
    id: `booking-${Date.now()}-${Math.random()}`,
  };
  const updatedBookings = [...allBookings, bookingWithId];
  storeBookings(updatedBookings);
  return bookingWithId;
};

// Delete a booking
export const deleteBooking = (bookingId: string): void => {
  const allBookings = getStoredBookings();
  const updatedBookings = allBookings.filter((b) => b.id !== bookingId);
  storeBookings(updatedBookings);
};
