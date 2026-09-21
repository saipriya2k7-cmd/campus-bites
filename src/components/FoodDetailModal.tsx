import React from 'react';
import { 
  X, 
  Star, 
  Clock, 
  Flame, 
  Plus, 
  Minus, 
  Check, 
  MessageSquare, 
  Utensils, 
  Sparkles,
  ShieldAlert,
  Lock
} from 'lucide-react';
import { FoodItem } from '../types';
import { DietaryBadge } from './DietaryBadge';
import { handleImageError } from '../utils/imageUtils';
import { isProminentNonVegFood } from '../utils/dietaryValidation';

interface FoodDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  food: FoodItem | null;
  quantityInCart: number;
  onAddToCart: (food: FoodItem) => void;
  onUpdateCartQty: (foodId: string, delta: number) => void;
  onOpenReviews: (food: FoodItem) => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  isOpen,
  onClose,
  food,
  quantityInCart,
  onAddToCart,
  onUpdateCartQty,
  onOpenReviews
}) => {
  if (!isOpen || !food) return null;

  const isSoldOut = food.availability === 'sold_out';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="food-detail-modal"
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col"
      >
        <button
          id="close-food-detail-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Large Hero Food Image */}
        <div className="h-56 sm:h-64 w-full relative shrink-0 bg-slate-100">
          <img
            src={food.imageUrl}
            alt={food.name}
            onError={(e) => handleImageError(e, food.category, food.dietary)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent" />

          {/* Special & Dietary icons */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="bg-white/95 px-2 py-1 rounded-lg shadow-sm border border-slate-100">
              <DietaryBadge dietary={food.dietary} isVeg={food.isVeg} showText={true} />
            </div>

            {isProminentNonVegFood(food.name, food.description) && (
              <span className="bg-rose-600/90 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Verified Non-Veg</span>
              </span>
            )}

            {food.isSpecial && (
              <span className="bg-orange-500 text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>Special</span>
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-[11px] font-extrabold uppercase tracking-widest bg-emerald-600/90 text-white px-2 py-0.5 rounded-md">
              {food.category}
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold font-['Outfit'] mt-1 leading-tight text-white drop-shadow-sm">
              {food.name}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/70 text-center">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Prep Time
              </span>
              <span className="text-xs font-bold text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-emerald-600" />
                {food.prepTime}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Spice Level
              </span>
              <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                {food.spiceLevel === 0 ? 'Mild' : Array(food.spiceLevel).fill('🌶️').join('')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Energy
              </span>
              <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                {food.calories ? `${food.calories} kcal` : '~250 kcal'}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              About this Dish
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {food.description}
            </p>
          </div>

          {/* Student Ratings & Reviews link */}
          <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-sm font-black text-amber-700 font-['Outfit']">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{food.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                ({food.reviewsCount} verified campus reviews)
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenReviews(food);
              }}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Read / Rate</span>
            </button>
          </div>

          {/* Popular Campus Combo */}
          {food.popularCombo && (
            <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-200/70 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 block">
                  Best Campus Pairing:
                </span>
                <p className="text-xs text-slate-700 font-medium mt-0.5">
                  Frequently paired with <span className="font-bold text-teal-950">{food.popularCombo}</span>
                </p>
              </div>
            </div>
          )}

          {/* Cravings tags */}
          {food.cravings && food.cravings.length > 0 && (
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                Craving Badges
              </span>
              <div className="flex flex-wrap gap-1.5">
                {food.cravings.map((c, i) => (
                  <span
                    key={i}
                    className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-xl"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Price & Add to Cart */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Canteen Price
            </span>
            <span className="text-2xl font-black text-slate-900 font-['Outfit']">
              ₹{food.price}
            </span>
          </div>

          {isSoldOut ? (
            <button
              disabled
              className="px-5 py-2.5 rounded-xl bg-slate-200 text-slate-400 font-bold text-xs cursor-not-allowed"
            >
              Sold Out for Today
            </button>
          ) : quantityInCart > 0 ? (
            <div className="flex items-center gap-2 bg-emerald-600 text-white rounded-xl p-1 shadow-md">
              <button
                onClick={() => onUpdateCartQty(food.id, -1)}
                className="w-8 h-8 rounded-lg bg-black/15 hover:bg-black/25 flex items-center justify-center cursor-pointer transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-black px-2">{quantityInCart} in Tray</span>
              <button
                onClick={() => onUpdateCartQty(food.id, 1)}
                className="w-8 h-8 rounded-lg bg-black/15 hover:bg-black/25 flex items-center justify-center cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="modal-add-to-tray-btn"
              onClick={() => onAddToCart(food)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add to My Tray</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
