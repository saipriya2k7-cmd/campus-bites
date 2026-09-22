import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { FoodItem, Review, CanteenInfo, AvailabilityStatus, DietaryType, PlacedOrder } from '../types';
import { INITIAL_FOODS, INITIAL_REVIEWS } from '../data/initialData';
import { sanitizeFoodImageUrl } from '../utils/imageUtils';
import { isProminentNonVegFood, enforceDietaryIntegrity } from '../utils/dietaryValidation';

const FOODS_COLLECTION = 'foods';
const REVIEWS_COLLECTION = 'reviews';
const ORDERS_COLLECTION = 'orders';
const CANTEEN_INFO_DOC = 'settings/canteen_info';

// Local storage backup keys
const LS_FOODS = 'campus_bites_foods_v2';
const LS_REVIEWS = 'campus_bites_reviews_v1';
const LS_CANTEEN = 'campus_bites_canteen_v1';
const LS_ORDERS = 'campus_bites_orders_v1';

export const DEFAULT_CANTEEN_INFO: CanteenInfo = {
  isOpen: true,
  slotMode: 'auto',
  currentSlot: 'Auto Meal Timing (Synced with Clock)',
  nextSlot: 'Upcoming Meal Shift',
  notice: '🎉 Student Special: Double Egg Bhurji Pav & Filter Coffee combo at ₹65!',
  rushLevel: 'moderate',
  customTimings: {
    morning: { start: '07:30', end: '11:30' },
    afternoon: { start: '11:30', end: '15:30' },
    evening: { start: '15:30', end: '21:30' }
  }
};

// Helper to normalize and heal food items
export function normalizeFoodItem(raw: any): FoodItem {
  // Enforce dietary integrity: dishes containing chicken, mutton, or meat are locked as non_veg
  const dietaryCheck = enforceDietaryIntegrity({
    name: raw.name || '',
    description: raw.description || '',
    dietary: raw.dietary,
    isVeg: raw.isVeg
  });

  const dietary: DietaryType = dietaryCheck.dietary;
  const isVeg = dietaryCheck.isVeg;

  // Sanitize image URLs with authentic distinct CDN photos
  const imageUrl = sanitizeFoodImageUrl(raw.imageUrl, raw.category, dietary, raw.name);

  return {
    ...raw,
    dietary,
    isVeg,
    imageUrl,
    availability: raw.availability || 'in_stock',
    rating: typeof raw.rating === 'number' ? raw.rating : 4.8,
    reviewsCount: typeof raw.reviewsCount === 'number' ? raw.reviewsCount : 10,
    ratingTotal: typeof raw.ratingTotal === 'number' ? raw.ratingTotal : (raw.rating || 4.8) * (raw.reviewsCount || 10),
    cravings: Array.isArray(raw.cravings) ? raw.cravings : ['Quick Bite (<5 mins)']
  };
}

export function mergeAndNormalizeFoods(items: any[]): FoodItem[] {
  const normalized = items.map(normalizeFoodItem);
  const existingIds = new Set(normalized.map((f) => f.id));
  
  // Ensure default curated egg & non-veg items exist so students can experience all dietary sections
  for (const init of INITIAL_FOODS) {
    if (!existingIds.has(init.id)) {
      normalized.push(init);
    }
  }
  return normalized;
}

// Seed initial foods into Firestore if collection is empty
export async function seedInitialDataIfEmpty(): Promise<void> {
  try {
    const snap = await getDocs(collection(db, FOODS_COLLECTION));
    if (snap.empty) {
      console.log('Seeding initial campus canteen menu to Firestore...');
      const batch = writeBatch(db);
      for (const item of INITIAL_FOODS) {
        const itemRef = doc(db, FOODS_COLLECTION, item.id);
        batch.set(itemRef, item);
      }
      for (const rev of INITIAL_REVIEWS) {
        const revRef = doc(db, REVIEWS_COLLECTION, rev.id);
        batch.set(revRef, { ...rev, timestamp: serverTimestamp() });
      }
      const canteenRef = doc(db, 'settings', 'canteen_info');
      batch.set(canteenRef, DEFAULT_CANTEEN_INFO);
      await batch.commit();
    }
  } catch (err) {
    console.warn('Firestore seeding notice (using local storage fallback):', err);
    if (!localStorage.getItem(LS_FOODS)) {
      localStorage.setItem(LS_FOODS, JSON.stringify(INITIAL_FOODS));
    }
    if (!localStorage.getItem(LS_REVIEWS)) {
      localStorage.setItem(LS_REVIEWS, JSON.stringify(INITIAL_REVIEWS));
    }
    if (!localStorage.getItem(LS_CANTEEN)) {
      localStorage.setItem(LS_CANTEEN, JSON.stringify(DEFAULT_CANTEEN_INFO));
    }
  }
}

// Subscribe to real-time foods list
export function subscribeToFoods(
  onUpdate: (items: FoodItem[]) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const q = collection(db, FOODS_COLLECTION);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: FoodItem[] = [];
          snapshot.forEach((docSnap) => {
            const rawData: any = { id: docSnap.id, ...docSnap.data() };
            const item = normalizeFoodItem(rawData);
            items.push(item);
            // Proactively heal in Firestore if old fish photo was stored
            if (item.id === 'food-gulab-jamun' && (rawData.imageUrl?.includes('1599488615731') || rawData.imageUrl?.includes('1601050690113'))) {
              updateDoc(doc(db, FOODS_COLLECTION, 'food-gulab-jamun'), { imageUrl: '/assets/gulab_jamun.jpg' }).catch(() => {});
            }
          });
          const merged = mergeAndNormalizeFoods(items);
          localStorage.setItem(LS_FOODS, JSON.stringify(merged));
          onUpdate(merged);
        } else {
          seedInitialDataIfEmpty();
          const cached = localStorage.getItem(LS_FOODS);
          const list = cached ? mergeAndNormalizeFoods(JSON.parse(cached)) : INITIAL_FOODS;
          onUpdate(list);
        }
      },
      (error) => {
        console.warn('Firestore snapshot error, falling back to local storage:', error);
        const cached = localStorage.getItem(LS_FOODS);
        const list = cached ? mergeAndNormalizeFoods(JSON.parse(cached)) : INITIAL_FOODS;
        onUpdate(list);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (err) {
    const cached = localStorage.getItem(LS_FOODS);
    const list = cached ? mergeAndNormalizeFoods(JSON.parse(cached)) : INITIAL_FOODS;
    onUpdate(list);
    return () => {};
  }
}

// Subscribe to real-time reviews list
export function subscribeToReviews(
  onUpdate: (reviews: Review[]) => void
): () => void {
  try {
    const q = query(collection(db, REVIEWS_COLLECTION), limit(50));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const reviews: Review[] = [];
          snapshot.forEach((docSnap) => {
            reviews.push({ id: docSnap.id, ...(docSnap.data() as Omit<Review, 'id'>) });
          });
          localStorage.setItem(LS_REVIEWS, JSON.stringify(reviews));
          onUpdate(reviews);
        } else {
          const cached = localStorage.getItem(LS_REVIEWS);
          onUpdate(cached ? JSON.parse(cached) : INITIAL_REVIEWS);
        }
      },
      (error) => {
        console.warn('Firestore reviews snapshot fallback:', error);
        const cached = localStorage.getItem(LS_REVIEWS);
        onUpdate(cached ? JSON.parse(cached) : INITIAL_REVIEWS);
      }
    );
    return unsubscribe;
  } catch (err) {
    const cached = localStorage.getItem(LS_REVIEWS);
    onUpdate(cached ? JSON.parse(cached) : INITIAL_REVIEWS);
    return () => {};
  }
}

// Subscribe to Canteen Status
export function subscribeToCanteenInfo(
  onUpdate: (info: CanteenInfo) => void
): () => void {
  try {
    const docRef = doc(db, 'settings', 'canteen_info');
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as CanteenInfo;
          localStorage.setItem(LS_CANTEEN, JSON.stringify(data));
          onUpdate(data);
        } else {
          const cached = localStorage.getItem(LS_CANTEEN);
          onUpdate(cached ? JSON.parse(cached) : DEFAULT_CANTEEN_INFO);
        }
      },
      (error) => {
        const cached = localStorage.getItem(LS_CANTEEN);
        onUpdate(cached ? JSON.parse(cached) : DEFAULT_CANTEEN_INFO);
      }
    );
    return unsubscribe;
  } catch (err) {
    const cached = localStorage.getItem(LS_CANTEEN);
    onUpdate(cached ? JSON.parse(cached) : DEFAULT_CANTEEN_INFO);
    return () => {};
  }
}

// Staff operations
export async function addFoodItem(food: Omit<FoodItem, 'id'>): Promise<string> {
  const id = 'food-' + Date.now();
  const newFood: FoodItem = normalizeFoodItem({ ...food, id });
  try {
    await setDoc(doc(db, FOODS_COLLECTION, id), newFood);
  } catch (e) {
    console.warn('Saved food to local storage fallback');
  }
  // update local cache as well
  const cached = localStorage.getItem(LS_FOODS);
  const list = cached ? JSON.parse(cached) : INITIAL_FOODS;
  list.unshift(newFood);
  localStorage.setItem(LS_FOODS, JSON.stringify(list));
  return id;
}

export async function updateFoodItem(id: string, updates: Partial<FoodItem>): Promise<void> {
  const cached = localStorage.getItem(LS_FOODS);
  let existingItem: FoodItem | undefined;
  let currentList: FoodItem[] = [];
  if (cached) {
    try {
      currentList = JSON.parse(cached);
      existingItem = currentList.find((item) => item.id === id);
    } catch (e) {}
  }

  const checkName = updates.name !== undefined ? updates.name : (existingItem?.name || '');
  const checkDesc = updates.description !== undefined ? updates.description : (existingItem?.description || '');

  // Strictly enforce non-veg lock: dishes containing chicken, mutton, or meat cannot be changed to veg
  if (isProminentNonVegFood(checkName, checkDesc)) {
    updates.dietary = 'non_veg';
    updates.isVeg = false;
  } else if (updates.dietary) {
    updates.isVeg = updates.dietary === 'veg';
  }

  if (updates.imageUrl) {
    updates.imageUrl = sanitizeFoodImageUrl(updates.imageUrl, updates.category, updates.dietary, checkName);
  }

  try {
    await updateDoc(doc(db, FOODS_COLLECTION, id), updates);
  } catch (e) {
    console.warn('Updated food in local storage fallback');
  }

  if (currentList.length > 0) {
    const updated = currentList.map((item) => (item.id === id ? { ...item, ...updates } : item));
    localStorage.setItem(LS_FOODS, JSON.stringify(updated));
  }
}

export async function deleteFoodItem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, FOODS_COLLECTION, id));
  } catch (e) {
    console.warn('Deleted food from local storage fallback');
  }
  const cached = localStorage.getItem(LS_FOODS);
  if (cached) {
    const list: FoodItem[] = JSON.parse(cached);
    const filtered = list.filter((item) => item.id !== id);
    localStorage.setItem(LS_FOODS, JSON.stringify(filtered));
  }
}

export async function updateFoodAvailability(id: string, availability: AvailabilityStatus): Promise<void> {
  return updateFoodItem(id, { availability });
}

export async function updateFoodPrice(id: string, price: number): Promise<void> {
  return updateFoodItem(id, { price });
}

export async function toggleFoodSpecial(
  id: string,
  isSpecial: boolean,
  specialTag?: string
): Promise<void> {
  return updateFoodItem(id, {
    isSpecial,
    specialTag: isSpecial ? (specialTag || "🔥 Today's Special") : undefined
  });
}

export async function updateCanteenStatus(updates: Partial<CanteenInfo>): Promise<void> {
  try {
    await updateDoc(doc(db, 'settings', 'canteen_info'), updates);
  } catch (e) {
    console.warn('Saved canteen status to local fallback');
  }
  const cached = localStorage.getItem(LS_CANTEEN);
  const current = cached ? JSON.parse(cached) : DEFAULT_CANTEEN_INFO;
  localStorage.setItem(LS_CANTEEN, JSON.stringify({ ...current, ...updates }));
}

// Student Review submission
export async function submitStudentReview(
  foodId: string,
  foodName: string,
  studentName: string,
  studentYear: string,
  rating: number,
  comment: string,
  tag: string
): Promise<void> {
  const revId = 'rev-' + Date.now();
  const newReview: Review = {
    id: revId,
    foodId,
    foodName,
    studentName,
    studentYear,
    rating,
    comment,
    tag,
    createdAt: 'Just now'
  };

  try {
    await setDoc(doc(db, REVIEWS_COLLECTION, revId), newReview);
  } catch (e) {
    console.warn('Review saved to local fallback');
  }

  // Update local reviews
  const cachedRev = localStorage.getItem(LS_REVIEWS);
  const revList = cachedRev ? JSON.parse(cachedRev) : INITIAL_REVIEWS;
  revList.unshift(newReview);
  localStorage.setItem(LS_REVIEWS, JSON.stringify(revList));

  // Update food rating calculation
  const cachedFoods = localStorage.getItem(LS_FOODS);
  if (cachedFoods) {
    const foods: FoodItem[] = JSON.parse(cachedFoods);
    const item = foods.find((f) => f.id === foodId);
    if (item) {
      const newTotal = (item.ratingTotal || item.rating * item.reviewsCount) + rating;
      const newCount = item.reviewsCount + 1;
      const newAvg = Number((newTotal / newCount).toFixed(1));
      await updateFoodItem(foodId, {
        rating: newAvg,
        reviewsCount: newCount,
        ratingTotal: newTotal
      });
    }
  }
}

// -------------------------------------------------------------
// Live Orders Management (Real-time sync between Student & Chef)
// -------------------------------------------------------------

export function broadcastKitchenOrder(order: PlacedOrder) {
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const channel = new BroadcastChannel('campus_bites_kitchen_orders');
      channel.postMessage({ type: 'NEW_ORDER_RECEIVED', order });
      channel.close();
    }
  } catch (e) {
    // Non-fatal if unsupported
  }
}

export async function createPlacedOrder(order: PlacedOrder): Promise<void> {
  // Update local storage first for instant feedback
  const cachedOrders = localStorage.getItem(LS_ORDERS);
  const orderList: PlacedOrder[] = cachedOrders ? JSON.parse(cachedOrders) : [];
  orderList.unshift(order);
  localStorage.setItem(LS_ORDERS, JSON.stringify(orderList));

  // Instant broadcast to chef's panel
  broadcastKitchenOrder(order);

  // Sync to Firestore
  try {
    await setDoc(doc(db, ORDERS_COLLECTION, order.id), {
      ...order,
      createdAt: order.createdAt || Date.now()
    });
  } catch (e) {
    console.warn('Order saved to local storage fallback:', e);
  }
}

export function subscribeToOrders(
  onUpdate: (orders: PlacedOrder[]) => void
): () => void {
  try {
    const q = query(collection(db, ORDERS_COLLECTION), limit(60));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const orders: PlacedOrder[] = [];
          snapshot.forEach((docSnap) => {
            orders.push({ id: docSnap.id, ...(docSnap.data() as Omit<PlacedOrder, 'id'>) });
          });
          // Sort descending by creation timestamp
          orders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
          onUpdate(orders);
        } else {
          const cached = localStorage.getItem(LS_ORDERS);
          onUpdate(cached ? JSON.parse(cached) : []);
        }
      },
      (error) => {
        console.warn('Firestore orders snapshot fallback to local cache:', error);
        const cached = localStorage.getItem(LS_ORDERS);
        onUpdate(cached ? JSON.parse(cached) : []);
      }
    );
    return unsubscribe;
  } catch (err) {
    const cached = localStorage.getItem(LS_ORDERS);
    onUpdate(cached ? JSON.parse(cached) : []);
    return () => {};
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: PlacedOrder['status']
): Promise<void> {
  // Local cache update
  const cached = localStorage.getItem(LS_ORDERS);
  if (cached) {
    const orders: PlacedOrder[] = JSON.parse(cached);
    const updated = orders.map((ord) => (ord.id === orderId ? { ...ord, status } : ord));
    localStorage.setItem(LS_ORDERS, JSON.stringify(updated));
  }

  // Firestore update
  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), { status });
  } catch (err) {
    console.warn('Firestore update order status fallback:', err);
  }
}

export async function markOrderNotified(orderId: string): Promise<void> {
  const cached = localStorage.getItem(LS_ORDERS);
  if (cached) {
    const orders: PlacedOrder[] = JSON.parse(cached);
    const updated = orders.map((ord) => (ord.id === orderId ? { ...ord, notifiedToChef: true } : ord));
    localStorage.setItem(LS_ORDERS, JSON.stringify(updated));
  }

  try {
    await updateDoc(doc(db, ORDERS_COLLECTION, orderId), { notifiedToChef: true });
  } catch (err) {
    console.warn('Firestore mark order notified fallback:', err);
  }
}

