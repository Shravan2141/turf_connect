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

    // Extract the start hour from the slot (format: HH:MM - HH:MM)
    const startHourString = slot.split(':')[0];
    const startHour = parseInt(startHourString, 10);
    
    // Peak hours are 6 PM to 10 PM (18:00 to 23:00)
    const isPeakTime = startHour >= 18 && startHour <= 23;
    
    let finalPrice = turf.price;

    if (isPeakTime) {
        finalPrice += 500; // 500 premium for peak hours (6 PM to 10 PM)
    }

    if (isWeekend) {
        finalPrice += 300; // 300 premium for weekends
    }

    return finalPrice;
}

/**
 * Calculates total price for a time range by summing individual slot prices
 * Handles overnight ranges like 23:00 - 24:00 correctly
 */
export function getPriceForTimeRange(turf: Turf, startTime: string, endTime: string, date: Date | null | undefined): number {
    if (!date) {
        return turf.price;
    }

    const startHour = parseInt(startTime.split(':')[0]);
    const endHour = parseInt(endTime.split(':')[0]);
    
    let totalPrice = 0;
    let currentHour = startHour;
    
    // Handle overnight ranges (e.g., 23:00 - 24:00)
    do {
        const slotStart = currentHour.toString().padStart(2, '0') + ':00';
        const slotEnd = ((currentHour + 1) % 24).toString().padStart(2, '0') + ':00';
        const slot = `${slotStart} - ${slotEnd}`;
        totalPrice += getPriceForSlot(turf, slot, date);
        
        currentHour = (currentHour + 1) % 24;
    } while (currentHour !== endHour);
    
    return totalPrice;
}
