import React, { useState, useMemo } from 'react';
import { IndianRupee, Sparkles, Plus, Check, Utensils, X, ArrowRight } from 'lucide-react';
import { FoodItem, DietaryType } from '../types';
import { DietaryBadge } from './DietaryBadge';
import { handleImageError } from '../utils/imageUtils';

interface BudgetFinderProps {
  isOpen: boolean;
  onClose: () => void;
  foods: FoodItem[];
  onAddToCart: (food: FoodItem) => void;
  onAddComboToCart: (food1: FoodItem, food2: FoodItem) => void;
}

export const BudgetFinder: React.FC<BudgetFinderProps> = ({
  isOpen,
  onClose,
  foods,
  onAddToCart,
  onAddComboToCart
}) => {
  const [budget, setBudget] = useState<number>(50);
  const [dietFilter, setDietFilter] = useState<'all' | 'veg' | 'egg' | 'non_veg'>('all');

  const PRESETS = [25, 40, 50, 75, 100, 150];

  // Filter items strictly <= budget and matching dietary preference
  const affordableItems = useMemo(() => {
    return foods
      .filter((item) => {
        const matchesBudget = item.price <= budget && item.availability !== 'sold_out';
        const matchesDiet = dietFilter === 'all' || item.dietary === dietFilter;
        return matchesBudget && matchesDiet;
      })
      .sort((a, b) => b.rating - a.rating);
  }, [foods, budget, dietFilter]);

  // Generate smart 2-item combos that fit within the budget and dietary
  const affordableCombos = useMemo(() => {
    const available = foods.filter((f) => {
      const isAvailable = f.availability !== 'sold_out';
      const matchesDiet = dietFilter === 'all' || f.dietary === dietFilter;
      return isAvailable && matchesDiet;
    });

    const combos: { item1: FoodItem; item2: FoodItem; total: number }[] = [];

    for (let i = 0; i < available.length; i++) {
      for (let j = i + 1; j < available.length; j++) {
        const item1 = available[i];
        const item2 = available[j];
        // Ensure pair makes sense (e.g. snack + beverage or meal + beverage)
        const isComplementary = 
          (item1.category === 'Beverages' && item2.category !== 'Beverages') ||
          (item2.category === 'Beverages' && item1.category !== 'Beverages') ||
          (item1.category === 'Snacks' && item2.category === 'Fast Food');

        const total = item1.price + item2.price;
        if (total <= budget && isComplementary) {
          combos.push({ item1, item2, total });
        }
      }
    }

    return combos.sort((a, b) => b.total - a.total).slice(0, 3);
  }, [foods, budget, dietFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="budget-finder-modal"
        className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] flex flex-col"
      >
        <button
          id="close-budget-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-burgundy-900 text-white flex items-center justify-center shadow-lg shadow-burgundy-950/25 border border-burgundy-800">
            <IndianRupee className="w-7 h-7 text-amber-200" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-['Outfit']">
              "What can I get under ₹{budget}?"
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Student pocket-friendly meals, quick bites, and curated campus combos
            </p>
          </div>
        </div>

        {/* Budget Selector & Dietary Filter */}
        <div className="bg-burgundy-50 p-4 rounded-2xl border border-burgundy-200/80 mb-5 shrink-0 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-burgundy-950">
              Set Your Pocket Budget
            </span>
            <span className="text-2xl font-black text-burgundy-950 font-['Outfit']">
              ₹{budget}
            </span>
          </div>

          <input
            id="budget-slider"
            type="range"
            min="15"
            max="150"
            step="5"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="w-full h-2 bg-burgundy-200 rounded-lg appearance-none cursor-pointer accent-burgundy-800"
          />

          {/* Quick preset chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  id={`preset-budget-${p}`}
                  onClick={() => setBudget(p)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    budget === p
                      ? 'bg-burgundy-900 text-white shadow-xs'
                      : 'bg-white text-burgundy-900 border border-burgundy-200 hover:bg-burgundy-100/60'
                  }`}
                >
                  Under ₹{p}
                </button>
              ))}
            </div>

            {/* Dietary Filter Buttons inside Budget Finder */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-burgundy-200 text-xs font-bold">
              <button
                onClick={() => setDietFilter('all')}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  dietFilter === 'all' ? 'bg-burgundy-900 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDietFilter('veg')}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  dietFilter === 'veg' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                🟢 Veg
              </button>
              <button
                onClick={() => setDietFilter('egg')}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  dietFilter === 'egg' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                🟡 Egg
              </button>
              <button
                onClick={() => setDietFilter('non_veg')}
                className={`px-2 py-0.5 rounded-lg transition-all cursor-pointer ${
                  dietFilter === 'non_veg' ? 'bg-burgundy-800 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                🔴 Non-Veg
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Results */}
        <div className="overflow-y-auto space-y-5 pr-1 flex-1">
          {/* Smart Combos section */}
          {affordableCombos.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold uppercase tracking-wider text-burgundy-950">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Smart Value Combos (Under ₹{budget})</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {affordableCombos.map((combo, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#FAF7F8] rounded-2xl border border-burgundy-200/80 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-900">
                          {combo.item1.name.split('(')[0]} + {combo.item2.name.split('(')[0]}
                        </span>
                        <span className="text-xs font-black text-burgundy-950 font-['Outfit']">
                          ₹{combo.total}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        ₹{combo.item1.price} + ₹{combo.item2.price} = ₹{combo.total} (Campus special combo)
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onAddComboToCart(combo.item1, combo.item2);
                      }}
                      className="mt-2 text-xs font-bold bg-burgundy-900 hover:bg-burgundy-950 text-white py-1.5 px-2.5 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Combo to Tray</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Individual items under budget */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Dishes Under ₹{budget} ({affordableItems.length})
              </span>
            </div>

            {affordableItems.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200">
                <Utensils className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">No items under ₹{budget} matching filter</p>
                <p className="text-[11px] text-slate-400">Try changing the dietary filter or increasing your budget slider above</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {affordableItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-white rounded-2xl border border-burgundy-100 hover:border-burgundy-400 transition-all flex items-center justify-between gap-2.5 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        onError={(e) => handleImageError(e, item.category, item.dietary)}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover shrink-0 bg-slate-100"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 truncate">
                          <DietaryBadge dietary={item.dietary} isVeg={item.isVeg} size="sm" />
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {item.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-extrabold text-burgundy-950 font-['Outfit']">
                            ₹{item.price}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ★ {item.rating.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => onAddToCart(item)}
                      className="shrink-0 p-2 rounded-xl bg-burgundy-50 text-burgundy-900 hover:bg-burgundy-900 hover:text-white transition-colors cursor-pointer border border-burgundy-100"
                      title="Add to tray"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 mt-3 border-t border-burgundy-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            💡 Tap any item or combo to add straight to your tray
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-burgundy-900 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-burgundy-950"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
