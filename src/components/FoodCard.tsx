import React from 'react';
import { 
  Star, 
  Clock, 
  Flame, 
  Plus, 
  Minus, 
  Check, 
  Edit, 
  Trash2
} from 'lucide-react';
import { FoodItem, AvailabilityStatus } from '../types';
import { DietaryBadge } from './DietaryBadge';
import { handleImageError } from '../utils/imageUtils';

interface FoodCardProps {
  food: FoodItem;
  quantityInCart: number;
  onAddToCart: (food: FoodItem) => void;
  onUpdateCartQty: (foodId: string, delta: number) => void;
  onOpenReviews: (food: FoodItem) => void;
  onOpenDetails: (food: FoodItem) => void;
  isStaff?: boolean;
  onStaffEdit?: (food: FoodItem) => void;
  onStaffDelete?: (food: FoodItem) => void;
  onStaffToggleAvailability?: (foodId: string, current: AvailabilityStatus) => void;
  onStaffToggleSpecial?: (foodId: string, isSpecial: boolean) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  quantityInCart,
  onAddToCart,
  onUpdateCartQty,
  onOpenReviews,
  onOpenDetails,
  isStaff = false,
  onStaffEdit,
  onStaffDelete,
  onStaffToggleAvailability,
  onStaffToggleSpecial
}) => {
  const isSoldOut = food.availability === 'sold_out';

  const renderSpice = (level: number) => {
    if (level === 0) return null;
    return (
      <span className="flex items-center text-xs" title={`Spice Level: ${level}/3`}>
        {Array.from({ length: level }).map((_, i) => (
          <span key={i} className="text-xs">🌶️</span>
        ))}
      </span>
    );
  };

  const getAvailabilityBadge = () => {
    switch (food.availability) {
      case 'in_stock':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            In Stock
          </span>
        );
      case 'making_fresh':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Making Fresh
          </span>
        );
      case 'sold_out':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Sold Out
          </span>
        );
    }
  };

  return (
    <div 
      id={`food-card-${food.id}`}
      className={`group bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden relative shadow-xs hover:shadow-xl ${
        isSoldOut ? 'opacity-85 border-slate-200 bg-slate-50/50' : 'border-burgundy-100/90 hover:border-burgundy-300'
      }`}
    >
      {/* Top badges */}
      <div className="relative">
        <div 
          onClick={() => onOpenDetails(food)}
          className="w-full h-44 overflow-hidden relative cursor-pointer bg-slate-100"
        >
          <img
            src={food.imageUrl}
            alt={food.name}
            onError={(e) => handleImageError(e, food.category, food.dietary)}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              isSoldOut ? 'grayscale-40' : ''
            }`}
            loading="lazy"
          />

          {/* Gradient overlay on bottom of image for readability */}
          <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-black/20 pointer-events-none" />

          {/* Prep time badge */}
          <div className="absolute bottom-2.5 left-2.5 bg-black/65 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-200" />
            <span>{food.prepTime}</span>
          </div>

          {/* Calories badge */}
          {food.calories && (
            <div className="absolute bottom-2.5 right-2.5 bg-black/65 backdrop-blur-xs text-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-md">
              {food.calories} kcal
            </div>
          )}
        </div>

        {/* Special Flame Tag */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
          {food.isSpecial && (
            <span className="flex items-center gap-1 bg-linear-to-r from-orange-600 to-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md">
              <Flame className="w-3 h-3 fill-white" />
              <span>Special</span>
            </span>
          )}
        </div>

        {/* FSSAI Dietary Badge (Veg, Egg, Non-Veg) */}
        <div className="absolute top-2.5 right-2.5 z-10 bg-white/95 backdrop-blur-xs px-1.5 py-1 rounded-lg shadow-xs border border-slate-100">
          <DietaryBadge dietary={food.dietary} isVeg={food.isVeg} showText={true} />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            {getAvailabilityBadge()}
            {renderSpice(food.spiceLevel)}
          </div>

          <h3 
            onClick={() => onOpenDetails(food)}
            className="font-bold text-slate-900 text-base leading-snug group-hover:text-burgundy-800 transition-colors line-clamp-1 cursor-pointer"
          >
            {food.name}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 my-1.5 leading-relaxed">
            {food.description}
          </p>

          {/* Cravings tags preview */}
          {food.cravings && food.cravings.length > 0 && (
            <div className="flex flex-wrap gap-1 my-2">
              {food.cravings.slice(0, 2).map((c, i) => (
                <span 
                  key={i} 
                  className="text-[10px] bg-[#FAF7F8] text-burgundy-900 border border-burgundy-100 font-medium px-2 py-0.5 rounded-md"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Rating and Price row */}
        <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-extrabold text-burgundy-950 font-['Outfit']">
                ₹{food.price}
              </span>
            </div>

            {/* Clickable reviews count */}
            <button
              id={`food-reviews-btn-${food.id}`}
              onClick={() => onOpenReviews(food)}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-burgundy-800 transition-colors cursor-pointer"
              title="View student reviews and ratings"
            >
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{food.rating.toFixed(1)}</span>
              <span className="text-slate-400 font-normal">({food.reviewsCount})</span>
            </button>
          </div>

          {/* Student Add To Tray controls */}
          {!isStaff && (
            <div>
              {isSoldOut ? (
                <button
                  disabled
                  className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 text-xs font-bold cursor-not-allowed"
                >
                  Sold Out
                </button>
              ) : quantityInCart > 0 ? (
                <div className="flex items-center gap-1.5 bg-burgundy-900 text-white rounded-xl p-1 shadow-sm">
                  <button
                    id={`cart-decrease-${food.id}`}
                    onClick={() => onUpdateCartQty(food.id, -1)}
                    className="w-6 h-6 rounded-lg bg-black/20 hover:bg-black/30 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="text-xs font-black px-1.5">{quantityInCart}</span>
                  <button
                    id={`cart-increase-${food.id}`}
                    onClick={() => onUpdateCartQty(food.id, 1)}
                    className="w-6 h-6 rounded-lg bg-black/20 hover:bg-black/30 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  id={`add-tray-${food.id}`}
                  onClick={() => onAddToCart(food)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-burgundy-900 hover:bg-burgundy-950 text-white text-xs font-bold shadow-md shadow-burgundy-950/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Staff Quick Action Bar (Only shown if isStaff === true) */}
        {isStaff && (
          <div className="pt-3 mt-3 border-t border-slate-200 bg-slate-50 -mx-4 -mb-4 p-3 flex items-center justify-between gap-1.5">
            <button
              id={`staff-avail-btn-${food.id}`}
              onClick={() => onStaffToggleAvailability?.(food.id, food.availability)}
              className="px-2 py-1 bg-white border border-slate-200 hover:border-blue-400 rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer"
              title="Click to cycle status"
            >
              Status 🔄
            </button>

            <button
              id={`staff-special-btn-${food.id}`}
              onClick={() => onStaffToggleSpecial?.(food.id, !food.isSpecial)}
              className={`p-1.5 rounded-lg border text-xs cursor-pointer ${
                food.isSpecial 
                  ? 'bg-orange-500 text-white border-orange-600' 
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
              title="Toggle Today's Special"
            >
              <Flame className="w-3.5 h-3.5" />
            </button>

            <button
              id={`staff-edit-btn-${food.id}`}
              onClick={() => onStaffEdit?.(food)}
              className="p-1.5 bg-white border border-slate-200 hover:border-blue-400 text-slate-700 rounded-lg cursor-pointer"
              title="Edit Food Details & Price"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>

            <button
              id={`staff-del-btn-${food.id}`}
              onClick={() => onStaffDelete?.(food)}
              className="p-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
              title="Delete Food Item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
