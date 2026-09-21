import React from 'react';
import { Flame, Star, Plus, Check, Clock, Sparkles } from 'lucide-react';
import { FoodItem } from '../types';
import { DietaryBadge } from './DietaryBadge';
import { handleImageError } from '../utils/imageUtils';

interface TodaysSpecialProps {
  specials: FoodItem[];
  onAddToCart: (food: FoodItem) => void;
  onOpenDetails: (food: FoodItem) => void;
  cartItemIds: Record<string, number>;
}

export const TodaysSpecial: React.FC<TodaysSpecialProps> = ({
  specials,
  onAddToCart,
  onOpenDetails,
  cartItemIds
}) => {
  if (specials.length === 0) return null;

  return (
    <section className="mb-12 sm:mb-16">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-burgundy-900 to-burgundy-950 text-white flex items-center justify-center shadow-md shadow-burgundy-950/25 shrink-0 border border-burgundy-800">
            <Flame className="w-6 h-6 fill-amber-300 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight flex items-center gap-2">
              Today's Special
              <span className="text-[11px] font-bold uppercase tracking-wider bg-burgundy-100 text-burgundy-900 px-2.5 py-0.5 rounded-full border border-burgundy-200/60">
                Fresh Kitchen Specials
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Handcrafted canteen highlights prepared fresh in limited batches today
            </p>
          </div>
        </div>
      </div>

      {/* Grid for specials */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {specials.map((item) => {
          const qty = cartItemIds[item.id] || 0;
          const isSoldOut = item.availability === 'sold_out';

          return (
            <div
              key={item.id}
              id={`special-card-${item.id}`}
              className="group bg-white rounded-3xl p-3.5 border-2 border-burgundy-200/80 hover:border-burgundy-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Flame special ribbon */}
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1 bg-linear-to-r from-burgundy-900 to-burgundy-950 text-amber-300 text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-md border border-burgundy-800">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{item.specialTag || "Today's Special"}</span>
              </div>

              {/* FSSAI Dietary Badge (Veg, Egg, Non-Veg) */}
              <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-xs p-1.5 rounded-lg shadow-xs border border-slate-100">
                <DietaryBadge dietary={item.dietary} isVeg={item.isVeg} showText={true} />
              </div>

              <div>
                {/* Image */}
                <div 
                  onClick={() => onOpenDetails(item)}
                  className="w-full h-40 rounded-2xl overflow-hidden mb-3 relative cursor-pointer bg-slate-100"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    onError={(e) => handleImageError(e, item.category, item.dietary)}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/65 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-200" />
                    <span>{item.prepTime}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h3 
                    onClick={() => onOpenDetails(item)}
                    className="font-bold text-slate-900 text-base group-hover:text-burgundy-800 transition-colors line-clamp-1 cursor-pointer"
                  >
                    {item.name}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Footer with Price & Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-extrabold text-burgundy-950 font-['Outfit']">
                      ₹{item.price}
                    </span>
                    <span className="text-[10px] text-slate-400 line-through">
                      ₹{Math.round(item.price * 1.2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{item.rating.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({item.reviewsCount})</span>
                  </div>
                </div>

                <button
                  id={`add-special-${item.id}`}
                  disabled={isSoldOut}
                  onClick={() => onAddToCart(item)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSoldOut
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : qty > 0
                      ? 'bg-burgundy-900 text-white shadow-xs'
                      : 'bg-burgundy-900 hover:bg-burgundy-950 text-white shadow-md shadow-burgundy-950/20 active:scale-95'
                  }`}
                >
                  {isSoldOut ? (
                    'Sold Out'
                  ) : qty > 0 ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added ({qty})</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Tray</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
