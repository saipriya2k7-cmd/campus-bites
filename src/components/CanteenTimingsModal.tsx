import React, { useEffect } from 'react';
import { X, Clock, Coffee, Utensils, Sunrise, Sun, Sunset, Sparkles, Check, Zap } from 'lucide-react';
import { CanteenInfo, MealSlotId } from '../types';
import { getResolvedSlotInfo } from '../utils/timingUtils';

interface CanteenTimingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  canteenInfo?: CanteenInfo | null;
  onSelectSlot?: (slot: MealSlotId) => void;
}

export const CanteenTimingsModal: React.FC<CanteenTimingsModalProps> = ({
  isOpen,
  onClose,
  canteenInfo,
  onSelectSlot
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const resolved = getResolvedSlotInfo(canteenInfo);

  const getRushBadge = (rush?: string) => {
    switch (rush) {
      case 'low':
        return {
          label: 'Low Rush • Quick service (~3-5 mins)',
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500'
        };
      case 'high':
        return {
          label: 'High Rush Hour • Plan ahead (~12-15 mins)',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500'
        };
      case 'moderate':
      default:
        return {
          label: 'Moderate Rush • Normal wait (~7-10 mins)',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500'
        };
    }
  };

  const rush = getRushBadge(canteenInfo?.rushLevel);

  return (
    <div 
      id="canteen-timings-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="timings-modal-title"
    >
      <div 
        id="canteen-timings-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative overflow-hidden my-auto cursor-default animate-in zoom-in-95 duration-200"
      >
        {/* Top Close Button */}
        <button
          id="close-timings-modal-btn"
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-burgundy-50 text-burgundy-900 flex items-center justify-center shrink-0 shadow-xs border border-burgundy-100">
            <Clock className="w-6 h-6 text-burgundy-900" />
          </div>
          <div>
            <h3 id="timings-modal-title" className="text-xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
              Canteen Timings & Meal Shifts
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Campus Central Cafeteria • Live Automated Schedule
            </p>
          </div>
        </div>

        {/* Live Status Badge */}
        <div className="space-y-2.5 mb-5">
          <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${rush.bg}`}>
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${rush.dot} animate-pulse shrink-0`} />
              <div>
                <p className="text-xs font-bold leading-tight">Live Counter Status</p>
                <p className="text-xs opacity-90">{rush.label}</p>
              </div>
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white shadow-2xs shrink-0">
              {resolved.isKitchenOpen ? '🟢 Kitchen Open' : '🔴 Kitchen Closed'}
            </span>
          </div>

          <div className="bg-[#FAF7F8] p-3.5 rounded-2xl border border-burgundy-100 text-xs text-slate-800 flex items-start gap-2.5">
            <Zap className="w-4 h-4 text-burgundy-900 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Active Shift:</span> {resolved.activeLabel} ({resolved.activeTimeRange})
              <p className="text-slate-500 mt-0.5 font-medium">Upcoming Next: {resolved.nextSlotLabel}</p>
            </div>
          </div>
        </div>

        {/* Daily Meal Schedule Cards */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Meal Shifts (Click any to view dishes)
            </h4>
            {resolved.isAuto ? (
              <span className="text-[10px] text-burgundy-900 font-bold bg-burgundy-50 px-2 py-0.5 rounded-md border border-burgundy-200">
                ⚡ Synced to Clock
              </span>
            ) : (
              <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                📌 Staff Pinned
              </span>
            )}
          </div>

          {resolved.slots.map((slot) => {
            const isMorning = slot.id === 'morning';
            const isAfternoon = slot.id === 'afternoon';
            const Icon = isMorning ? Sunrise : isAfternoon ? Sun : Sunset;
            const iconColor = isMorning ? 'text-amber-600 bg-amber-50' : isAfternoon ? 'text-orange-600 bg-orange-50' : 'text-burgundy-900 bg-burgundy-50';

            return (
              <div
                key={slot.id}
                onClick={() => {
                  if (onSelectSlot) {
                    onSelectSlot(slot.id);
                    onClose();
                  }
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  slot.isActive
                    ? 'border-burgundy-800 bg-burgundy-50/50 shadow-xs ring-1 ring-burgundy-800/30'
                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColor} border border-slate-200/60`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {slot.name}
                        </p>
                        {slot.isActive && (
                          <span className="text-[10px] text-burgundy-900 bg-burgundy-100 font-extrabold px-1.5 py-0.2 rounded-md">
                            Active Now
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate">{slot.popularDishes}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                      {slot.timeRangeFormatted}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Helpful student tip */}
        <div className="p-3 bg-[#FAF7F8] rounded-2xl border border-burgundy-100 text-center mb-5">
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            💡 <span className="font-bold text-slate-800">Campus Note:</span> Fresh batches prepared for each timing. You can toggle between Morning, Afternoon, or Evening anytime on the main menu.
          </p>
        </div>

        {/* Bottom Close Button */}
        <button
          id="close-timings-bottom-btn"
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-burgundy-900 hover:bg-burgundy-950 text-white text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-98 flex items-center justify-center gap-1.5"
        >
          <Check className="w-4 h-4 text-amber-300" />
          <span>Got it, close</span>
        </button>
      </div>
    </div>
  );
};
