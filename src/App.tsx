import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, 
  Filter, 
  IndianRupee, 
  Flame, 
  Clock, 
  Sparkles, 
  UtensilsCrossed, 
  ShoppingBag, 
  Bot, 
  ArrowUpDown, 
  Check, 
  ChefHat, 
  SlidersHorizontal, 
  RefreshCcw,
  Heart,
  ChevronRight,
  Menu,
  Sunrise,
  Sun,
  Sunset,
  Zap,
  Bell,
  Receipt
} from 'lucide-react';
import { 
  FoodItem, 
  Category, 
  Review, 
  CanteenInfo, 
  CartItem, 
  AvailabilityStatus,
  DietaryType,
  MealSlotId,
  PlacedOrder
} from './types';
import { 
  subscribeToFoods, 
  subscribeToReviews, 
  subscribeToCanteenInfo, 
  subscribeToOrders,
  updateOrderStatus,
  markOrderNotified,
  DEFAULT_CANTEEN_INFO,
  seedInitialDataIfEmpty,
  updateFoodAvailability,
  toggleFoodSpecial,
  deleteFoodItem
} from './services/foodService';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { TodaysSpecial } from './components/TodaysSpecial';
import { CravingSelector } from './components/CravingSelector';
import { FoodCard } from './components/FoodCard';
import { FoodDetailModal } from './components/FoodDetailModal';
import { FoodReviewsModal } from './components/FoodReviewsModal';
import { FoodChatbot } from './components/FoodChatbot';
import { BudgetFinder } from './components/BudgetFinder';
import { CanteenTimingsModal } from './components/CanteenTimingsModal';
import { OrderTrayDrawer } from './components/OrderTrayDrawer';
import { StaffPanel } from './components/StaffPanel';
import { AuthModal } from './components/AuthModal';
import { LeftFeaturesDrawer } from './components/LeftFeaturesDrawer';
import { PrepTimeCartModal } from './components/PrepTimeCartModal';
import { ChefOrderNotificationModal } from './components/ChefOrderNotificationModal';
import { MyOrdersModal } from './components/MyOrdersModal';
import { playOrderAlertChime, sendChefDesktopNotification } from './utils/audioAlert';
import { getResolvedSlotInfo, isFoodSuitedForSlot, parsePrepTimeInMinutes } from './utils/timingUtils';

const CATEGORIES: Category[] = [
  'All',
  'Breakfast',
  'Snacks',
  'Meals',
  'South Indian',
  'Fast Food',
  'Beverages',
  'Desserts'
];

function MainAppContent() {
  const { user, isStaff } = useAuth();

  // Core data from Firebase Firestore
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [canteenInfo, setCanteenInfo] = useState<CanteenInfo>(DEFAULT_CANTEEN_INFO);

  // Cart / Tray state
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('campus_bites_cart_v1');
    return saved ? JSON.parse(saved) : [];
  });

  // Kitchen Orders & Chef Real-time Notification state
  const [orders, setOrders] = useState<PlacedOrder[]>([]);
  const [activeChefNotification, setActiveChefNotification] = useState<PlacedOrder | null>(null);
  const [staffInitialTab, setStaffInitialTab] = useState<'menu' | 'orders'>('menu');
  const notifiedOrderIdsRef = useRef<Set<string>>(new Set());

  // Student Placed Orders tracking (persisted in localStorage for this browser session)
  const [myOrderIds, setMyOrderIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('campus_bites_my_order_ids_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Views & Modals
  const [activeTab, setActiveTab] = useState<'student' | 'staff'>('student');
  const [isMyOrdersOpen, setIsMyOrdersOpen] = useState(false);
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTimingsOpen, setIsTimingsOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPrepTimeModalOpen, setIsPrepTimeModalOpen] = useState(false);
  const [selectedFoodForReviews, setSelectedFoodForReviews] = useState<FoodItem | null>(null);
  const [selectedFoodForDetail, setSelectedFoodForDetail] = useState<FoodItem | null>(null);

  // Keep references to auth and tab so async order subscriptions know role context
  const isStaffRef = useRef(isStaff);
  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    isStaffRef.current = isStaff;
    activeTabRef.current = activeTab;
  }, [isStaff, activeTab]);

  // Derive orders placed by this student
  const studentOrders = useMemo(() => {
    const idSet = new Set(myOrderIds);
    return orders.filter(
      (o) => idSet.has(o.id) || (user?.displayName && o.studentName?.toLowerCase() === user.displayName.toLowerCase())
    );
  }, [orders, myOrderIds, user]);

  // Active student orders (in kitchen prep or ready for pickup)
  const activeStudentOrders = useMemo(() => {
    return studentOrders.filter(
      (o) => o.status === 'Pending' || o.status === 'Preparing' || o.status === 'Ready for Pickup'
    );
  }, [studentOrders]);

  // Helper when student places an order
  const handleOrderPlaced = (newOrder: PlacedOrder) => {
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    setMyOrderIds((prev) => {
      const updated = [newOrder.id, ...prev.filter((id) => id !== newOrder.id)];
      try {
        localStorage.setItem('campus_bites_my_order_ids_v1', JSON.stringify(updated));
      } catch (e) {
        // Non-fatal
      }
      return updated;
    });
  };

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'egg' | 'non_veg'>('all');
  const [selectedMealSlot, setSelectedMealSlot] = useState<'auto' | 'morning' | 'afternoon' | 'evening' | 'all'>('all');
  const [selectedCraving, setSelectedCraving] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrepTimeFilter, setMaxPrepTimeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'price_low' | 'price_high' | 'prep_time_asc' | 'prep_time_desc'>('popular');

  // Resolved slot info based on live canteen info and current time
  const resolvedSlotInfo = useMemo(() => {
    return getResolvedSlotInfo(canteenInfo);
  }, [canteenInfo]);

  // Sync cart to local storage
  useEffect(() => {
    localStorage.setItem('campus_bites_cart_v1', JSON.stringify(cart));
  }, [cart]);

  // Subscribe to real-time Firestore data
  useEffect(() => {
    seedInitialDataIfEmpty();
    const unsubFoods = subscribeToFoods((items) => setFoods(items));
    const unsubReviews = subscribeToReviews((revs) => setReviews(revs));
    const unsubCanteen = subscribeToCanteenInfo((info) => setCanteenInfo(info));

    // Cross-tab broadcast listener for immediate kitchen notification
    let orderBroadcastChannel: BroadcastChannel | null = null;
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        orderBroadcastChannel = new BroadcastChannel('campus_bites_kitchen_orders');
        orderBroadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'NEW_ORDER_RECEIVED' && event.data.order) {
            const incoming: PlacedOrder = event.data.order;
            notifiedOrderIdsRef.current.add(incoming.id);

            // ONLY alert chef/staff: never pop up "new order received" on students dashboard
            const isChef = isStaffRef.current || activeTabRef.current === 'staff';
            if (isChef) {
              setActiveChefNotification(incoming);
              playOrderAlertChime();
              sendChefDesktopNotification(
                `🔔 New Order Received (Token #${incoming.tokenNumber})`,
                `Order #${incoming.id} from ${incoming.studentName}: ${incoming.items.map((i: any) => `${i.quantity}× ${i.food.name}`).join(', ')}`
              );
            }
          }
        };
      }
    } catch (e) {
      // Non-fatal if unsupported
    }

    let isInitialLoad = true;
    const unsubOrders = subscribeToOrders((newOrders) => {
      setOrders(newOrders);

      if (isInitialLoad) {
        // Register existing orders on mount so we don't spam alerts for old orders
        newOrders.forEach(o => notifiedOrderIdsRef.current.add(o.id));
        isInitialLoad = false;
        return;
      }

      // Check for incoming orders that haven't been notified yet in this browser session
      const unnotifiedPending = newOrders.find(
        (o) => o.status === 'Pending' && !notifiedOrderIdsRef.current.has(o.id)
      );
      if (unnotifiedPending) {
        notifiedOrderIdsRef.current.add(unnotifiedPending.id);

        // ONLY alert chef/staff: never pop up "new order received" on students dashboard
        const isChef = isStaffRef.current || activeTabRef.current === 'staff';
        if (isChef) {
          setActiveChefNotification(unnotifiedPending);
          playOrderAlertChime();
          sendChefDesktopNotification(
            `🔔 New Order Received (Token #${unnotifiedPending.tokenNumber})`,
            `Order #${unnotifiedPending.id} from ${unnotifiedPending.studentName}: ${unnotifiedPending.items.map((i: any) => `${i.quantity}× ${i.food.name}`).join(', ')}`
          );
        }
      }
    });

    return () => {
      unsubFoods();
      unsubReviews();
      unsubCanteen();
      unsubOrders();
      if (orderBroadcastChannel) {
        orderBroadcastChannel.close();
      }
    };
  }, []);

  // Cart helpers
  const cartItemIds = useMemo(() => {
    const map: Record<string, number> = {};
    cart.forEach((item) => {
      map[item.food.id] = item.quantity;
    });
    return map;
  }, [cart]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const handleAddToCart = (food: FoodItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.food.id === food.id);
      if (existing) {
        return prev.map((item) =>
          item.food.id === food.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { food, quantity: 1 }];
    });
  };

  const handleUpdateCartQty = (foodId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.food.id === foodId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleAddComboToCart = (item1: FoodItem, item2: FoodItem) => {
    handleAddToCart(item1);
    handleAddToCart(item2);
    setIsBudgetOpen(false);
    setIsCartOpen(true);
  };

  // Dietary counts for chips
  const vegCount = useMemo(() => foods.filter((f) => f.dietary === 'veg').length, [foods]);
  const eggCount = useMemo(() => foods.filter((f) => f.dietary === 'egg').length, [foods]);
  const nonVegCount = useMemo(() => foods.filter((f) => f.dietary === 'non_veg').length, [foods]);

  // Meal slot counts
  const morningCount = useMemo(
    () => foods.filter((f) => isFoodSuitedForSlot(f, 'morning', resolvedSlotInfo.activeSlotId)).length,
    [foods, resolvedSlotInfo.activeSlotId]
  );
  const afternoonCount = useMemo(
    () => foods.filter((f) => isFoodSuitedForSlot(f, 'afternoon', resolvedSlotInfo.activeSlotId)).length,
    [foods, resolvedSlotInfo.activeSlotId]
  );
  const eveningCount = useMemo(
    () => foods.filter((f) => isFoodSuitedForSlot(f, 'evening', resolvedSlotInfo.activeSlotId)).length,
    [foods, resolvedSlotInfo.activeSlotId]
  );

  // Filtered and sorted dishes
  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = food.name.toLowerCase().includes(q);
        const matchesDesc = food.description.toLowerCase().includes(q);
        const matchesCat = food.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      // Meal slot filter
      if (selectedMealSlot !== 'all' && !isFoodSuitedForSlot(food, selectedMealSlot, resolvedSlotInfo.activeSlotId)) {
        return false;
      }

      // Category match
      if (selectedCategory !== 'All' && food.category !== selectedCategory) {
        return false;
      }

      // 3-Way Dietary match: Pure Veg, Egg, Non-Veg
      if (dietaryFilter === 'veg' && food.dietary !== 'veg') return false;
      if (dietaryFilter === 'egg' && food.dietary !== 'egg') return false;
      if (dietaryFilter === 'non_veg' && food.dietary !== 'non_veg') return false;

      // Craving match
      if (selectedCraving && (!food.cravings || !food.cravings.includes(selectedCraving))) {
        return false;
      }

      // In-stock match
      if (inStockOnly && food.availability === 'sold_out') {
        return false;
      }

      // Max preparation time filter
      if (maxPrepTimeFilter !== 'all') {
        const maxMins = Number(maxPrepTimeFilter);
        const itemMins = parsePrepTimeInMinutes(food.prepTime);
        if (itemMins > maxMins) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'prep_time_asc') {
        return parsePrepTimeInMinutes(a.prepTime) - parsePrepTimeInMinutes(b.prepTime);
      }
      if (sortBy === 'prep_time_desc') {
        return parsePrepTimeInMinutes(b.prepTime) - parsePrepTimeInMinutes(a.prepTime);
      }
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_low') return a.price - b.price;
      if (sortBy === 'price_high') return b.price - a.price;
      // Default: popular (specials first, then order count, then rating)
      if (a.isSpecial !== b.isSpecial) return a.isSpecial ? -1 : 1;
      return (b.orderCount || 0) - (a.orderCount || 0);
    });
  }, [foods, searchQuery, selectedMealSlot, resolvedSlotInfo.activeSlotId, selectedCategory, dietaryFilter, selectedCraving, inStockOnly, maxPrepTimeFilter, sortBy]);

  // Today's special items
  const specials = useMemo(() => {
    return foods.filter((f) => f.isSpecial);
  }, [foods]);

  // Number of pending kitchen orders waiting for prep
  const pendingOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === 'Pending').length;
  }, [orders]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 w-full overflow-x-hidden">
      {/* Navbar */}
      <Navbar
        canteenInfo={canteenInfo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={totalCartCount}
        pendingOrdersCount={pendingOrdersCount}
        activeStudentOrdersCount={activeStudentOrders.length}
        onOpenKitchenOrders={() => {
          setStaffInitialTab('orders');
          setActiveTab('staff');
        }}
        onOpenLatestChefNotification={() => {
          const latestPending = orders.find((o) => o.status === 'Pending') || orders[0];
          if (latestPending) {
            setActiveChefNotification(latestPending);
          } else {
            setStaffInitialTab('orders');
            setActiveTab('staff');
          }
        }}
        onOpenMyOrders={() => setIsMyOrdersOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenTimings={() => setIsTimingsOpen(true)}
        onOpenBudget={() => setIsBudgetOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onOpenLeftMenu={() => setIsLeftDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 overflow-x-hidden">
        {activeTab === 'staff' && isStaff ? (
          /* Protected Staff Panel View */
          <StaffPanel
            foods={foods}
            canteenInfo={canteenInfo}
            orders={orders}
            initialTab={staffInitialTab}
            onUpdateOrderStatus={updateOrderStatus}
            onOpenNotificationModal={(order) => setActiveChefNotification(order)}
            onViewStudentMenu={() => setActiveTab('student')}
          />
        ) : activeTab === 'staff' && !isStaff ? (
          /* Staff access challenge for unauthenticated visitors */
          <StaffPanel
            foods={foods}
            canteenInfo={canteenInfo}
            orders={orders}
            initialTab={staffInitialTab}
            onUpdateOrderStatus={updateOrderStatus}
            onOpenNotificationModal={(order) => setActiveChefNotification(order)}
            onViewStudentMenu={() => setActiveTab('student')}
          />
        ) : !canteenInfo.isOpen ? (
          /* Kitchen Closed State: Student dashboard only shows this message and nothing more */
          <div 
            id="kitchen-closed-student-view"
            className="flex flex-col items-center justify-center min-h-[55vh] py-16 px-4 text-center animate-in fade-in duration-300"
          >
            <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mb-6 shadow-xs">
              <UtensilsCrossed className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-['Outfit'] text-slate-900 tracking-tight max-w-xl leading-snug">
              ohhhh sorry kitchen is closed try again later
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-3 max-w-md">
              The kitchen has been closed by the chef. Please check back later.
            </p>
            <div className="mt-8 pt-6 border-t border-slate-200">
              <button
                id="kitchen-closed-staff-switch-btn"
                onClick={() => setActiveTab('staff')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                Chef or Cafeteria Staff? Open Kitchen Portal →
              </button>
            </div>
          </div>
        ) : (
          /* Student Website & Home Page View */
          <div>
            {/* Professional Campus Hero Banner - White & Burgundy */}
            <section className="mb-8 sm:mb-14 bg-linear-to-br from-burgundy-950 via-burgundy-900 to-burgundy-850 rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 text-white shadow-xl shadow-burgundy-950/20 relative overflow-hidden border border-burgundy-900">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 bg-white/15 text-amber-200 backdrop-blur-md px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-extrabold uppercase tracking-wider mb-3 border border-white/20">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>College Central Cafeteria</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black font-['Outfit'] tracking-tight leading-tight text-white">
                  Fresh Hot Food <br className="hidden sm:inline" />
                  Between Lectures 🍱🥪
                </h1>

                <p className="text-xs sm:text-sm text-burgundy-100/90 font-medium mt-2.5 mb-5 sm:mb-6 max-w-lg leading-relaxed">
                  Skip the long lines! Check live availability of Pure Veg, Egg dishes, and Non-Veg specialties, discover quick meals under ₹50, and pick up your tray with zero wait.
                </p>

                {/* Clean, spacious action controls */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <button
                    id="hero-explore-features-btn"
                    type="button"
                    onClick={() => setIsLeftDrawerOpen(true)}
                    className="flex items-center gap-1.5 sm:gap-2 px-3.5 py-2 sm:px-4.5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white text-burgundy-950 font-extrabold text-xs shadow-md hover:bg-burgundy-50 transition-all cursor-pointer active:scale-95"
                  >
                    <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-burgundy-900" />
                    <span>Features Menu</span>
                  </button>

                  <button
                    id="hero-budget-btn"
                    type="button"
                    onClick={() => setIsBudgetOpen(true)}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs backdrop-blur-xs transition-all cursor-pointer border border-white/20"
                  >
                    <IndianRupee className="w-3.5 h-3.5 text-amber-200" />
                    <span>Under ₹X Budget</span>
                  </button>

                  <button
                    id="hero-timings-btn"
                    type="button"
                    onClick={() => setIsTimingsOpen(true)}
                    className="flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-burgundy-800 hover:bg-burgundy-700 text-white font-bold text-xs shadow-md shadow-burgundy-950/30 transition-all cursor-pointer border border-burgundy-600/50"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-200" />
                    <span>Timings</span>
                  </button>

                  {/* My Orders quick button if student has orders */}
                  {studentOrders.length > 0 && (
                    <button
                      id="hero-my-orders-btn"
                      type="button"
                      onClick={() => setIsMyOrdersOpen(true)}
                      className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-amber-400 hover:bg-amber-300 text-burgundy-950 font-extrabold text-xs shadow-md transition-all cursor-pointer active:scale-95"
                    >
                      <Receipt className="w-3.5 h-3.5 text-burgundy-950" />
                      <span>My Orders {activeStudentOrders.length > 0 ? `(${activeStudentOrders.length})` : ''}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Decorative background food elements */}
              <div className="absolute right-4 -bottom-6 sm:bottom-0 opacity-10 pointer-events-none">
                <UtensilsCrossed className="w-64 h-64 text-amber-100" />
              </div>
            </section>

            {/* Student Live Active Orders Status Banner */}
            {activeStudentOrders.length > 0 && (
              <div 
                id="student-active-orders-banner"
                onClick={() => setIsMyOrdersOpen(true)}
                className={`mb-6 p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                  activeStudentOrders.some(o => o.status === 'Ready for Pickup')
                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/20'
                    : 'bg-amber-50/80 hover:bg-amber-100/70 border-amber-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                    activeStudentOrders.some(o => o.status === 'Ready for Pickup')
                      ? 'bg-emerald-600 text-white animate-bounce'
                      : 'bg-amber-400 text-burgundy-950 font-black'
                  }`}>
                    {activeStudentOrders.some(o => o.status === 'Ready for Pickup') ? (
                      <Bell className="w-5 h-5" />
                    ) : (
                      <Receipt className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-extrabold text-slate-900 font-['Outfit']">
                        {activeStudentOrders.some(o => o.status === 'Ready for Pickup')
                          ? '🔥 Meal Ready for Counter Pickup!'
                          : `${activeStudentOrders.length} Active Order${activeStudentOrders.length > 1 ? 's' : ''} in Kitchen`}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white text-burgundy-950 shadow-2xs border border-amber-200 font-mono">
                        {activeStudentOrders.map(o => `#${o.tokenNumber}`).join(', ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {activeStudentOrders.some(o => o.status === 'Ready for Pickup')
                        ? 'Your hot food is waiting at Ground Floor Counter 1. Click to view order details.'
                        : 'Your order is currently being prepared fresh in the canteen. Click to track live progress.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold text-burgundy-950 group-hover:underline self-end sm:self-auto shrink-0">
                  <span>View in My Orders</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-burgundy-800" />
                </div>
              </div>
            )}

            {/* 🔥 Today's Special Highlights */}
            <TodaysSpecial
              specials={specials}
              onAddToCart={handleAddToCart}
              onOpenDetails={(food) => setSelectedFoodForDetail(food)}
              cartItemIds={cartItemIds}
            />

            {/* 🌶️ Craving-Based Suggestions Filter */}
            <CravingSelector
              selectedCraving={selectedCraving}
              onSelectCraving={(c) => setSelectedCraving(c)}
            />

            {/* 🕒 Automated Canteen Meal Timings & Shift Bar */}
            <div className="mb-6 p-4 bg-white rounded-2xl border border-burgundy-100 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3.5 pb-3 border-b border-burgundy-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-burgundy-50 border border-burgundy-100 text-burgundy-800 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        Canteen Schedule:
                      </span>
                      <span className="text-xs font-black text-burgundy-900 bg-burgundy-50 border border-burgundy-200/80 px-2 py-0.5 rounded-md">
                        {resolvedSlotInfo.activeLabel}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        ({resolvedSlotInfo.activeTimeRange})
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {resolvedSlotInfo.isAuto 
                        ? '🕒 Timings automatically sync with system clock' 
                        : '⚡ Cafeteria staff manual shift override active'} • Filter dishes by meal slot below:
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsTimingsOpen(true)}
                  className="self-start sm:self-auto text-xs font-bold text-burgundy-800 hover:text-burgundy-950 bg-burgundy-50 hover:bg-burgundy-100 border border-burgundy-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>View All Shifts</span>
                </button>
              </div>

              {/* Meal Slot Quick Filter Buttons */}
              <div className="flex gap-2 overflow-x-auto pb-1.5 sm:flex-wrap scrollbar-none">
                {/* Auto / Current Shift Button */}
                <button
                  id="slot-filter-auto"
                  onClick={() => setSelectedMealSlot('auto')}
                  className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedMealSlot === 'auto'
                      ? 'bg-burgundy-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-burgundy-50 border border-burgundy-100'
                  }`}
                >
                  <Zap className={`w-3.5 h-3.5 ${selectedMealSlot === 'auto' ? 'text-amber-300' : 'text-burgundy-700'}`} />
                  <span>Current Shift ({resolvedSlotInfo.activeLabel.split(' ')[0]})</span>
                  <span className={`w-2 h-2 rounded-full ${resolvedSlotInfo.isKitchenOpen ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                </button>

                {/* Morning Slot */}
                <button
                  id="slot-filter-morning"
                  onClick={() => setSelectedMealSlot('morning')}
                  className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedMealSlot === 'morning'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-burgundy-50 border border-burgundy-100'
                  }`}
                >
                  <Sunrise className={`w-3.5 h-3.5 ${selectedMealSlot === 'morning' ? 'text-amber-200' : 'text-amber-600'}`} />
                  <span>Morning ({morningCount})</span>
                </button>

                {/* Afternoon Slot */}
                <button
                  id="slot-filter-afternoon"
                  onClick={() => setSelectedMealSlot('afternoon')}
                  className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedMealSlot === 'afternoon'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-burgundy-50 border border-burgundy-100'
                  }`}
                >
                  <Sun className={`w-3.5 h-3.5 ${selectedMealSlot === 'afternoon' ? 'text-orange-200' : 'text-orange-600'}`} />
                  <span>Lunch ({afternoonCount})</span>
                </button>

                {/* Evening Slot */}
                <button
                  id="slot-filter-evening"
                  onClick={() => setSelectedMealSlot('evening')}
                  className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedMealSlot === 'evening'
                      ? 'bg-burgundy-950 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-burgundy-50 border border-burgundy-100'
                  }`}
                >
                  <Sunset className={`w-3.5 h-3.5 ${selectedMealSlot === 'evening' ? 'text-amber-200' : 'text-burgundy-700'}`} />
                  <span>Evening & Dinner ({eveningCount})</span>
                </button>

                {/* All Shifts / Full Menu */}
                <button
                  id="slot-filter-all"
                  onClick={() => setSelectedMealSlot('all')}
                  className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedMealSlot === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-burgundy-50 border border-burgundy-100'
                  }`}
                >
                  <UtensilsCrossed className="w-3.5 h-3.5" />
                  <span>All Shifts ({foods.length})</span>
                </button>
              </div>
            </div>

            {/* 🍔 Digital Menu Header & Controls */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 font-['Outfit'] tracking-tight flex items-center gap-2">
                    Digital Menu
                    <span className="text-xs font-extrabold text-burgundy-900 bg-burgundy-50 border border-burgundy-200 px-2.5 py-0.5 rounded-full">
                      {filteredFoods.length} items
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Separated into Pure Veg, Egg dishes, and Non-Veg kitchen specials
                  </p>
                </div>

                {/* Search Bar */}
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <div className="relative w-full">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="search-input-field"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search samosa, dosa, egg maggi, chicken..."
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-burgundy-200/90 rounded-2xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-burgundy-800 font-medium shadow-2xs"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  const count = cat === 'All' 
                    ? foods.length 
                    : foods.filter((f) => f.category === cat).length;

                  return (
                    <button
                      key={cat}
                      id={`category-pill-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => {
                        setSelectedCategory(cat);
                        if (cat === 'All') {
                          setSelectedMealSlot('all');
                          setSelectedCraving(null);
                        }
                      }}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-burgundy-900 text-white shadow-md shadow-burgundy-950/20 scale-102'
                          : 'bg-white hover:bg-burgundy-50/60 text-slate-700 border border-burgundy-100 shadow-2xs hover:border-burgundy-200'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-burgundy-950 text-amber-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Secondary Filters Bar: Dedicated Veg, Egg, Non-Veg Separation Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-burgundy-100 shadow-2xs">
                {/* 3-Way Dietary Separation */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap scrollbar-none w-full sm:w-auto">
                  <button
                    id="filter-diet-all"
                    onClick={() => {
                      setDietaryFilter('all');
                      setSelectedMealSlot('all');
                      setSelectedCategory('All');
                      setSelectedCraving(null);
                      setSearchQuery('');
                      setInStockOnly(false);
                    }}
                    className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      dietaryFilter === 'all' && selectedCategory === 'All' && selectedMealSlot === 'all' && !searchQuery
                        ? 'bg-burgundy-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-burgundy-50'
                    }`}
                  >
                    All Items ({foods.length})
                  </button>

                  <button
                    id="filter-diet-veg"
                    onClick={() => setDietaryFilter('veg')}
                    className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      dietaryFilter === 'veg'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/60'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Pure Veg ({vegCount})</span>
                  </button>

                  <button
                    id="filter-diet-egg"
                    onClick={() => setDietaryFilter('egg')}
                    className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      dietaryFilter === 'egg'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-amber-800 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/60'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Egg Dishes ({eggCount})</span>
                  </button>

                  <button
                    id="filter-diet-non-veg"
                    onClick={() => setDietaryFilter('non_veg')}
                    className={`shrink-0 whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      dietaryFilter === 'non_veg'
                        ? 'bg-burgundy-800 text-white shadow-sm'
                        : 'text-burgundy-900 bg-burgundy-50 hover:bg-burgundy-100/80 border border-burgundy-200/60'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-burgundy-700" />
                    <span>Non-Veg ({nonVegCount})</span>
                  </button>
                </div>

                {/* In Stock, Prep Time & Sort */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded text-burgundy-800 focus:ring-burgundy-700 w-3.5 h-3.5 accent-burgundy-800"
                    />
                    <span>🟢 In-Stock Only</span>
                  </label>

                  {/* ⏱️ Option next to In-Stock Only: Add items to cart based on preparation time */}
                  <button
                    id="add-by-prep-time-btn"
                    type="button"
                    onClick={() => setIsPrepTimeModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-burgundy-900 hover:bg-burgundy-950 text-white text-xs font-black shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
                    title="Order and add dishes to cart based on preparation time"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-200" />
                    <span>Add by Prep Time</span>
                    <span className="bg-burgundy-950 text-amber-300 text-[10px] px-1.5 py-0.5 rounded-md font-black flex items-center gap-0.5">
                      <Zap className="w-2.5 h-2.5 fill-amber-300" /> Fast
                    </span>
                  </button>

                  {/* Quick Prep Time filter dropdown */}
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    <select
                      id="filter-prep-time-select"
                      value={maxPrepTimeFilter}
                      onChange={(e) => setMaxPrepTimeFilter(e.target.value)}
                      className="bg-[#FAF7F8] border border-burgundy-200/80 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-burgundy-800 cursor-pointer"
                      title="Filter dishes by maximum preparation time"
                    >
                      <option value="all">⏱️ Prep: All Times</option>
                      <option value="3">⚡ ≤ 3 mins (Instant)</option>
                      <option value="5">⚡ ≤ 5 mins (Quick)</option>
                      <option value="10">⏱️ ≤ 10 mins</option>
                      <option value="15">⏱️ ≤ 15 mins</option>
                    </select>
                  </div>

                  {/* Sort dropdown */}
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      id="sort-menu-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-[#FAF7F8] border border-burgundy-200/80 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-burgundy-800 cursor-pointer"
                    >
                      <option value="popular">Most Popular</option>
                      <option value="prep_time_asc">⚡ Prep Time: Fastest First</option>
                      <option value="prep_time_desc">⏱️ Prep Time: Longest First</option>
                      <option value="rating">Top Rated ★</option>
                      <option value="price_low">Price: Low to High (₹)</option>
                      <option value="price_high">Price: High to Low (₹)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Food Cards Grid */}
            {filteredFoods.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-burgundy-100 p-8 shadow-xs">
                <UtensilsCrossed className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-extrabold text-slate-800">
                  No dishes matched your filters
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try clearing the craving filter, switching dietary categories, or clearing your search query.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedCraving(null);
                    setSelectedMealSlot('all');
                    setDietaryFilter('all');
                    setInStockOnly(false);
                    setMaxPrepTimeFilter('all');
                    setSortBy('popular');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-burgundy-900 text-white text-xs font-bold cursor-pointer hover:bg-burgundy-950 transition-colors shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredFoods.map((food) => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    quantityInCart={cartItemIds[food.id] || 0}
                    onAddToCart={handleAddToCart}
                    onUpdateCartQty={handleUpdateCartQty}
                    onOpenReviews={(item) => setSelectedFoodForReviews(item)}
                    onOpenDetails={(item) => setSelectedFoodForDetail(item)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating BiteBot Trigger - optimized for mobile to never overlap with bottom tray bar */}
      {canteenInfo.isOpen && (
        <button
          id="floating-bitebot-trigger"
          onClick={() => setIsChatbotOpen(true)}
          className={`fixed ${totalCartCount > 0 ? 'bottom-22 sm:bottom-6' : 'bottom-6'} right-4 sm:right-6 z-40 flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-burgundy-900 hover:bg-burgundy-950 text-white font-extrabold text-xs shadow-xl shadow-burgundy-950/30 transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 group border border-burgundy-700/60`}
          aria-label="Open food chatbot"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
          </span>
          <Bot className="w-5 h-5 group-hover:rotate-12 transition-transform text-white" />
          <span className="hidden sm:inline font-['Outfit']">Ask BiteBot AI</span>
        </button>
      )}

      {/* Bottom Sticky Tray Bar (Appears when Tray has items and kitchen is open) */}
      {canteenInfo.isOpen && totalCartCount > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-24 z-30 animate-in slide-in-from-bottom duration-300">
          <button
            id="floating-tray-bar-btn"
            onClick={() => setIsCartOpen(true)}
            className="w-full sm:w-auto bg-burgundy-950 hover:bg-burgundy-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center justify-between gap-4 cursor-pointer border border-burgundy-700/80"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-burgundy-800 text-white flex items-center justify-center font-bold shadow-xs">
                <ShoppingBag className="w-4 h-4 text-amber-200" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold leading-tight text-white">
                  {totalCartCount} items in tray
                </p>
                <p className="text-[10px] text-amber-300 font-bold">
                  Total: ₹{cart.reduce((s, c) => s + c.food.price * c.quantity, 0)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-extrabold text-amber-200">
              <span>View Tray</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-burgundy-100 py-8 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-burgundy-900 text-white flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-sm text-slate-900 font-['Outfit']">
              Campus Bites
            </span>
            <span className="text-[11px] text-slate-400">• Student Cafeteria System</span>
          </div>

          <p className="text-center text-[11px]">
            Made with fresh care for students • Pure Veg, Egg & Non-Veg separated menus • Zero-wait tokens
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTimingsOpen(true)}
              className="hover:text-slate-900 transition-colors cursor-pointer font-medium"
            >
              Timings
            </button>
            <span>•</span>
            {isStaff ? (
              <button
                onClick={() => setActiveTab(activeTab === 'student' ? 'staff' : 'student')}
                className="hover:text-emerald-900 transition-colors cursor-pointer font-bold text-emerald-700"
              >
                {activeTab === 'student' ? '👨🍳 Staff Portal' : '👨🎓 Student Menu'}
              </button>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="hover:text-slate-900 transition-colors cursor-pointer text-slate-400 font-medium"
              >
                Staff Login 🔐
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <LeftFeaturesDrawer
        isOpen={isLeftDrawerOpen}
        onClose={() => setIsLeftDrawerOpen(false)}
        canteenInfo={canteenInfo}
        onOpenTimings={() => setIsTimingsOpen(true)}
        onOpenBudget={() => setIsBudgetOpen(true)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSwitchToStaff={() => setActiveTab('staff')}
        onOpenMyOrders={() => setIsMyOrdersOpen(true)}
        activeOrdersCount={activeStudentOrders.length}
      />

      <FoodChatbot
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        foods={foods}
        onAddToCart={handleAddToCart}
        cartItemIds={cartItemIds}
      />

      <BudgetFinder
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
        foods={foods}
        onAddToCart={handleAddToCart}
        onAddComboToCart={handleAddComboToCart}
      />

      <CanteenTimingsModal
        isOpen={isTimingsOpen}
        onClose={() => setIsTimingsOpen(false)}
        canteenInfo={canteenInfo}
        onSelectSlot={(slot) => setSelectedMealSlot(slot)}
      />

      <OrderTrayDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQty={handleUpdateCartQty}
        onClearCart={() => setCart([])}
        onOrderPlaced={handleOrderPlaced}
        onViewMyOrders={() => setIsMyOrdersOpen(true)}
      />

      {/* 🧾 My Orders Modal for Students */}
      <MyOrdersModal
        isOpen={isMyOrdersOpen}
        onClose={() => setIsMyOrdersOpen(false)}
        orders={studentOrders}
        onViewMenu={() => {
          setActiveTab('student');
          setIsMyOrdersOpen(false);
        }}
      />

      <FoodDetailModal
        isOpen={!!selectedFoodForDetail}
        onClose={() => setSelectedFoodForDetail(null)}
        food={selectedFoodForDetail}
        quantityInCart={selectedFoodForDetail ? cartItemIds[selectedFoodForDetail.id] || 0 : 0}
        onAddToCart={handleAddToCart}
        onUpdateCartQty={handleUpdateCartQty}
        onOpenReviews={(f) => setSelectedFoodForReviews(f)}
      />

      <FoodReviewsModal
        isOpen={!!selectedFoodForReviews}
        onClose={() => setSelectedFoodForReviews(null)}
        food={selectedFoodForReviews}
        reviews={reviews}
      />

      <PrepTimeCartModal
        isOpen={isPrepTimeModalOpen}
        onClose={() => setIsPrepTimeModalOpen(false)}
        foods={foods}
        cart={cart}
        cartItemIds={cartItemIds}
        onAddToCart={handleAddToCart}
        onUpdateCartQty={handleUpdateCartQty}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onStaffLoginSuccess={() => setActiveTab('staff')}
      />

      {/* 🔔 Chef Real-Time Order Received Notification Modal - Strictly for Chef / Staff */}
      {(isStaff || activeTab === 'staff') && activeChefNotification && (
        <ChefOrderNotificationModal
          order={activeChefNotification}
          onClose={() => setActiveChefNotification(null)}
          onStartPreparing={(orderId: string) => {
            updateOrderStatus(orderId, 'Preparing');
            setActiveChefNotification(null);
            setStaffInitialTab('orders');
            setActiveTab('staff');
          }}
          onOpenKitchenQueue={() => {
            setActiveChefNotification(null);
            setStaffInitialTab('orders');
            setActiveTab('staff');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
