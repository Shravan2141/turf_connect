import { z } from 'zod';

export const bookingSchema = z.object({
  date: z.date({
    required_error: 'A date is required.',
  }),
  timeSlot: z.string({ required_error: 'Please select a time slot.' }).min(1, 'Please select a time slot.'),
  whatsappNumber: z
    .string()
    .min(10, 'Please enter a valid WhatsApp number.')
    .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format.'),
});
