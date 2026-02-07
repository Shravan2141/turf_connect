import type { Turf } from './types';

/**
 * Calculates the price for a given turf and time slot.
 * Prices are higher during peak hours (6 PM to 10 PM).
 */
export function getPriceForSlot(turf: Turf, slot: string): number {
    const isPeak = slot === '18:00 - 20:00' || slot === '20:00 - 22:00';

    if (isPeak) {
        if (turf.id === '2') {
            return 2000; // Special peak price for T2
        }
        return turf.price + 500; // 500 premium for peak hours on other turfs
    }

    return turf.price;
}
