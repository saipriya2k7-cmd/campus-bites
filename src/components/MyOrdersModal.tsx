import React, { useState } from 'react';
import { 
  Receipt, 
  X, 
  Clock, 
  CheckCircle2, 
  ChefHat, 
  ShoppingBag, 
  Sparkles, 
  ChevronRight,
  RefreshCw,
  Bell,
  Utensils
} from 'lucide-react';
import { PlacedOrder } from '../types';
import { DietaryBadge } from './DietaryBadge';
import { sanitizeFoodImageUrl } from '../utils/imageUtils';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: PlacedOrder[];
  onViewMenu?: () => void;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({
  isOpen,
  onClose,
  orders,
  onViewMenu
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');

  if (!isOpen) return null;

  // Active orders are those currently in progress: Pending, Preparing, Ready for Pickup
  const activeOrders = orders.filter(
    (o) => o.status === 'Pending' || o.status === 'Preparing' || o.status === 'Ready for Pickup'
  );
  
  // Past orders are Completed
  const pastOrders = orders.filter(
    (o) => o.status === 'Completed'
  );

  const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

  const getStatusStepIndex = (status: PlacedOrder['status']) => {
    switch (status) {
      case 'Pending':
        return 0; // Received by kitchen
      case 'Preparing':
        return 1; // Chef is cooking
      case 'Ready for Pickup':
        return 2; // Ready at counter
      case 'Completed':
        return 3; // Collected
      default:
        return 0;
    }
  };

  const getStatusBadge = (status: PlacedOrder['status']) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Order Received by Kitchen
          </span>
        );
      case 'Preparing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
            <ChefHat className="w-3.5 h-3.5 text-blue-700 animate-bounce" />
            Chef Preparing Your Food
          </span>
        );
      case 'Ready for Pickup':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs animate-pulse">
            <Bell className="w-3.5 h-3.5 text-emerald-700" />
            🔥 READY FOR PICKUP AT COUNTER
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Collected & Enjoyed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        id="my-orders-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200" 
      />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-4 relative z-10">
        <div 
          id="my-orders-modal"
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-slate-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <Receipt className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-black font-['Outfit'] tracking-tight">
                    My Orders
                  </h3>
                  {activeOrders.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-400 text-burgundy-950 shadow-xs">
                      {activeOrders.length} Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-burgundy-200 font-medium">
                  Track live token numbers, kitchen prep & counter pickup
                </p>
              </div>
            </div>

            <button
              id="close-my-orders-btn"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-burgundy-200 hover:text-white transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-4 sm:px-6 pt-3 gap-2 shrink-0">
            <button
              id="tab-active-orders"
              onClick={() => setActiveTab('active')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'active'
                  ? 'border-burgundy-900 text-burgundy-950 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Active Tokens</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === 'active' 
                  ? 'bg-burgundy-900 text-white' 
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {activeOrders.length}
              </span>
            </button>

            <button
              id="tab-past-orders"
              onClick={() => setActiveTab('past')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'past'
                  ? 'border-burgundy-900 text-burgundy-950 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Order History</span>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                activeTab === 'past' 
                  ? 'bg-burgundy-900 text-white' 
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {pastOrders.length}
              </span>
            </button>
          </div>

          {/* Orders Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#FAF7F8]">
            {displayedOrders.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-200/70 text-slate-400 flex items-center justify-center mx-auto">
                  <Receipt className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800 font-['Outfit']">
                    {activeTab === 'active' ? 'No Active Orders' : 'No Order History Yet'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    {activeTab === 'active'
                      ? 'You do not have any orders being prepared right now. Head over to the menu to order your favorite campus meal!'
                      : 'Past completed orders will show up here for your records.'}
                  </p>
                </div>
                {onViewMenu && (
                  <button
                    onClick={() => {
                      onClose();
                      onViewMenu();
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-burgundy-900 hover:bg-burgundy-950 text-white text-xs font-bold shadow-md shadow-burgundy-950/20 cursor-pointer transition-all active:scale-95"
                  >
                    <Utensils className="w-4 h-4 text-amber-300" />
                    <span>Browse Canteen Menu</span>
                  </button>
                )}
              </div>
            ) : (
              displayedOrders.map((order) => {
                const stepIndex = getStatusStepIndex(order.status);
                const isReady = order.status === 'Ready for Pickup';

                return (
                  <div
                    key={order.id}
                    id={`order-card-${order.id}`}
                    className={`bg-white rounded-3xl border transition-all overflow-hidden shadow-xs ${
                      isReady 
                        ? 'border-emerald-300 ring-2 ring-emerald-400/30' 
                        : 'border-burgundy-100 hover:border-burgundy-200'
                    }`}
                  >
                    {/* Top Status Card Header */}
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <div className={`px-3.5 py-1.5 rounded-2xl font-black text-lg font-mono shadow-xs ${
                          isReady 
                            ? 'bg-emerald-600 text-white' 
                            : 'bg-burgundy-900 text-amber-200'
                        }`}>
                          Token #{order.tokenNumber}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900 font-mono">
                              {order.id}
                            </span>
                            <span className="text-[11px] text-slate-400">•</span>
                            <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              {order.timestamp}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Student: <strong className="text-slate-700">{order.studentName}</strong>
                          </p>
                        </div>
                      </div>

                      <div>{getStatusBadge(order.status)}</div>
                    </div>

                    {/* Ready for Pickup Alert Banner */}
                    {isReady && (
                      <div className="p-3.5 bg-emerald-50 border-b border-emerald-200 text-emerald-950 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Bell className="w-4 h-4 animate-bounce" />
                        </div>
                        <div className="text-xs">
                          <p className="font-bold text-emerald-900">
                            Your order is hot and ready at the counter!
                          </p>
                          <p className="text-emerald-700 text-[11px]">
                            Show Token #{order.tokenNumber} to the canteen staff at Ground Floor Counter 1.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Visual Progress Steps (Active Orders) */}
                    <div className="p-4 sm:p-5 bg-white border-b border-slate-100">
                        <div className="grid grid-cols-4 gap-2 relative">
                          {/* Step 1: Placed */}
                          <div className="text-center">
                            <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              stepIndex >= 0 
                                ? 'bg-burgundy-900 text-white' 
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              ✓
                            </div>
                            <span className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mt-1">
                              Received
                            </span>
                          </div>

                          {/* Step 2: Preparing */}
                          <div className="text-center">
                            <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              stepIndex >= 1 
                                ? 'bg-blue-600 text-white shadow-xs' 
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              {stepIndex === 1 ? '🍳' : stepIndex > 1 ? '✓' : '2'}
                            </div>
                            <span className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mt-1">
                              In Kitchen
                            </span>
                          </div>

                          {/* Step 3: Ready */}
                          <div className="text-center">
                            <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              stepIndex >= 2 
                                ? 'bg-emerald-600 text-white shadow-xs animate-pulse' 
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              {stepIndex >= 2 ? '🔔' : '3'}
                            </div>
                            <span className={`block text-[10px] sm:text-[11px] font-bold mt-1 ${
                              stepIndex >= 2 ? 'text-emerald-700 font-extrabold' : 'text-slate-700'
                            }`}>
                              Ready
                            </span>
                          </div>

                          {/* Step 4: Picked Up */}
                          <div className="text-center">
                            <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                              stepIndex >= 3 
                                ? 'bg-slate-800 text-white' 
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              {stepIndex >= 3 ? '✓' : '4'}
                            </div>
                            <span className="block text-[10px] sm:text-[11px] font-bold text-slate-700 mt-1">
                              Collected
                            </span>
                          </div>
                        </div>
                      </div>

                    {/* Ordered Items List */}
                    <div className="p-4 sm:p-5 space-y-2.5">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                        Items in this Order ({order.items.reduce((sum, i) => sum + i.quantity, 0)} total)
                      </p>

                      <div className="divide-y divide-slate-100">
                        {order.items.map((cartItem, idx) => (
                          <div key={idx} className="py-2.5 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={sanitizeFoodImageUrl(cartItem.food.imageUrl, cartItem.food.category, cartItem.food.dietary, cartItem.food.name)}
                                alt={cartItem.food.name}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <DietaryBadge dietary={cartItem.food.dietary} size="sm" />
                                  <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                    {cartItem.food.name}
                                  </p>
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  ₹{cartItem.food.price} × {cartItem.quantity}
                                </p>
                              </div>
                            </div>

                            <span className="text-xs sm:text-sm font-extrabold text-slate-900 shrink-0">
                              ₹{cartItem.food.price * cartItem.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {order.studentNotes && (
                        <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900">
                          <strong>Note to Chef:</strong> {order.studentNotes}
                        </div>
                      )}

                      {/* Total and Payment Status */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm">
                        <div className="text-[11px] text-slate-500 font-medium">
                          Payment: <span className="text-slate-800 font-bold">Pay at Counter / UPI</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs text-slate-500 font-medium">Total Paid:</span>
                          <span className="text-base sm:text-lg font-black text-burgundy-950">
                            ₹{order.totalAmount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
            <p className="text-xs text-slate-500">
              Orders automatically update live when the chef marks them in the kitchen.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
