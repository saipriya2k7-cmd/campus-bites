import { DietaryType } from '../types';

/**
 * Prominent non-vegetarian keywords (poultry, mutton, red meat, seafood).
 * Dishes containing any of these keywords are locked as Non-Veg and CANNOT
 * be changed to Vegetarian under any circumstances—even by kitchen staff/chefs.
 */
export const PROMINENT_NON_VEG_KEYWORDS = [
  'chicken',
  'mutton',
  'gosht',
  'murgh',
  'fish',
  'prawn',
  'prawns',
  'shrimp',
  'crab',
  'lobster',
  'seafood',
  'beef',
  'pork',
  'bacon',
  'ham',
  'lamb',
  'keema',
  'kheema',
  'meat',
  'pepperoni',
  'salami',
  'duck',
  'turkey'
];

/**
 * Egg/eggetarian indicators (cannot be classified as pure veg)
 */
export const EGG_KEYWORDS = [
  'egg',
  'eggs',
  'anda',
  'bhurji',
  'omelette',
  'omelet'
];

/**
 * Inspects name and description for prominent non-veg terms.
 * Uses regex with word boundaries to avoid false positives (e.g. "peacock" won't match, etc.)
 */
export function getMatchedNonVegTerm(name: string = '', description: string = ''): string | null {
  const combined = `${name} ${description}`.toLowerCase();
  for (const term of PROMINENT_NON_VEG_KEYWORDS) {
    const regex = new RegExp(`(^|[^a-z])${term}([^a-z]|$)`, 'i');
    if (regex.test(combined)) {
      return term;
    }
  }
  return null;
}

/**
 * Returns true if dish contains prominent meat/poultry/seafood
 */
export function isProminentNonVegFood(name: string = '', description: string = ''): boolean {
  return getMatchedNonVegTerm(name, description) !== null;
}

/**
 * Returns true if dish contains eggs (and not meat)
 */
export function isEggFood(name: string = '', description: string = ''): boolean {
  if (isProminentNonVegFood(name, description)) return false;
  const combined = `${name} ${description}`.toLowerCase();
  for (const term of EGG_KEYWORDS) {
    const regex = new RegExp(`(^|[^a-z])${term}([^a-z]|$)`, 'i');
    if (regex.test(combined)) {
      return true;
    }
  }
  return false;
}

/**
 * Guard check: Can the chef change or mark this dish as Vegetarian?
 * Strictly enforces that prominent non-veg foods (chicken, mutton, meat)
 * and egg foods CANNOT be changed to 'veg'.
 */
export function canChefChangeToVeg(
  name: string = '', 
  description: string = ''
): { allowed: boolean; reason?: string; matchedTerm?: string } {
  const nonVegTerm = getMatchedNonVegTerm(name, description);
  if (nonVegTerm) {
    const capitalized = nonVegTerm.charAt(0).toUpperCase() + nonVegTerm.slice(1);
    return {
      allowed: false,
      matchedTerm: nonVegTerm,
      reason: `🔒 Protected Non-Veg: Dishes containing ${capitalized} cannot be changed to Vegetarian. Campus food safety & dietary standards enforce strictly Non-Veg.`
    };
  }

  if (isEggFood(name, description)) {
    return {
      allowed: false,
      matchedTerm: 'egg',
      reason: '🔒 Protected Egg Dish: Dishes containing eggs cannot be classified as Pure Vegetarian.'
    };
  }

  return { allowed: true };
}

/**
 * Enforces correct dietary classification on any food object.
 * Guarantees that even if input has dietary='veg', any dish with chicken,
 * mutton, or meat is automatically overridden to 'non_veg' and isVeg=false.
 */
export function enforceDietaryIntegrity<T extends { name?: string; description?: string; dietary?: DietaryType; isVeg?: boolean }>(
  food: T
): T & { dietary: DietaryType; isVeg: boolean; isLockedNonVeg: boolean } {
  const nonVegTerm = getMatchedNonVegTerm(food.name || '', food.description || '');
  
  if (nonVegTerm) {
    return {
      ...food,
      dietary: 'non_veg',
      isVeg: false,
      isLockedNonVeg: true
    };
  }

  if (isEggFood(food.name || '', food.description || '')) {
    const currentDietary = food.dietary === 'non_veg' ? 'non_veg' : 'egg';
    return {
      ...food,
      dietary: currentDietary,
      isVeg: false,
      isLockedNonVeg: false
    };
  }

  const dietary: DietaryType = food.dietary || (food.isVeg ? 'veg' : 'non_veg');
  return {
    ...food,
    dietary,
    isVeg: dietary === 'veg',
    isLockedNonVeg: false
  };
}
