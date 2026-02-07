import { getDay } from 'date-fns';
import type { Turf } from './types';

/**
 * Calculates the price for a given turf and time slot, considering day of the week.
 * Prices are higher during peak hours (6 PM to 10 PM) and on weekends.
 */
export function getPriceForSlot(turf: Turf, slot: string, date: Date | null | undefined): number {
    if (!date) {
        return turf.price;
    }

    const day = getDay(date); // Sunday = 0, Saturday = 6
    const isWeekend = day === 0 || day === 6;

    const isPeakTime = slot === '18:00 - 20:00' || slot === '20:00 - 22:00';
    
    let finalPrice = turf.price;

    if (isPeakTime) {
        finalPrice += 500; // 500 premium for peak hours
    }

    if (isWeekend) {
        finalPrice += 300; // 300 premium for weekends
    }

    return finalPrice;
}
