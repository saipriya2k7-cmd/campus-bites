import { FoodItem, CanteenInfo, Category } from '../types';

export interface SlotDefinition {
  id: 'morning' | 'afternoon' | 'evening';
  name: string;
  shortLabel: string;
  defaultStart: string; // 24h format "07:30"
  defaultEnd: string;   // 24h format "11:30"
  popularDishes: string;
  recommendedCategories: Category[];
  description: string;
}

export const CANTEEN_MEAL_SLOTS: Record<'morning' | 'afternoon' | 'evening', SlotDefinition> = {
  morning: {
    id: 'morning',
    name: 'Morning (Breakfast & Beverages)',
    shortLabel: 'Morning',
    defaultStart: '07:30',
    defaultEnd: '11:30',
    popularDishes: 'Mysore Masala Dosa, Egg Bhurji Pav, Poha, Filter Coffee, Hot Chai',
    recommendedCategories: ['Breakfast', 'South Indian', 'Beverages'],
    description: 'Freshly steamed idlis, crispy dosas, egg bhurji, and energizing campus chai'
  },
  afternoon: {
    id: 'afternoon',
    name: 'Afternoon (Lunch & Meals)',
    shortLabel: 'Afternoon',
    defaultStart: '11:30',
    defaultEnd: '15:30',
    popularDishes: 'Special Thali, Dum Chicken Biryani, Chole Bhature, Egg Fried Rice',
    recommendedCategories: ['Meals', 'South Indian', 'Fast Food', 'Beverages'],
    description: 'Hot authentic lunch thalis, spiced biryani bowls, and filling afternoon plates'
  },
  evening: {
    id: 'evening',
    name: 'Evening (Snacks, Fast Food & Dinner)',
    shortLabel: 'Evening',
    defaultStart: '15:30',
    defaultEnd: '21:30',
    popularDishes: 'Crispy Samosa, Chicken Kathi Roll, Double Egg Maggi, Peri-Peri Fries, Cold Coffee',
    recommendedCategories: ['Snacks', 'Fast Food', 'Beverages', 'Desserts', 'Meals'],
    description: 'Evening tea-time snacks, crispy fries, wraps, shakes, and warm comfort dinner'
  }
};

/**
 * Convert "HH:MM" (24h) to minutes from midnight (0 to 1439)
 */
export function timeStringToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Format "14:30" into "02:30 PM"
 */
export function format24To12(timeStr: string): string {
  if (!timeStr || !timeStr.includes(':')) return timeStr;
  const [hStr, mStr] = timeStr.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr.padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${h.toString().padStart(2, '0')}:${m} ${ampm}`;
}

export interface ResolvedSlotInfo {
  activeSlotId: 'morning' | 'afternoon' | 'evening' | 'night';
  mode: 'auto' | 'morning' | 'afternoon' | 'evening';
  isAuto: boolean;
  activeLabel: string;
  activeTimeRange: string;
  nextSlotLabel: string;
  isKitchenOpen: boolean;
  slots: {
    id: 'morning' | 'afternoon' | 'evening';
    name: string;
    shortLabel: string;
    startTime: string;
    endTime: string;
    timeRangeFormatted: string;
    isActive: boolean;
    popularDishes: string;
  }[];
}

/**
 * Automatically determine active meal slot according to system clock,
 * or respect manual override if designated by cafeteria staff.
 */
export function getResolvedSlotInfo(
  canteenInfo?: CanteenInfo | null,
  currentDate: Date = new Date()
): ResolvedSlotInfo {
  const currentMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
  const mode = canteenInfo?.slotMode || 'auto';

  // Extract start and end times (either custom configured or defaults)
  const morningStart = canteenInfo?.customTimings?.morning?.start || CANTEEN_MEAL_SLOTS.morning.defaultStart;
  const morningEnd = canteenInfo?.customTimings?.morning?.end || CANTEEN_MEAL_SLOTS.morning.defaultEnd;

  const afternoonStart = canteenInfo?.customTimings?.afternoon?.start || CANTEEN_MEAL_SLOTS.afternoon.defaultStart;
  const afternoonEnd = canteenInfo?.customTimings?.afternoon?.end || CANTEEN_MEAL_SLOTS.afternoon.defaultEnd;

  const eveningStart = canteenInfo?.customTimings?.evening?.start || CANTEEN_MEAL_SLOTS.evening.defaultStart;
  const eveningEnd = canteenInfo?.customTimings?.evening?.end || CANTEEN_MEAL_SLOTS.evening.defaultEnd;

  const mStartMin = timeStringToMinutes(morningStart);
  const mEndMin = timeStringToMinutes(morningEnd);
  const aStartMin = timeStringToMinutes(afternoonStart);
  const aEndMin = timeStringToMinutes(afternoonEnd);
  const eStartMin = timeStringToMinutes(eveningStart);
  const eEndMin = timeStringToMinutes(eveningEnd);

  // Determine automatically active slot by time of day
  let autoSlotId: 'morning' | 'afternoon' | 'evening' | 'night' = 'night';
  let nextSlot = `Morning Breakfast (${format24To12(morningStart)} - ${format24To12(morningEnd)})`;

  if (currentMinutes >= mStartMin && currentMinutes < mEndMin) {
    autoSlotId = 'morning';
    nextSlot = `Afternoon Lunch (${format24To12(afternoonStart)} - ${format24To12(afternoonEnd)})`;
  } else if (currentMinutes >= aStartMin && currentMinutes < aEndMin) {
    autoSlotId = 'afternoon';
    nextSlot = `Evening Snacks & Dinner (${format24To12(eveningStart)} - ${format24To12(eveningEnd)})`;
  } else if (currentMinutes >= eStartMin && currentMinutes < eEndMin) {
    autoSlotId = 'evening';
    nextSlot = `Morning Breakfast Tomorrow (${format24To12(morningStart)} - ${format24To12(morningEnd)})`;
  } else if (currentMinutes < mStartMin) {
    // Early morning before breakfast
    autoSlotId = 'night';
    nextSlot = `Morning Breakfast Opens at ${format24To12(morningStart)}`;
  } else {
    // Late night after evening slot
    autoSlotId = 'night';
    nextSlot = `Morning Breakfast Opens at ${format24To12(morningStart)}`;
  }

  // Selected effective slot based on mode
  let effectiveSlotId: 'morning' | 'afternoon' | 'evening' | 'night' = autoSlotId;
  const isAuto = mode === 'auto';

  if (!isAuto && (mode === 'morning' || mode === 'afternoon' || mode === 'evening')) {
    effectiveSlotId = mode;
  }

  const isKitchenOpen = (canteenInfo?.isOpen ?? true) && (effectiveSlotId !== 'night' || !isAuto);

  let activeLabel = 'Cafeteria Closed';
  let activeTimeRange = 'Closed overnight';

  if (effectiveSlotId === 'morning') {
    activeLabel = 'Morning (Breakfast & Chai)';
    activeTimeRange = `${format24To12(morningStart)} - ${format24To12(morningEnd)}`;
  } else if (effectiveSlotId === 'afternoon') {
    activeLabel = 'Afternoon (Lunch & Hot Meals)';
    activeTimeRange = `${format24To12(afternoonStart)} - ${format24To12(afternoonEnd)}`;
  } else if (effectiveSlotId === 'evening') {
    activeLabel = 'Evening (Snacks, Dinner & Shakes)';
    activeTimeRange = `${format24To12(eveningStart)} - ${format24To12(eveningEnd)}`;
  }

  const slots = [
    {
      id: 'morning' as const,
      name: CANTEEN_MEAL_SLOTS.morning.name,
      shortLabel: 'Morning',
      startTime: morningStart,
      endTime: morningEnd,
      timeRangeFormatted: `${format24To12(morningStart)} - ${format24To12(morningEnd)}`,
      isActive: effectiveSlotId === 'morning',
      popularDishes: CANTEEN_MEAL_SLOTS.morning.popularDishes
    },
    {
      id: 'afternoon' as const,
      name: CANTEEN_MEAL_SLOTS.afternoon.name,
      shortLabel: 'Afternoon',
      startTime: afternoonStart,
      endTime: afternoonEnd,
      timeRangeFormatted: `${format24To12(afternoonStart)} - ${format24To12(afternoonEnd)}`,
      isActive: effectiveSlotId === 'afternoon',
      popularDishes: CANTEEN_MEAL_SLOTS.afternoon.popularDishes
    },
    {
      id: 'evening' as const,
      name: CANTEEN_MEAL_SLOTS.evening.name,
      shortLabel: 'Evening',
      startTime: eveningStart,
      endTime: eveningEnd,
      timeRangeFormatted: `${format24To12(eveningStart)} - ${format24To12(eveningEnd)}`,
      isActive: effectiveSlotId === 'evening',
      popularDishes: CANTEEN_MEAL_SLOTS.evening.popularDishes
    }
  ];

  return {
    activeSlotId: effectiveSlotId,
    mode,
    isAuto,
    activeLabel,
    activeTimeRange,
    nextSlotLabel: nextSlot,
    isKitchenOpen,
    slots
  };
}

/**
 * Filter or check whether a food item is relevant for a given meal timing
 */
export function isFoodSuitedForSlot(
  food: FoodItem,
  slotId: 'auto' | 'morning' | 'afternoon' | 'evening' | 'all',
  currentResolvedSlot: 'morning' | 'afternoon' | 'evening' | 'night'
): boolean {
  if (slotId === 'all') return true;

  const target = slotId === 'auto' 
    ? (currentResolvedSlot === 'night' ? 'morning' : currentResolvedSlot)
    : slotId;

  if (target === 'morning') {
    return (
      food.category === 'Breakfast' ||
      food.category === 'South Indian' ||
      food.category === 'Beverages' ||
      food.name.toLowerCase().includes('dosa') ||
      food.name.toLowerCase().includes('idli') ||
      food.name.toLowerCase().includes('bhurji') ||
      food.name.toLowerCase().includes('poha') ||
      food.name.toLowerCase().includes('chai') ||
      food.name.toLowerCase().includes('coffee')
    );
  }

  if (target === 'afternoon') {
    return (
      food.category === 'Meals' ||
      food.category === 'South Indian' ||
      food.category === 'Fast Food' ||
      food.category === 'Beverages' ||
      food.name.toLowerCase().includes('thali') ||
      food.name.toLowerCase().includes('biryani') ||
      food.name.toLowerCase().includes('rice') ||
      food.name.toLowerCase().includes('chole') ||
      food.name.toLowerCase().includes('curry') ||
      food.name.toLowerCase().includes('roll')
    );
  }

  if (target === 'evening') {
    return (
      food.category === 'Snacks' ||
      food.category === 'Fast Food' ||
      food.category === 'Beverages' ||
      food.category === 'Desserts' ||
      food.category === 'Meals' ||
      food.name.toLowerCase().includes('samosa') ||
      food.name.toLowerCase().includes('maggi') ||
      food.name.toLowerCase().includes('roll') ||
      food.name.toLowerCase().includes('fries') ||
      food.name.toLowerCase().includes('popcorn') ||
      food.name.toLowerCase().includes('jamun')
    );
  }

  return true;
}

/**
 * Parse preparation time strings like "2 mins", "5-7 mins", "12 mins", "instant"
 * into a numeric value in minutes for sorting and comparison.
 */
export function parsePrepTimeInMinutes(prepTimeStr: string | undefined): number {
  if (!prepTimeStr) return 999;
  const lower = prepTimeStr.toLowerCase().trim();
  if (lower.includes('instant') || lower.includes('ready')) return 0.5;

  const match = lower.match(/(\d+)(?:\s*-\s*(\d+))?/);
  if (!match) return 10; // default fallback

  const min = parseInt(match[1], 10);
  if (match[2]) {
    const max = parseInt(match[2], 10);
    return (min + max) / 2;
  }
  return min;
}
