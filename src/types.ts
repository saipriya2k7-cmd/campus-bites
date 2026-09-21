export type Category = 
  | 'All'
  | 'Breakfast'
  | 'Snacks'
  | 'Meals'
  | 'South Indian'
  | 'Fast Food'
  | 'Beverages'
  | 'Desserts';

export type AvailabilityStatus = 'in_stock' | 'making_fresh' | 'sold_out';

export type DietaryType = 'veg' | 'egg' | 'non_veg';

export interface FoodItem {
  id: string;
  name: string;
  category: Category;
  price: number;
  description: string;
  imageUrl: string;
  dietary: DietaryType;
  isVeg: boolean; // maintained for backward compatibility
  isSpecial: boolean;
  specialTag?: string;
  availability: AvailabilityStatus;
  prepTime: string;
  calories?: number;
  spiceLevel: 0 | 1 | 2 | 3;
  cravings: string[];
  rating: number;
  reviewsCount: number;
  ratingTotal: number;
  popularCombo?: string;
  orderCount?: number;
}

export interface Review {
  id: string;
  foodId: string;
  foodName?: string;
  studentName: string;
  studentYear: string;
  rating: number;
  comment: string;
  tag: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'staff';
  studentId?: string;
  favoriteIds?: string[];
}

export type MealSlotId = 'auto' | 'morning' | 'afternoon' | 'evening' | 'all';

export interface SlotConfigItem {
  id: 'morning' | 'afternoon' | 'evening';
  label: string;
  startTime: string; // e.g. "07:30"
  endTime: string;   // e.g. "11:30"
  popularItems: string;
}

export interface CanteenTimings {
  slot: string;
  time: string;
  icon: string;
  active: boolean;
}

export interface CanteenInfo {
  isOpen: boolean;
  slotMode?: 'auto' | 'morning' | 'afternoon' | 'evening';
  currentSlot: string;
  nextSlot: string;
  notice: string;
  rushLevel: 'low' | 'moderate' | 'high';
  customTimings?: {
    morning?: { start: string; end: string };
    afternoon?: { start: string; end: string };
    evening?: { start: string; end: string };
  };
}

export interface CartItem {
  food: FoodItem;
  quantity: number;
}

export interface PlacedOrder {
  id: string;
  tokenNumber: string;
  studentName: string;
  studentId?: string;
  studentNotes?: string;
  items: CartItem[];
  totalAmount: number;
  timestamp: string;
  createdAt: number;
  status: 'Pending' | 'Preparing' | 'Ready for Pickup' | 'Completed';
  estimatedMinutes: number;
  notifiedToChef?: boolean;
}
