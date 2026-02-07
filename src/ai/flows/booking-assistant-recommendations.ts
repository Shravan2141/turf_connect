'use server';

/**
 * @fileOverview Provides AI-powered recommendations for alternative booking times when the user's preferred time is unavailable.
 *
 * - bookingAssistantRecommendations - A function that takes in a desired booking time and returns recommendations for alternative times.
 * - BookingAssistantRecommendationsInput - The input type for the bookingAssistantRecommendations function.
 * - BookingAssistantRecommendationsOutput - The return type for the bookingAssistantRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BookingAssistantRecommendationsInputSchema = z.object({
  turfId: z.string().describe('The ID of the turf for which booking is requested.'),
  preferredStartTime: z.string().describe('The preferred start time for the booking (e.g., "2024-04-15T18:00:00Z").'),
  preferredEndTime: z.string().describe('The preferred end time for the booking (e.g., "2024-04-15T20:00:00Z").'),
  userId: z.string().describe('The ID of the user making the booking request.'),
});

export type BookingAssistantRecommendationsInput = z.infer<typeof BookingAssistantRecommendationsInputSchema>;

const BookingAssistantRecommendationsOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      startTime: z.string().describe('Recommended alternative start time.'),
      endTime: z.string().describe('Recommended alternative end time.'),
      reason: z.string().describe('The reason why this time is recommended.'),
    })
  ).describe('Array of recommended alternative booking times.'),
});

export type BookingAssistantRecommendationsOutput = z.infer<typeof BookingAssistantRecommendationsOutputSchema>;

export async function bookingAssistantRecommendations(input: BookingAssistantRecommendationsInput): Promise<BookingAssistantRecommendationsOutput> {
  return bookingAssistantRecommendationsFlow(input);
}

const bookingAssistantRecommendationsPrompt = ai.definePrompt({
  name: 'bookingAssistantRecommendationsPrompt',
  input: {schema: BookingAssistantRecommendationsInputSchema},
  output: {schema: BookingAssistantRecommendationsOutputSchema},
  prompt: `You are a booking assistant for a turf booking website.
  The user wants to book turf with ID {{turfId}} from {{preferredStartTime}} to {{preferredEndTime}} but it is unavailable.
  Recommend 3 alternative booking times for the user, taking into account the user's ID {{userId}}, the turf's availability, the user's previous bookings, and preferences of users with similar booking patterns.
  Explain why you are recommending each time.
  Respond in the following JSON format:
  { 
    "recommendations": [
      {
        "startTime": "Recommended alternative start time",
        "endTime": "Recommended alternative end time",
        "reason": "The reason why this time is recommended"
      }
    ]
  }
`,
});

const bookingAssistantRecommendationsFlow = ai.defineFlow(
  {
    name: 'bookingAssistantRecommendationsFlow',
    inputSchema: BookingAssistantRecommendationsInputSchema,
    outputSchema: BookingAssistantRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await bookingAssistantRecommendationsPrompt(input);
    return output!;
  }
);
