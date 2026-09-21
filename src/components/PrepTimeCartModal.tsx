import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Zap, 
  X, 
  Plus, 
  Minus, 
  Check, 
  ShoppingBag, 
  Sparkles, 
  ArrowUpDown,
  UtensilsCrossed
} from 'lucide-react';
import { FoodItem, CartItem } from '../types';
import { DietaryBadge } from './DietaryBadge';
import { handleImageError } from '../utils/imageUtils';
import { parsePrepTimeInMinutes } from '../utils/timingUtils';

interface PrepTimeCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  foods: FoodItem[];
  cart: CartItem[];
  cartItemIds: Record<string, number>;
  onAddToCart: (food: FoodItem) => void;
  onUpdateCartQty: (foodId: string, delta: number) => void;
  onOpenCart: () => void;
}

type TimeBucket = 'all' | 'under3' | 'under5' | 'under10' | 'above10';

export const PrepTimeCartModal: React.FC<PrepTimeCartModalProps> = ({
  isOpen,
  onClose,
  foods,
  cart,
  cartItemIds,
  onAddToCart,
  onUpdateCartQty,
  onOpenCart
}) => {
  const [selectedBucket, setSelectedBucket] = useState<TimeBucket>('all');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'egg' | 'non_veg'>('all');
  const [sortBy, setSortBy] = useState<'fastest' | 'price_low' | 'rating'>('fastest');

  // Filter and sort foods based on preparation times
  const prepFilteredFoods = useMemo(() => {
    return foods.filter((food) => {
      // Don't show sold out
      if (food.availability === 'sold_out') return false;

      // Dietary filter
      if (dietaryFilter === 'veg' && food.dietary !== 'veg') return false;
      if (dietaryFilter === 'egg' && food.dietary !== 'egg') return false;
      if (dietaryFilter === 'non_veg' && food.dietary !== 'non_veg') return false;

      const mins = parsePrepTimeInMinutes(food.prepTime);

      if (selectedBucket === 'under3') return mins <= 3;
      if (selectedBucket === 'under5') return mins <= 5;
      if (selectedBucket === 'under10') return mins <= 10;
      if (selectedBucket === 'above10') return mins > 10;

      return true;
    }).sort((a, b) => {
      const aTime = parsePrepTimeInMinutes(a.prepTime);
      const bTime = parsePrepTimeInMinutes(b.prepTime);

      if (sortBy === 'fastest') {
        if (aTime !== bTime) return aTime - bTime;
        return (b.orderCount || 0) - (a.orderCount || 0);
      }
      if (sortBy === 'price_low') {
        return a.price - b.price;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return 0;
    });
  }, [foods, selectedBucket, dietaryFilter, sortBy]);

  const totalCartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const totalCartAmount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.food.price * item.quantity, 0);
  }, [cart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="prep-time-cart-modal"
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 text-blue-300 flex items-center justify-center border border-blue-400/30">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg font-['Outfit'] text-white">
                  Add to Cart by Prep Time
                </h3>
                <span className="bg-blue-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
                  Speed Order
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Between lectures or running late? Choose items ready in your exact break window!
              </p>
            </div>
          </div>

          <button
            id="close-prep-time-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Time Window Tabs */}
        <div className="p-3 bg-slate-100/80 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          <button
            onClick={() => setSelectedBucket('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
              selectedBucket === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
            }`}
          >
            All Speeds ({foods.filter(f => f.availability !== 'sold_out').length})
          </button>

          <button
            onClick={() => setSelectedBucket('under3')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedBucket === 'under3'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200/70'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            <span>≤ 3 mins (Instant)</span>
          </button>

          <button
            onClick={() => setSelectedBucket('under5')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedBucket === 'under5'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-blue-800 hover:bg-blue-50 border border-blue-200/70'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>≤ 5 mins (Quick Break)</span>
          </button>

          <button
            onClick={() => setSelectedBucket('under10')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedBucket === 'under10'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-indigo-800 hover:bg-indigo-50 border border-indigo-200/70'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>≤ 10 mins (Standard)</span>
          </button>

          <button
            onClick={() => setSelectedBucket('above10')}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedBucket === 'above10'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200/70'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>10+ mins (Made to order)</span>
          </button>
        </div>

        {/* Secondary Filters Bar inside modal: Dietary & Sort */}
        <div className="px-4 py-2 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setDietaryFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                dietaryFilter === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDietaryFilter('veg')}
              className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer flex items-center gap-1 transition-colors ${
                dietaryFilter === 'veg' ? 'bg-emerald-600 text-white' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Pure Veg
            </button>
            <button
              onClick={() => setDietaryFilter('egg')}
              className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer flex items-center gap-1 transition-colors ${
                dietaryFilter === 'egg' ? 'bg-amber-500 text-white' : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Egg
            </button>
            <button
              onClick={() => setDietaryFilter('non_veg')}
              className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer flex items-center gap-1 transition-colors ${
                dietaryFilter === 'non_veg' ? 'bg-rose-600 text-white' : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Non-Veg
            </button>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="fastest">⚡ Fastest Prep First</option>
              <option value="price_low">💰 Price: Low to High</option>
              <option value="rating">★ Highest Rated</option>
            </select>
          </div>
        </div>

        {/* Food Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {prepFilteredFoods.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="font-bold text-sm text-slate-700">No dishes found for this prep time window</p>
              <p className="text-xs text-slate-500 mt-1">Try selecting "All Speeds" or clearing dietary filters</p>
            </div>
          ) : (
            prepFilteredFoods.map((food) => {
              const qty = cartItemIds[food.id] || 0;
              const mins = parsePrepTimeInMinutes(food.prepTime);
              const isFast = mins <= 5;

              return (
                <div
                  key={food.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={food.imageUrl}
                      alt={food.name}
                      onError={(e) => handleImageError(e, food.category, food.dietary)}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-100"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <DietaryBadge dietary={food.dietary} isVeg={food.isVeg} size="sm" />
                        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                          {food.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {/* Preparation Time Chip with High Contrast */}
                        <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md ${
                          mins <= 3 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : mins <= 5
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>{food.prepTime}</span>
                        </span>

                        <span className="text-xs font-black text-slate-900 font-['Outfit']">
                          ₹{food.price}
                        </span>

                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          • {food.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add / Quantity Controls */}
                  <div className="shrink-0 flex items-center gap-2">
                    {qty > 0 ? (
                      <div className="flex items-center gap-1.5 bg-blue-50 p-1 rounded-xl border border-blue-200">
                        <button
                          id={`prep-time-minus-${food.id}`}
                          onClick={() => onUpdateCartQty(food.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white hover:bg-slate-100 text-slate-800 flex items-center justify-center cursor-pointer shadow-2xs active:scale-95 transition-all"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-black text-blue-700 font-['Outfit']">
                          {qty}
                        </span>
                        <button
                          id={`prep-time-plus-${food.id}`}
                          onClick={() => onAddToCart(food)}
                          className="w-7 h-7 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center cursor-pointer shadow-2xs active:scale-95 transition-all"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`prep-time-add-${food.id}`}
                        onClick={() => onAddToCart(food)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Tray Bar if items are added */}
        {totalCartCount > 0 && (
          <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-[11px]">
                {totalCartCount}
              </span>
              <div>
                <p className="font-bold text-slate-900">
                  Total: <span className="text-blue-700 font-black font-['Outfit']">₹{totalCartAmount}</span>
                </p>
                <p className="text-[10px] text-slate-400">Items added to your tray</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Keep Browsing
              </button>
              <button
                id="prep-time-view-tray-btn"
                onClick={() => {
                  onClose();
                  onOpenCart();
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md shadow-blue-600/25 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>View Tray & Order</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
