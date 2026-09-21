import React, { useState, useEffect } from 'react';
import { 
  ChefHat, 
  Plus, 
  Edit, 
  Trash2, 
  Flame, 
  TrendingUp, 
  Star, 
  AlertTriangle, 
  Check, 
  X, 
  IndianRupee, 
  Clock, 
  Layers, 
  Sparkles, 
  Lock, 
  Eye, 
  SlidersHorizontal, 
  RefreshCw,
  Sun,
  Sunrise,
  Sunset,
  Zap,
  CalendarCheck,
  Bell,
  Utensils,
  Volume2
} from 'lucide-react';
import { FoodItem, Category, AvailabilityStatus, CanteenInfo, DietaryType, PlacedOrder } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  addFoodItem, 
  updateFoodItem, 
  deleteFoodItem, 
  updateFoodAvailability, 
  updateFoodPrice, 
  toggleFoodSpecial,
  updateCanteenStatus
} from '../services/foodService';
import { DietaryBadge } from './DietaryBadge';
import { handleImageError, sanitizeFoodImageUrl } from '../utils/imageUtils';
import { getResolvedSlotInfo, CANTEEN_MEAL_SLOTS, format24To12 } from '../utils/timingUtils';
import { 
  isProminentNonVegFood, 
  canChefChangeToVeg, 
  getMatchedNonVegTerm, 
  isEggFood 
} from '../utils/dietaryValidation';
import { KitchenOrdersQueue } from './KitchenOrdersQueue';
import { playOrderAlertChime } from '../utils/audioAlert';

interface StaffPanelProps {
  foods: FoodItem[];
  canteenInfo: CanteenInfo;
  orders?: PlacedOrder[];
  onViewStudentMenu: () => void;
  onUpdateOrderStatus?: (orderId: string, status: PlacedOrder['status']) => void;
  onOpenNotificationModal?: (order: PlacedOrder) => void;
  initialTab?: 'menu' | 'orders';
}

const CATEGORIES: Category[] = [
  'Breakfast',
  'Snacks',
  'Meals',
  'South Indian',
  'Fast Food',
  'Beverages',
  'Desserts'
];

const PRESET_FOOD_IMAGES = [
  { label: '🟢 Samosa / Puffs', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80', dietary: 'veg' },
  { label: '🟢 Dosa / Idli', url: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80', dietary: 'veg' },
  { label: '🟢 Veg Maggi / Noodles', url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80', dietary: 'veg' },
  { label: '🟢 Paneer Roll / Wrap', url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80', dietary: 'veg' },
  { label: '🟢 Chole / Curries', url: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80', dietary: 'veg' },
  { label: '🟢 Peri Peri Fries', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80', dietary: 'veg' },
  { label: '🟢 Gulab Jamun / Sweet', url: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80', dietary: 'veg' },
  { label: '🟢 Veg Biryani / Pulao', url: '/assets/veg_biryani.jpg', dietary: 'veg' },
  { label: '🟡 Egg Bhurji / Pav', url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80', dietary: 'egg' },
  { label: '🟡 Egg Maggi / Noodles', url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80', dietary: 'egg' },
  { label: '🟡 Egg Fried Rice', url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80', dietary: 'egg' },
  { label: '🟡 Egg Roll', url: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80', dietary: 'egg' },
  { label: '🔴 Chicken Biryani Bowl', url: '/assets/chicken_biryani.jpg', dietary: 'non_veg' },
  { label: '🔴 Chicken Popcorn / Bites', url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80', dietary: 'non_veg' },
  { label: '🔴 Chicken Tikka Roll', url: '/assets/smoked_chicken_tikka.jpg', dietary: 'non_veg' },
  { label: '☕ Chai / Coffee', url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', dietary: 'veg' },
  { label: '🥤 Cold Coffee / Shake', url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80', dietary: 'veg' }
];

export const StaffPanel: React.FC<StaffPanelProps> = ({
  foods,
  canteenInfo,
  orders = [],
  onViewStudentMenu,
  onUpdateOrderStatus = () => {},
  onOpenNotificationModal,
  initialTab = 'menu'
}) => {
  const { isStaff, loginAsStaff } = useAuth();
  const [activeViewTab, setActiveViewTab] = useState<'menu' | 'orders'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveViewTab(initialTab);
    }
  }, [initialTab]);

  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;
  const activeOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;
  const latestPendingOrder = orders.find(o => o.status === 'Pending');

  const [passcodeInput, setPasscodeInput] = useState('');
  const [passError, setPassError] = useState('');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [deletingFood, setDeletingFood] = useState<FoodItem | null>(null);

  // Price popover edit state
  const [quickPriceFoodId, setQuickPriceFoodId] = useState<string | null>(null);
  const [quickPriceVal, setQuickPriceVal] = useState<number>(0);

  // Form states for Add / Edit
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Snacks');
  const [price, setPrice] = useState<number>(40);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_FOOD_IMAGES[0].url);
  const [dietary, setDietary] = useState<DietaryType>('veg');
  const [prepTime, setPrepTime] = useState('5 mins');
  const [spiceLevel, setSpiceLevel] = useState<0 | 1 | 2 | 3>(1);
  const [availability, setAvailability] = useState<AvailabilityStatus>('in_stock');
  const [isSpecial, setIsSpecial] = useState(false);
  const [specialTag, setSpecialTag] = useState("🔥 Today's Special");
  const [cravingsStr, setCravingsStr] = useState('Crispy & Crunchy, Quick Bite (<5 mins)');
  const [isSaving, setIsSaving] = useState(false);
  const [dietaryWarning, setDietaryWarning] = useState<string | null>(null);

  // Non-veg and egg protection logic
  const isLockedNonVeg = isProminentNonVegFood(name, description);
  const matchedNonVegTerm = getMatchedNonVegTerm(name, description);
  const isLockedEgg = !isLockedNonVeg && isEggFood(name, description);

  // Auto-lock dietary classification to Non-Veg when chicken/mutton/meat is typed
  useEffect(() => {
    if (isLockedNonVeg && dietary !== 'non_veg') {
      setDietary('non_veg');
      const term = matchedNonVegTerm ? matchedNonVegTerm.toUpperCase() : 'MEAT/POULTRY';
      setDietaryWarning(`🔒 Non-veg ingredient detected (${term}). Locked to Non-Veg as per campus dietary regulations.`);
    }
  }, [name, description, isLockedNonVeg, matchedNonVegTerm]);

  // Filter state for staff table
  const [tableDietaryFilter, setTableDietaryFilter] = useState<'all' | 'veg' | 'egg' | 'non_veg'>('all');

  // Timings and meal slots management state
  const [slotMode, setSlotMode] = useState<'auto' | 'morning' | 'afternoon' | 'evening'>(
    canteenInfo.slotMode || 'auto'
  );
  const [morningStart, setMorningStart] = useState(
    canteenInfo.customTimings?.morning?.start || CANTEEN_MEAL_SLOTS.morning.defaultStart
  );
  const [morningEnd, setMorningEnd] = useState(
    canteenInfo.customTimings?.morning?.end || CANTEEN_MEAL_SLOTS.morning.defaultEnd
  );
  const [afternoonStart, setAfternoonStart] = useState(
    canteenInfo.customTimings?.afternoon?.start || CANTEEN_MEAL_SLOTS.afternoon.defaultStart
  );
  const [afternoonEnd, setAfternoonEnd] = useState(
    canteenInfo.customTimings?.afternoon?.end || CANTEEN_MEAL_SLOTS.afternoon.defaultEnd
  );
  const [eveningStart, setEveningStart] = useState(
    canteenInfo.customTimings?.evening?.start || CANTEEN_MEAL_SLOTS.evening.defaultStart
  );
  const [eveningEnd, setEveningEnd] = useState(
    canteenInfo.customTimings?.evening?.end || CANTEEN_MEAL_SLOTS.evening.defaultEnd
  );
  const [isSavingTimings, setIsSavingTimings] = useState(false);
  const [timingsSavedSuccess, setTimingsSavedSuccess] = useState(false);
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState('');

  // Keep internal state in sync with incoming canteenInfo
  useEffect(() => {
    if (canteenInfo.slotMode) setSlotMode(canteenInfo.slotMode);
    if (canteenInfo.customTimings?.morning?.start) setMorningStart(canteenInfo.customTimings.morning.start);
    if (canteenInfo.customTimings?.morning?.end) setMorningEnd(canteenInfo.customTimings.morning.end);
    if (canteenInfo.customTimings?.afternoon?.start) setAfternoonStart(canteenInfo.customTimings.afternoon.start);
    if (canteenInfo.customTimings?.afternoon?.end) setAfternoonEnd(canteenInfo.customTimings.afternoon.end);
    if (canteenInfo.customTimings?.evening?.start) setEveningStart(canteenInfo.customTimings.evening.start);
    if (canteenInfo.customTimings?.evening?.end) setEveningEnd(canteenInfo.customTimings.evening.end);
  }, [canteenInfo]);

  // Live system clock ticker for staff
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeDisplay(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save timing configuration to database
  const handleSaveTimings = async (overrideMode?: 'auto' | 'morning' | 'afternoon' | 'evening') => {
    setIsSavingTimings(true);
    const targetMode = overrideMode || slotMode;
    const updatedCustomTimings = {
      morning: { start: morningStart, end: morningEnd },
      afternoon: { start: afternoonStart, end: afternoonEnd },
      evening: { start: eveningStart, end: eveningEnd }
    };

    const simulatedInfo: CanteenInfo = {
      ...canteenInfo,
      slotMode: targetMode,
      customTimings: updatedCustomTimings
    };
    const resolved = getResolvedSlotInfo(simulatedInfo);

    await updateCanteenStatus({
      slotMode: targetMode,
      customTimings: updatedCustomTimings,
      currentSlot: resolved.activeLabel,
      nextSlot: resolved.nextSlotLabel
    });

    if (overrideMode) setSlotMode(overrideMode);
    setIsSavingTimings(false);
    setTimingsSavedSuccess(true);
    setTimeout(() => setTimingsSavedSuccess(false), 3000);
  };

  // Reset timings to campus standard preset
  const handleResetStandardTimings = () => {
    setMorningStart(CANTEEN_MEAL_SLOTS.morning.defaultStart);
    setMorningEnd(CANTEEN_MEAL_SLOTS.morning.defaultEnd);
    setAfternoonStart(CANTEEN_MEAL_SLOTS.afternoon.defaultStart);
    setAfternoonEnd(CANTEEN_MEAL_SLOTS.afternoon.defaultEnd);
    setEveningStart(CANTEEN_MEAL_SLOTS.evening.defaultStart);
    setEveningEnd(CANTEEN_MEAL_SLOTS.evening.defaultEnd);
  };

  // Current live resolution
  const liveSlotResolution = getResolvedSlotInfo(canteenInfo);

  // Staff unlock verification
  if (!isStaff) {
    return (
      <div className="max-w-md mx-auto my-14 p-6 sm:p-8 bg-white rounded-3xl shadow-xl border border-slate-200 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-800 ring-8 ring-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-200">
          <ChefHat className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 font-['Outfit']">
          Protected Staff Panel
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-6">
          Access is strictly restricted to campus canteen managers and chefs.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const ok = loginAsStaff(passcodeInput);
            if (!ok) setPassError('Incorrect staff passcode. Access denied.');
          }}
          className="space-y-3.5"
        >
          <div className="text-left">
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Staff Passcode
            </label>
            <input
              type="password"
              value={passcodeInput}
              onChange={(e) => {
                setPasscodeInput(e.target.value);
                setPassError('');
              }}
              placeholder="Enter staff security passcode"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
              autoComplete="current-password"
            />
            {passError && <p className="text-xs text-rose-600 mt-1.5 font-medium">{passError}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/20 transition-all cursor-pointer"
          >
            Unlock Staff Portal
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={onViewStudentMenu}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
          >
            ← Back to Student Menu
          </button>
        </div>
      </div>
    );
  }

  // Analytics metrics
  const totalItems = foods.length;
  const inStockCount = foods.filter((f) => f.availability === 'in_stock').length;
  const soldOutCount = foods.filter((f) => f.availability === 'sold_out').length;
  const specialsCount = foods.filter((f) => f.isSpecial).length;
  const vegCount = foods.filter((f) => f.dietary === 'veg').length;
  const eggCount = foods.filter((f) => f.dietary === 'egg').length;
  const nonVegCount = foods.filter((f) => f.dietary === 'non_veg').length;
  const avgRating = (
    foods.reduce((acc, f) => acc + f.rating, 0) / (totalItems || 1)
  ).toFixed(1);

  // Filtered foods for table
  const displayedFoods = foods.filter((f) => {
    if (tableDietaryFilter === 'all') return true;
    return f.dietary === tableDietaryFilter;
  });

  // Open add food modal
  const handleOpenAdd = () => {
    setName('');
    setCategory('Snacks');
    setPrice(40);
    setDescription('');
    setImageUrl(PRESET_FOOD_IMAGES[0].url);
    setDietary('veg');
    setPrepTime('5 mins');
    setSpiceLevel(1);
    setAvailability('in_stock');
    setIsSpecial(false);
    setSpecialTag("🔥 Today's Special");
    setCravingsStr('Crispy & Crunchy, Quick Bite (<5 mins)');
    setEditingFood(null);
    setDietaryWarning(null);
    setIsAddModalOpen(true);
  };

  // Open edit food modal
  const handleOpenEdit = (food: FoodItem) => {
    setEditingFood(food);
    setName(food.name);
    setCategory(food.category);
    setPrice(food.price);
    setDescription(food.description);
    setImageUrl(food.imageUrl);
    
    // Check if dish contains locked non-veg terms
    const isMeat = isProminentNonVegFood(food.name, food.description);
    const resolvedDietary: DietaryType = isMeat ? 'non_veg' : (food.dietary || (food.isVeg ? 'veg' : 'non_veg'));
    setDietary(resolvedDietary);
    
    if (isMeat) {
      const term = getMatchedNonVegTerm(food.name, food.description);
      setDietaryWarning(`🔒 This dish contains ${term}. It is strictly locked as Non-Veg and cannot be converted to Vegetarian.`);
    } else {
      setDietaryWarning(null);
    }

    setPrepTime(food.prepTime);
    setSpiceLevel(food.spiceLevel);
    setAvailability(food.availability);
    setIsSpecial(food.isSpecial);
    setSpecialTag(food.specialTag || "🔥 Today's Special");
    setCravingsStr(food.cravings?.join(', ') || '');
    setIsAddModalOpen(false);
  };

  // Save add/edit food
  const handleSaveFood = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Validate dietary classification integrity
    const vegCheck = canChefChangeToVeg(name, description);
    if (!vegCheck.allowed && dietary === 'veg') {
      setDietaryWarning(vegCheck.reason || "Dishes containing chicken, mutton, or meat cannot be marked as Pure Veg.");
      return;
    }

    setIsSaving(true);
    const cravingsArr = cravingsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const finalDietary: DietaryType = !vegCheck.allowed ? 'non_veg' : dietary;
      const sanitizedUrl = sanitizeFoodImageUrl(imageUrl, category, finalDietary, name);

      if (editingFood) {
        await updateFoodItem(editingFood.id, {
          name,
          category,
          price: Number(price),
          description,
          imageUrl: sanitizedUrl,
          dietary: finalDietary,
          isVeg: finalDietary === 'veg',
          prepTime,
          spiceLevel,
          availability,
          isSpecial,
          specialTag: isSpecial ? specialTag : undefined,
          cravings: cravingsArr
        });
        setEditingFood(null);
      } else {
        await addFoodItem({
          name,
          category,
          price: Number(price),
          description,
          imageUrl: sanitizedUrl,
          dietary: finalDietary,
          isVeg: finalDietary === 'veg',
          prepTime,
          spiceLevel,
          availability,
          isSpecial,
          specialTag: isSpecial ? specialTag : undefined,
          cravings: cravingsArr,
          rating: 5.0,
          reviewsCount: 1,
          ratingTotal: 5.0,
          orderCount: 1
        });
        setIsAddModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete food item
  const handleConfirmDelete = async () => {
    if (!deletingFood) return;
    try {
      await deleteFoodItem(deletingFood.id);
      setDeletingFood(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle availability cycle
  const handleCycleAvailability = async (id: string, current: AvailabilityStatus) => {
    const next: AvailabilityStatus = 
      current === 'in_stock' ? 'making_fresh' : current === 'making_fresh' ? 'sold_out' : 'in_stock';
    await updateFoodAvailability(id, next);
  };

  // Quick price save
  const handleSaveQuickPrice = async (id: string) => {
    if (quickPriceVal > 0) {
      await updateFoodPrice(id, quickPriceVal);
      setQuickPriceFoodId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-900/40">
              <ChefHat className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight text-white">
                  Canteen Staff Panel
                </h1>
                <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Manager Mode
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Kitchen Operations • Automatic Meal Shifts • Inventory Stock • Menu Pricing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              id="staff-add-food-btn"
              onClick={handleOpenAdd}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs font-['Outfit'] shadow-lg shadow-blue-600/25 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Food Item</span>
            </button>

            <button
              onClick={onViewStudentMenu}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-700"
            >
              <Eye className="w-4 h-4" />
              <span>Student View</span>
            </button>
          </div>
        </div>
      </div>

      {/* 🚨 Immediate Alert Banner for Chef when an order is received */}
      {latestPendingOrder && (
        <div 
          id="chef-live-pending-order-banner"
          className="bg-amber-500 text-slate-950 p-4 sm:p-5 rounded-3xl shadow-lg border-2 border-amber-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in slide-in-from-top-3 duration-300"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
              <Bell className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-slate-950 text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  🔔 New Order Received
                </span>
                <span className="text-xs font-mono font-black text-slate-900 bg-white/70 px-2 py-0.5 rounded-md">
                  Token #{latestPendingOrder.tokenNumber}
                </span>
                <span className="text-xs font-mono font-bold text-slate-900">
                  ID: {latestPendingOrder.id}
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-black font-['Outfit'] text-slate-950 mt-1">
                Order received from {latestPendingOrder.studentName}
              </h4>
              <p className="text-xs text-slate-900 font-semibold mt-0.5 line-clamp-1">
                Ordered: {latestPendingOrder.items.map(i => `${i.quantity}× ${i.food.name}`).join(', ')} • Total ₹{latestPendingOrder.totalAmount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              type="button"
              onClick={() => playOrderAlertChime()}
              className="px-3 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer border border-amber-600/30 flex items-center gap-1.5 shrink-0"
              title="Play chime sound"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Chime</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenNotificationModal && onOpenNotificationModal(latestPendingOrder)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-slate-950 text-white hover:bg-slate-900 font-black text-xs font-['Outfit'] shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Eye className="w-4 h-4 text-amber-300" />
              <span>Review Item List</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdateOrderStatus(latestPendingOrder.id, 'Preparing')}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 font-black text-xs font-['Outfit'] shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 text-white" />
              <span>Start Prep</span>
            </button>
          </div>
        </div>
      )}

      {/* 👨‍🍳 Chef Primary Navigation Tabs: Live Kitchen Orders vs Menu Management */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm">
        <button
          id="staff-tab-orders"
          type="button"
          onClick={() => setActiveViewTab('orders')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm font-['Outfit'] flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
            activeViewTab === 'orders'
              ? 'bg-burgundy-800 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-300" />
          <span>Live Kitchen Orders ({orders.length})</span>
          {pendingOrdersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-burgundy-950 font-black text-[11px] animate-bounce">
              {pendingOrdersCount} New
            </span>
          )}
        </button>

        <button
          id="staff-tab-menu"
          type="button"
          onClick={() => setActiveViewTab('menu')}
          className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm font-['Outfit'] flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeViewTab === 'menu'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Menu & Timings ({totalItems})</span>
        </button>
      </div>

      {activeViewTab === 'orders' ? (
        <KitchenOrdersQueue
          orders={orders}
          onUpdateOrderStatus={onUpdateOrderStatus}
          onOpenNotificationModal={onOpenNotificationModal}
        />
      ) : (
        <div className="space-y-6">
          {/* 📊 Basic Analytics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
            <button
              type="button"
              onClick={() => setActiveViewTab('orders')}
              className="bg-white p-4 rounded-2xl border border-burgundy-200 shadow-2xs hover:border-burgundy-400 text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-burgundy-800 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">🔔 Kitchen Orders</span>
                <Bell className="w-4 h-4 text-burgundy-800 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-2xl font-black text-burgundy-950 font-['Outfit']">{orders.length}</p>
              <span className="text-[10px] text-amber-700 font-bold">
                {pendingOrdersCount > 0 ? `${pendingOrdersCount} pending prep` : 'All caught up'}
              </span>
            </button>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">Total Menu</span>
                <Layers className="w-4 h-4" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-['Outfit']">{totalItems}</p>
              <span className="text-[10px] text-slate-500">Listed dishes</span>
            </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">🟢 Pure Veg</span>
            <span className="text-xs">🥦</span>
          </div>
          <p className="text-2xl font-black text-emerald-700 font-['Outfit']">{vegCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Vegetarian dishes</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">🟡 Egg Items</span>
            <span className="text-xs">🥚</span>
          </div>
          <p className="text-2xl font-black text-amber-700 font-['Outfit']">{eggCount}</p>
          <span className="text-[10px] text-amber-600 font-medium">Eggetarian dishes</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">🔴 Non-Veg</span>
            <span className="text-xs">🍗</span>
          </div>
          <p className="text-2xl font-black text-rose-700 font-['Outfit']">{nonVegCount}</p>
          <span className="text-[10px] text-rose-600 font-medium">Chicken & meat</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-red-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sold Out</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-red-600 font-['Outfit']">{soldOutCount}</p>
          <span className="text-[10px] text-red-500 font-medium">Exhausted stock</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-orange-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">🔥 Specials</span>
            <Flame className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-orange-600 font-['Outfit']">{specialsCount}</p>
          <span className="text-[10px] text-orange-600 font-medium">Highlighted banner</span>
        </div>
      </div>

      {/* ⏰ Cafeteria Timings & Meal Shift Manager */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
        {/* Top bar: Operational Status & System Clock */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-600/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 font-['Outfit']">
                  Cafeteria Timings & Shift Operations
                </h3>
                {currentTimeDisplay && (
                  <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                    Live: {currentTimeDisplay}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Current active slot: <span className="font-bold text-slate-900">{liveSlotResolution.activeLabel}</span> ({liveSlotResolution.activeTimeRange})
              </p>
            </div>
          </div>

          {/* Quick Open/Close and Rush Level */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => updateCanteenStatus({ isOpen: !canteenInfo.isOpen })}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
                canteenInfo.isOpen 
                  ? 'bg-slate-900 text-white hover:bg-slate-800' 
                  : 'bg-rose-600 text-white hover:bg-rose-700'
              }`}
            >
              {canteenInfo.isOpen ? '🟢 Kitchen Open for Orders' : '🔴 Kitchen Closed'}
            </button>

            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <span className="text-[11px] text-slate-400 px-1.5">Rush:</span>
              {(['low', 'moderate', 'high'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => updateCanteenStatus({ rushLevel: r })}
                  className={`px-2.5 py-1 rounded-lg text-xs capitalize cursor-pointer transition-all ${
                    canteenInfo.rushLevel === r
                      ? r === 'low'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : r === 'moderate'
                        ? 'bg-amber-600 text-white shadow-2xs'
                        : 'bg-rose-600 text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Meal Shift Mode Selector (Auto vs Manual) */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Shift Timing Mode:</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                slotMode === 'auto' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}>
                {slotMode === 'auto' ? '⚡ Automatic Clock Synced' : `📌 Manual Override (${slotMode})`}
              </span>
            </label>
            <span className="text-[11px] text-slate-400">
              Select 'Auto' to let the canteen shift automatically according to time of day
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleSaveTimings('auto')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                slotMode === 'auto'
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                  <Zap className="w-3.5 h-3.5 text-blue-600" />
                  <span>Automatic</span>
                </span>
                {slotMode === 'auto' && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                )}
              </div>
              <p className="text-[10px] text-slate-500">
                Follows system clock automatically
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSaveTimings('morning')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                slotMode === 'morning'
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                  <Sunrise className="w-3.5 h-3.5 text-amber-600" />
                  <span>Morning Shift</span>
                </span>
                {slotMode === 'morning' && (
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                )}
              </div>
              <p className="text-[10px] text-slate-500">
                Forces Morning (Breakfast) mode
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSaveTimings('afternoon')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                slotMode === 'afternoon'
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                  <Sun className="w-3.5 h-3.5 text-orange-500" />
                  <span>Afternoon Shift</span>
                </span>
                {slotMode === 'afternoon' && (
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                )}
              </div>
              <p className="text-[10px] text-slate-500">
                Forces Afternoon (Lunch) mode
              </p>
            </button>

            <button
              type="button"
              onClick={() => handleSaveTimings('evening')}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                slotMode === 'evening'
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                  <Sunset className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Evening Shift</span>
                </span>
                {slotMode === 'evening' && (
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                )}
              </div>
              <p className="text-[10px] text-slate-500">
                Forces Evening (Snacks/Dinner)
              </p>
            </button>
          </div>
        </div>

        {/* Slot Time Range Customizer */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Customize Meal Hours & Shifts</span>
            </h4>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetStandardTimings}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                Reset to Standard College Hours
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Morning Slot Box */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Sunrise className="w-3.5 h-3.5 text-amber-500" />
                  <span>Morning Shift</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {format24To12(morningStart)} - {format24To12(morningEnd)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Start Time</label>
                  <input
                    type="time"
                    value={morningStart}
                    onChange={(e) => setMorningStart(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">End Time</label>
                  <input
                    type="time"
                    value={morningEnd}
                    onChange={(e) => setMorningEnd(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Afternoon Slot Box */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-orange-500" />
                  <span>Afternoon Shift</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {format24To12(afternoonStart)} - {format24To12(afternoonEnd)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Start Time</label>
                  <input
                    type="time"
                    value={afternoonStart}
                    onChange={(e) => setAfternoonStart(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">End Time</label>
                  <input
                    type="time"
                    value={afternoonEnd}
                    onChange={(e) => setAfternoonEnd(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Evening Slot Box */}
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Sunset className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Evening Shift</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {format24To12(eveningStart)} - {format24To12(eveningEnd)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Start Time</label>
                  <input
                    type="time"
                    value={eveningStart}
                    onChange={(e) => setEveningStart(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">End Time</label>
                  <input
                    type="time"
                    value={eveningEnd}
                    onChange={(e) => setEveningEnd(e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded-lg bg-slate-50 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {timingsSavedSuccess && (
              <span className="text-xs font-bold text-blue-700 flex items-center gap-1 animate-in fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Timings saved & synced with student portal!</span>
              </span>
            )}
            <button
              type="button"
              disabled={isSavingTimings}
              onClick={() => handleSaveTimings()}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              {isSavingTimings ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Save & Update All Shift Hours</span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Management Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 font-['Outfit']">
              Food Menu Inventory ({displayedFoods.length})
            </h3>
            <p className="text-xs text-slate-400">
              Manage live availability, update prices, and designate Today's Specials
            </p>
          </div>

          {/* Dietary Filter Tabs for Staff */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setTableDietaryFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                tableDietaryFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              All ({foods.length})
            </button>
            <button
              onClick={() => setTableDietaryFilter('veg')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                tableDietaryFilter === 'veg' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              🟢 Veg ({vegCount})
            </button>
            <button
              onClick={() => setTableDietaryFilter('egg')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                tableDietaryFilter === 'egg' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              🟡 Egg ({eggCount})
            </button>
            <button
              onClick={() => setTableDietaryFilter('non_veg')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                tableDietaryFilter === 'non_veg' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-500'
              }`}
            >
              🔴 Non-Veg ({nonVegCount})
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="p-3.5 pl-5">Dish</th>
                <th className="p-3.5">Dietary</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Price (₹)</th>
                <th className="p-3.5">Live Availability</th>
                <th className="p-3.5">Today's Special</th>
                <th className="p-3.5 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {displayedFoods.map((item) => {
                const isQuickPrice = quickPriceFoodId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Dish name & image */}
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          onError={(e) => handleImageError(e, item.category, item.dietary)}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 shrink-0 border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm">
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">
                            Prep: {item.prepTime} • ★ {item.rating.toFixed(1)} ({item.reviewsCount})
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Dietary badge */}
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <DietaryBadge dietary={item.dietary} isVeg={item.isVeg} showText={true} />
                        {isProminentNonVegFood(item.name, item.description) && (
                          <span 
                            title="🔒 Non-Veg Protected: Contains chicken/mutton/meat and cannot be changed to Vegetarian by kitchen staff"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold"
                          >
                            <Lock className="w-2.5 h-2.5 text-rose-600" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                        {item.category}
                      </span>
                    </td>

                    {/* Price edit */}
                    <td className="p-3.5 whitespace-nowrap">
                      {isQuickPrice ? (
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">₹</span>
                          <input
                            type="number"
                            min="5"
                            value={quickPriceVal}
                            onChange={(e) => setQuickPriceVal(Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-white border border-emerald-400 rounded-lg text-xs font-bold focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveQuickPrice(item.id)}
                            className="p-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setQuickPriceFoodId(null)}
                            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setQuickPriceFoodId(item.id);
                            setQuickPriceVal(item.price);
                          }}
                          className="font-extrabold text-slate-900 font-['Outfit'] hover:text-emerald-700 hover:underline cursor-pointer flex items-center gap-1"
                          title="Click to quickly change price"
                        >
                          <span>₹{item.price}</span>
                          <Edit className="w-3 h-3 text-slate-400 opacity-60" />
                        </button>
                      )}
                    </td>

                    {/* Live availability toggle */}
                    <td className="p-3.5 whitespace-nowrap">
                      <button
                        onClick={() => handleCycleAvailability(item.id, item.availability)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-all hover:scale-105 ${
                          item.availability === 'in_stock'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : item.availability === 'making_fresh'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                        title="Click to cycle status: In Stock → Making Fresh → Sold Out"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          item.availability === 'in_stock'
                            ? 'bg-emerald-500'
                            : item.availability === 'making_fresh'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`} />
                        <span>
                          {item.availability === 'in_stock'
                            ? 'In Stock'
                            : item.availability === 'making_fresh'
                            ? 'Making Fresh'
                            : 'Sold Out'}
                        </span>
                        <RefreshCw className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
                      </button>
                    </td>

                    {/* Today's special toggle */}
                    <td className="p-3.5 whitespace-nowrap">
                      <button
                        onClick={() => toggleFoodSpecial(item.id, !item.isSpecial)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                          item.isSpecial
                            ? 'bg-orange-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <Flame className={`w-3.5 h-3.5 ${item.isSpecial ? 'fill-white' : ''}`} />
                        <span>{item.isSpecial ? 'Active' : 'Promote'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 whitespace-nowrap text-right pr-5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
                          title="Edit Full Dish Details"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingFood(item)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )}

      {/* ➕ / ✏️ Add or Edit Food Modal */}
      {(isAddModalOpen || editingFood) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] flex flex-col">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingFood(null);
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <ChefHat className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 font-['Outfit']">
                  {editingFood ? 'Edit Food Item' : 'Add New Food to Menu'}
                </h3>
                <p className="text-xs text-slate-400">
                  Configure dietary categorization (Veg, Egg, Non-Veg), price, and photo
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveFood} className="overflow-y-auto pr-1 space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Food Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Masala Egg Maggi with Cheese"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3-Way Dietary Selection: Veg, Egg, Non-Veg */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold text-slate-800">
                    Dietary Classification *
                  </label>
                  {isLockedNonVeg && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200">
                      <Lock className="w-3 h-3 text-rose-600" />
                      Locked: Non-Veg
                    </span>
                  )}
                  {isLockedEgg && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                      <Lock className="w-3 h-3 text-amber-600" />
                      Locked: Contains Egg
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {/* Pure Veg option */}
                  {isLockedNonVeg || isLockedEgg ? (
                    <button
                      type="button"
                      onClick={() => {
                        const reason = isLockedNonVeg
                          ? `🔒 Protected Non-Veg: Dishes containing ${matchedNonVegTerm || 'chicken/mutton'} cannot be changed to Vegetarian under campus dietary integrity regulations.`
                          : `🔒 Protected Egg: Dishes with egg products cannot be classified as Pure Vegetarian.`;
                        setDietaryWarning(reason);
                      }}
                      className="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-rose-200 bg-rose-50/50 text-slate-400 text-xs font-bold cursor-not-allowed select-none transition-all hover:bg-rose-100/50"
                      title={isLockedNonVeg ? "Non-veg items cannot be marked as Vegetarian" : "Egg items cannot be marked as Pure Veg"}
                    >
                      <div className="flex items-center gap-1 text-slate-400">
                        <Lock className="w-3 h-3 text-rose-500 shrink-0" />
                        <span className="line-through text-[11px]">Pure Veg</span>
                      </div>
                      <span className="text-[9px] text-rose-600 font-bold mt-0.5">Chef Locked</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setDietary('veg');
                        setDietaryWarning(null);
                      }}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        dietary === 'veg'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-400'
                      }`}
                    >
                      <span>🟢 Pure Veg</span>
                    </button>
                  )}

                  {/* Egg option */}
                  {isLockedNonVeg ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDietaryWarning(`🔒 Meat Protection: Dishes with ${matchedNonVegTerm || 'chicken/mutton'} are Non-Veg, not just egg dishes.`);
                      }}
                      className="flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-slate-200 bg-slate-100/80 text-slate-400 text-xs font-bold cursor-not-allowed select-none transition-all hover:bg-slate-200/50"
                      title="Meat dishes cannot be categorized as egg only"
                    >
                      <div className="flex items-center gap-1 text-slate-400">
                        <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="line-through text-[11px]">Egg Dishes</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-semibold mt-0.5">Meat Dish</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setDietary('egg');
                        setDietaryWarning(null);
                      }}
                      className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                        dietary === 'egg'
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400'
                      }`}
                    >
                      <span>🟡 Egg Dishes</span>
                    </button>
                  )}

                  {/* Non-Veg option */}
                  <button
                    type="button"
                    onClick={() => {
                      setDietary('non_veg');
                      setDietaryWarning(null);
                    }}
                    className={`flex items-center justify-center gap-1.5 p-2 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                      dietary === 'non_veg'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-rose-400'
                    }`}
                  >
                    <span>🔴 Non-Veg</span>
                    {isLockedNonVeg && <Lock className="w-3 h-3 text-white ml-0.5" />}
                  </button>
                </div>

                {/* Dietary Warning Toast / Notice */}
                {dietaryWarning && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2 text-xs animate-in fade-in">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p className="flex-1 font-medium">{dietaryWarning}</p>
                    <button
                      type="button"
                      onClick={() => setDietaryWarning(null)}
                      className="text-rose-400 hover:text-rose-700 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {isLockedNonVeg && !dietaryWarning && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-900 flex items-start gap-2 text-xs">
                    <Lock className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-extrabold">Prominent Non-Veg Dish Protected: </span>
                      <span>
                        Contains <strong>{matchedNonVegTerm}</strong>. Campus dietary safety strictly prohibits chefs from altering non-veg food to Vegetarian.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="5"
                    max="500"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Prep Time
                  </label>
                  <input
                    type="text"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    placeholder="e.g. 5 mins"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ingredients, crispiness, chutneys served with it..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-emerald-600 resize-none"
                />
              </div>

              {/* Photo Presets & Custom URL */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Choose Verified Food Photo Preset
                </label>
                <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                  {PRESET_FOOD_IMAGES.map((preset, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setImageUrl(preset.url);
                        if (preset.dietary) {
                          setDietary(preset.dietary as DietaryType);
                        }
                      }}
                      className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        imageUrl === preset.url
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                      }`}
                    >
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>

                <div className="mt-2">
                  <label className="text-[11px] text-slate-500 font-semibold block mb-1">
                    Or Enter Custom Photo URL:
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {/* Live photo preview */}
                <div className="mt-2 flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    onError={(e) => handleImageError(e, category, dietary)}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                  />
                  <div className="text-xs text-slate-500">
                    <p className="font-bold text-slate-800">Photo Preview</p>
                    <p className="text-[11px]">Guaranteed high-resolution image with automatic fallback</p>
                  </div>
                </div>
              </div>

              {/* Today's Special promotion toggle */}
              <div className="p-3 bg-orange-50/70 border border-orange-200 rounded-2xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isSpecial}
                    onChange={(e) => setIsSpecial(e.target.checked)}
                    className="rounded text-orange-600 w-4 h-4"
                  />
                  <span className="text-xs font-bold text-orange-950 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-orange-600" />
                    Feature as Today's Special on Homepage Banner
                  </span>
                </label>

                {isSpecial && (
                  <input
                    type="text"
                    value={specialTag}
                    onChange={(e) => setSpecialTag(e.target.value)}
                    placeholder="e.g. 🔥 Chef Special - 10% Off"
                    className="w-full bg-white border border-orange-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-orange-500"
                  />
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? 'Saving to Database...' : editingFood ? 'Save Dish Updates' : 'Add Food to Live Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deletingFood && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg font-['Outfit']">
              Delete Dish from Menu?
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to remove <span className="font-bold text-slate-900">"{deletingFood.name}"</span>? This will take it off the student menu.
            </p>

            <div className="flex gap-2.5">
              <button
                onClick={() => setDeletingFood(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Delete Dish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
