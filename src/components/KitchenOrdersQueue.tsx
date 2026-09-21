import React, { useState } from 'react';
import { 
  Bell, 
  ChefHat, 
  Clock, 
  User, 
  CheckCircle, 
  Utensils, 
  Volume2, 
  Filter, 
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  Flame,
  Search
} from 'lucide-react';
import { PlacedOrder } from '../types';
import { DietaryBadge } from './DietaryBadge';
import { playOrderAlertChime } from '../utils/audioAlert';

interface KitchenOrdersQueueProps {
  orders: PlacedOrder[];
  onUpdateOrderStatus: (orderId: string, status: PlacedOrder['status']) => void;
  onOpenNotificationModal?: (order: PlacedOrder) => void;
}

export const KitchenOrdersQueue: React.FC<KitchenOrdersQueueProps> = ({
  orders,
  onUpdateOrderStatus,
  onOpenNotificationModal
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const preparingCount = orders.filter(o => o.status === 'Preparing').length;
  const readyCount = orders.filter(o => o.status === 'Ready for Pickup').length;
  const completedCount = orders.filter(o => o.status === 'Completed').length;

  const filteredOrders = orders.filter(order => {
    // Status filter
    if (filterStatus !== 'all' && order.status !== filterStatus) {
      return false;
    }
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesId = order.id.toLowerCase().includes(q);
      const matchesToken = order.tokenNumber.toLowerCase().includes(q);
      const matchesStudent = order.studentName.toLowerCase().includes(q);
      const matchesItem = order.items.some(i => i.food.name.toLowerCase().includes(q));
      return matchesId || matchesToken || matchesStudent || matchesItem;
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Header & Live Kitchen Metrics */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-burgundy-900 text-amber-300 flex items-center justify-center font-bold shadow-md shadow-burgundy-950/20">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 font-['Outfit']">
                  Chef's Live Kitchen Orders Board
                </h2>
                {pendingCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black animate-pulse flex items-center gap-1">
                    <Bell className="w-3 h-3 text-amber-700" />
                    {pendingCount} New
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time incoming student orders, itemized tokens, and pickup dispatch
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playOrderAlertChime()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-burgundy-50 hover:bg-burgundy-100 text-burgundy-900 border border-burgundy-200 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
              title="Test or play kitchen order bell chime"
            >
              <Volume2 className="w-4 h-4 text-burgundy-800" />
              <span>Test Bell Chime</span>
            </button>
          </div>
        </div>

        {/* Status Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <button
            onClick={() => setFilterStatus('Pending')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              filterStatus === 'Pending'
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm ring-2 ring-amber-300'
                : 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/80 text-amber-900'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">🔔 Pending</span>
              <span className="text-xs font-bold">{pendingCount}</span>
            </div>
            <p className="text-2xl font-black font-['Outfit']">{pendingCount}</p>
            <span className={`text-[10px] font-medium ${filterStatus === 'Pending' ? 'text-amber-100' : 'text-amber-700'}`}>
              New orders awaiting prep
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('Preparing')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              filterStatus === 'Preparing'
                ? 'bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-300'
                : 'bg-blue-50/70 border-blue-200 hover:bg-blue-100/80 text-blue-950'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">👨‍🍳 Cooking</span>
              <span className="text-xs font-bold">{preparingCount}</span>
            </div>
            <p className="text-2xl font-black font-['Outfit']">{preparingCount}</p>
            <span className={`text-[10px] font-medium ${filterStatus === 'Preparing' ? 'text-blue-100' : 'text-blue-700'}`}>
              In kitchen preparation
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('Ready for Pickup')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              filterStatus === 'Ready for Pickup'
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-300'
                : 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-100/80 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">📢 Ready</span>
              <span className="text-xs font-bold">{readyCount}</span>
            </div>
            <p className="text-2xl font-black font-['Outfit']">{readyCount}</p>
            <span className={`text-[10px] font-medium ${filterStatus === 'Ready for Pickup' ? 'text-emerald-100' : 'text-emerald-700'}`}>
              Ready at Counter #2
            </span>
          </button>

          <button
            onClick={() => setFilterStatus('Completed')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              filterStatus === 'Completed'
                ? 'bg-slate-800 text-white border-slate-900 shadow-sm ring-2 ring-slate-400'
                : 'bg-slate-100 border-slate-200 hover:bg-slate-200/80 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider">✅ Completed</span>
              <span className="text-xs font-bold">{completedCount}</span>
            </div>
            <p className="text-2xl font-black font-['Outfit']">{completedCount}</p>
            <span className={`text-[10px] font-medium ${filterStatus === 'Completed' ? 'text-slate-200' : 'text-slate-500'}`}>
              Handed over to students
            </span>
          </button>
        </div>

        {/* Filter Toolbar & Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {(['all', 'Pending', 'Preparing', 'Ready for Pickup', 'Completed'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === status
                    ? 'bg-burgundy-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {status === 'all' ? 'All Orders' : status}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, student, item..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-burgundy-800 focus:bg-white font-medium"
            />
          </div>
        </div>
      </div>

      {/* Orders Grid / Cards */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-burgundy-50 text-burgundy-800 flex items-center justify-center mx-auto">
            <Utensils className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 font-['Outfit']">
            No Orders in this View
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {filterStatus === 'all'
              ? 'No student orders received yet today. When students order from the menu, orders with item lists will pop up here in real time.'
              : `No orders currently matching the "${filterStatus}" status filter.`}
          </p>
          {filterStatus !== 'all' && (
            <button
              onClick={() => setFilterStatus('all')}
              className="px-4 py-2 rounded-xl bg-burgundy-900 text-white text-xs font-bold hover:bg-burgundy-950 transition-colors cursor-pointer"
            >
              Show All Orders
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map(order => {
            const isPending = order.status === 'Pending';
            const isPreparing = order.status === 'Preparing';
            const isReady = order.status === 'Ready for Pickup';
            const isCompleted = order.status === 'Completed';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md flex flex-col justify-between ${
                  isPending
                    ? 'border-amber-400 ring-2 ring-amber-400/20'
                    : isPreparing
                    ? 'border-blue-300'
                    : isReady
                    ? 'border-emerald-300'
                    : 'border-slate-200 opacity-80'
                }`}
              >
                {/* Order Top Bar */}
                <div className={`p-4 sm:p-5 border-b flex items-start justify-between gap-3 ${
                  isPending ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50/60 border-slate-100'
                }`}>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-sm text-burgundy-950 bg-white px-2 py-0.5 rounded-lg border border-burgundy-200 shadow-2xs">
                        #{order.id}
                      </span>
                      <span className="font-mono font-black text-xs text-amber-900 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-200">
                        Token #{order.tokenNumber}
                      </span>
                      {isPending && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200 px-2 py-0.5 rounded-md animate-pulse">
                          <Bell className="w-3 h-3" />
                          New Received
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
                      <span className="flex items-center gap-1 font-bold text-slate-900">
                        <User className="w-3.5 h-3.5 text-burgundy-800" />
                        {order.studentName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {order.timestamp}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold inline-flex items-center gap-1 ${
                      isPending
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : isPreparing
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : isReady
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-slate-200 text-slate-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Itemized List Ordered by Student */}
                <div className="p-4 sm:p-5 flex-1 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-burgundy-800" />
                      Items Ordered ({order.items.reduce((s, i) => s + i.quantity, 0)})
                    </span>
                    <span className="text-burgundy-950 font-black font-['Outfit'] text-sm">
                      Total: ₹{order.totalAmount}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="bg-[#FAF7F8] rounded-2xl p-3 border border-burgundy-100/80 divide-y divide-burgundy-100/60 space-y-2">
                    {order.items.map((it, idx) => (
                      <div key={idx} className={`flex items-center justify-between gap-2 pt-1.5 ${idx === 0 ? 'pt-0' : ''}`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-6 h-6 rounded-lg bg-burgundy-900 text-white text-xs font-black flex items-center justify-center shrink-0">
                            {it.quantity}×
                          </span>
                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <DietaryBadge dietary={it.food.dietary} isVeg={it.food.isVeg} size="sm" />
                              <span className="text-xs font-extrabold text-slate-900 truncate">
                                {it.food.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500">
                              Prep ~{it.food.prepTime}
                            </span>
                          </div>
                        </div>

                        <span className="font-mono text-xs font-bold text-slate-700 shrink-0">
                          ₹{it.food.price * it.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Student Custom Note if provided */}
                  {order.studentNotes && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-medium">
                      📝 <strong className="font-bold">Student Note:</strong> {order.studentNotes}
                    </div>
                  )}
                </div>

                {/* Bottom Chef Action Controls */}
                <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      if (onOpenNotificationModal) {
                        onOpenNotificationModal(order);
                      }
                    }}
                    className="text-xs text-burgundy-800 hover:text-burgundy-950 font-bold underline cursor-pointer"
                  >
                    View Notification Card
                  </button>

                  <div className="flex items-center gap-2">
                    {isPending && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'Preparing')}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black font-['Outfit'] shadow-md shadow-blue-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Start Preparing</span>
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'Ready for Pickup')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black font-['Outfit'] shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Bell className="w-4 h-4" />
                        <span>Mark Ready for Pickup</span>
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => onUpdateOrderStatus(order.id, 'Completed')}
                        className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black font-['Outfit'] shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Hand Over (Done)</span>
                      </button>
                    )}

                    {isCompleted && (
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                        Order Fulfilled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
