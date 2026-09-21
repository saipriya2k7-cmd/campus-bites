import React from 'react';
import { 
  Bell, 
  ChefHat, 
  X, 
  CheckCircle, 
  Clock, 
  User, 
  Utensils, 
  ArrowRight,
  Flame,
  Volume2
} from 'lucide-react';
import { PlacedOrder } from '../types';
import { DietaryBadge } from './DietaryBadge';
import { playOrderAlertChime } from '../utils/audioAlert';

interface ChefOrderNotificationModalProps {
  order: PlacedOrder | null;
  onClose: () => void;
  onStartPreparing?: (orderId: string) => void;
  onOpenKitchenQueue?: () => void;
}

export const ChefOrderNotificationModal: React.FC<ChefOrderNotificationModalProps> = ({
  order,
  onClose,
  onStartPreparing,
  onOpenKitchenQueue
}) => {
  if (!order) return null;

  return (
    <div 
      id="chef-order-notification-backdrop"
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="chef-order-notif-title"
    >
      <div 
        id="chef-order-notification-card"
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border-2 border-burgundy-600 relative overflow-hidden animate-in zoom-in-95 duration-200 ring-4 ring-burgundy-900/10"
      >
        {/* Animated Top Glow Ribbon */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-burgundy-700 to-rose-600 animate-pulse" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer z-10"
          aria-label="Dismiss notification"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Notification Header */}
        <div className="flex items-start gap-3.5 mb-5 pr-8">
          <div className="w-13 h-13 rounded-2xl bg-burgundy-900 text-white flex items-center justify-center shrink-0 shadow-lg shadow-burgundy-950/30 border border-burgundy-800 relative">
            <ChefHat className="w-7 h-7 text-amber-300" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] font-black text-white items-center justify-center">!</span>
            </span>
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider mb-1 border border-amber-300">
              <Bell className="w-3 h-3 text-amber-700 animate-bounce" />
              New Order Received
            </div>
            <h3 id="chef-order-notif-title" className="text-xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
              Order #{order.id} is Received!
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Token <strong className="text-burgundy-950 font-mono text-sm bg-burgundy-50 px-1.5 py-0.5 rounded border border-burgundy-200">#{order.tokenNumber}</strong> • Ordered by <strong className="text-slate-900">{order.studentName}</strong>
            </p>
          </div>
        </div>

        {/* Student & Order Metadata Pill */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-burgundy-50 rounded-2xl border border-burgundy-200/80 mb-4 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-burgundy-800 shrink-0" />
            <div className="truncate">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Student</p>
              <p className="font-bold text-slate-900 truncate">{order.studentName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-burgundy-800 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Placed At</p>
              <p className="font-bold text-slate-900">{order.timestamp}</p>
            </div>
          </div>
        </div>

        {/* Item List Ordered by Student */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-burgundy-800" />
              Item List Ordered by Student ({order.items.reduce((s, i) => s + i.quantity, 0)} items)
            </span>
            <button
              onClick={() => playOrderAlertChime()}
              className="text-[11px] font-bold text-burgundy-800 hover:text-burgundy-950 flex items-center gap-1 cursor-pointer"
              title="Replay kitchen chime"
            >
              <Volume2 className="w-3 h-3" />
              Replay Chime
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 max-h-56 overflow-y-auto shadow-inner">
            {order.items.map((cartItem, idx) => (
              <div key={idx} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-burgundy-900 text-white text-xs font-black flex items-center justify-center shrink-0">
                    {cartItem.quantity}×
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <DietaryBadge dietary={cartItem.food.dietary} isVeg={cartItem.food.isVeg} size="sm" />
                      <p className="text-xs font-extrabold text-slate-900 truncate">
                        {cartItem.food.name}
                      </p>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      ₹{cartItem.food.price} each • Prep: {cartItem.food.prepTime}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-burgundy-950 font-['Outfit']">
                    ₹{cartItem.food.price * cartItem.quantity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Student Special Instructions / Notes if any */}
          {order.studentNotes && (
            <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
              📝 <strong>Student Note:</strong> {order.studentNotes}
            </div>
          )}

          {/* Bill Summary */}
          <div className="flex items-center justify-between mt-3 px-3 py-2 bg-[#FAF7F8] rounded-xl border border-burgundy-100 text-xs">
            <span className="font-bold text-slate-600">Total Order Value:</span>
            <span className="text-base font-black text-burgundy-950 font-['Outfit']">
              ₹{order.totalAmount}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              if (onStartPreparing) onStartPreparing(order.id);
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 active:scale-98 transition-all cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Accept & Start Preparing</span>
          </button>

          <button
            onClick={() => {
              if (onOpenKitchenQueue) onOpenKitchenQueue();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-burgundy-900 hover:bg-burgundy-950 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-burgundy-950/20 active:scale-98 transition-all cursor-pointer"
          >
            <span>Open Kitchen Board</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
