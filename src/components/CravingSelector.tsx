import React from 'react';
import { Sparkles, Flame, Cookie, Zap, Coffee, Utensils, Heart } from 'lucide-react';

interface CravingSelectorProps {
  selectedCraving: string | null;
  onSelectCraving: (craving: string | null) => void;
}

export const CRAVINGS = [
  { id: 'Spicy Kick', label: 'Spicy Kick', icon: '🌶️', desc: 'Tangy masala, chutney & heat' },
  { id: 'Crispy & Crunchy', label: 'Crispy & Crunchy', icon: '🍟', desc: 'Freshly fried hot bites' },
  { id: 'Sweet Tooth', label: 'Sweet Tooth', icon: '🍫', desc: 'Desserts & sweet treats' },
  { id: 'Quick Bite (<5 mins)', label: 'Quick Bite (<5 mins)', icon: '⚡', desc: 'Zero wait lecture fuel' },
  { id: 'Hearty & Filling', label: 'Hearty & Filling', icon: '🍛', desc: 'Full hunger buster meals' },
  { id: 'Chilled Drink', label: 'Chilled Drink', icon: '🥤', desc: 'Cold sips & refreshments' }
];

export const CravingSelector: React.FC<CravingSelectorProps> = ({
  selectedCraving,
  onSelectCraving
}) => {
  return (
    <section className="mb-8 sm:mb-14 bg-white p-4 sm:p-6 rounded-3xl border border-burgundy-100/90 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 pb-3 border-b border-burgundy-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-burgundy-50 border border-burgundy-200/80 text-burgundy-800 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-burgundy-700" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-['Outfit']">
                Craving-Based Discovery
              </h3>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-burgundy-50 text-burgundy-800 border border-burgundy-200 px-2 py-0.5 rounded-md">
                All 6 Cravings
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Tap any craving to filter instant canteen bites for your break
            </p>
          </div>
        </div>

        {selectedCraving && (
          <button
            id="clear-craving-btn"
            type="button"
            onClick={() => onSelectCraving(null)}
            className="self-start sm:self-auto text-xs font-extrabold text-burgundy-900 hover:text-white bg-burgundy-100 hover:bg-burgundy-900 px-3.5 py-1.5 rounded-full transition-all cursor-pointer border border-burgundy-200 shadow-2xs"
          >
            Clear: {selectedCraving} ✕
          </button>
        )}
      </div>

      {/* Responsive Grid: All craving features are 100% visible on mobile phones without horizontal cutoff */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {CRAVINGS.map((c) => {
          const isSelected = selectedCraving === c.id;
          return (
            <button
              key={c.id}
              id={`craving-${c.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              type="button"
              onClick={() => onSelectCraving(isSelected ? null : c.id)}
              className={`flex flex-col justify-between p-3 rounded-2xl text-left transition-all cursor-pointer min-h-[72px] sm:min-h-[82px] active:scale-95 ${
                isSelected
                  ? 'bg-burgundy-900 text-white shadow-md shadow-burgundy-950/20 ring-2 ring-burgundy-400 scale-[1.02]'
                  : 'bg-[#FAF7F8] hover:bg-white text-slate-800 border border-burgundy-100/90 hover:border-burgundy-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xl sm:text-2xl">{c.icon}</span>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-white shadow-xs animate-ping" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold leading-tight line-clamp-1">{c.label}</p>
                <p className={`text-[10px] font-medium leading-tight mt-0.5 line-clamp-1 ${isSelected ? 'text-burgundy-100' : 'text-slate-400'}`}>
                  {c.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
