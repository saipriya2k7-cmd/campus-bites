import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  IndianRupee,
  Utensils,
  User,
  ChefHat,
  Receipt
} from 'lucide-react';
import { CartItem, PlacedOrder } from '../types';
import { DietaryBadge } from './DietaryBadge';
import { handleImageError } from '../utils/imageUtils';
import { createPlacedOrder } from '../services/foodService';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface OrderTrayDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQty: (foodId: string, delta: number) => void;
  onClearCart: () => void;
  onOrderPlaced?: (order: PlacedOrder) => void;
  onViewMyOrders?: () => void;
}

export const OrderTrayDrawer: React.FC<OrderTrayDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onClearCart,
  onOrderPlaced,
  onViewMyOrders
}) => {
  const { user } = useAuth();
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [studentName, setStudentName] = useState(user?.displayName || 'Sai Priya');
  const [studentNotes, setStudentNotes] = useState('');

  // Update student name when auth changes
  useEffect(() => {
    if (user?.displayName) {
      setStudentName(user.displayName);
    }
  }, [user]);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.food.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setIsOrdering(true);

    const tokenNum = 'CB-' + Math.floor(10 + Math.random() * 90);
    const orderId = 'ORD-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder: PlacedOrder = {
      id: orderId,
      tokenNumber: tokenNum,
      studentName: (studentName.trim() || user?.displayName || 'Student').trim(),
      studentId: user?.studentId || undefined,
      studentNotes: studentNotes.trim() || undefined,
      items: [...cartItems],
      totalAmount,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
      status: 'Pending',
      estimatedMinutes: 8,
      notifiedToChef: false
    };

    try {
      await createPlacedOrder(newOrder);
      if (onOrderPlaced) {
        onOrderPlaced(newOrder);
      }
    } catch (err) {
      console.warn('Order dispatch notice:', err);
    }

    setPlacedOrder(newOrder);
    setIsOrdering(false);
    onClearCart();

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.5 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        id="order-tray-drawer"
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-burgundy-100 flex items-center justify-between shrink-0 bg-[#FAF7F8]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-burgundy-900 text-white flex items-center justify-center shadow-md shadow-burgundy-950/20">
              <ShoppingBag className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 font-['Outfit'] text-lg">
                My Food Tray
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {cartItems.length} items ready for campus pickup
              </p>
            </div>
          </div>

          <button
            id="close-tray-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-burgundy-100 text-slate-400 hover:text-burgundy-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {placedOrder ? (
            /* Order Placed Success View */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                  Order Placed Successfully!
                </span>
                <h4 className="text-3xl font-black text-burgundy-950 font-['Outfit'] mt-1">
                  Token #{placedOrder.tokenNumber}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Order ID: <strong className="text-slate-800 font-mono">{placedOrder.id}</strong> • Student: <strong>{placedOrder.studentName}</strong>
                </p>
              </div>

              {/* Chef Notification Status Pill */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-center gap-2 font-medium">
                <ChefHat className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Chef notified with your Order ID & complete item list!</span>
              </div>

              {/* Token Ticket Card with item list breakdown */}
              <div className="bg-[#FAF7F8] p-4 rounded-3xl border border-burgundy-200 text-left space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>Pickup Window:</span>
                  <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                    Counter #2 (Fast Track)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-burgundy-800" />
                    Estimated Prep:
                  </span>
                  <span className="font-bold text-slate-900">~{placedOrder.estimatedMinutes} mins</span>
                </div>

                {/* List of items ordered */}
                <div className="border-t border-burgundy-100 pt-2 space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Dispatched to Chef ({placedOrder.items.reduce((s, i) => s + i.quantity, 0)} items)
                  </p>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {placedOrder.items.map((it, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-800 font-medium">
                          {it.quantity}× {it.food.name}
                        </span>
                        <span className="font-mono text-slate-600">₹{it.food.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 border-t border-burgundy-200/80 pt-2 font-bold">
                  <span>Total Paid at Counter:</span>
                  <span className="text-sm font-black text-burgundy-950 font-['Outfit']">
                    ₹{placedOrder.totalAmount}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-burgundy-50 rounded-2xl border border-burgundy-100 text-xs text-burgundy-900 font-medium">
                🔔 <span className="font-bold">Live Counter Display:</span> Token #{placedOrder.tokenNumber} will be called out when ready for pickup.
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  id="track-in-my-orders-btn"
                  type="button"
                  onClick={() => {
                    setPlacedOrder(null);
                    onClose();
                    if (onViewMyOrders) onViewMyOrders();
                  }}
                  className="py-3 px-3 rounded-2xl bg-amber-400 hover:bg-amber-500 text-burgundy-950 font-black text-xs cursor-pointer transition-colors shadow-sm flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Track in My Orders</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlacedOrder(null)}
                  className="py-3 px-3 rounded-2xl bg-burgundy-900 hover:bg-burgundy-950 text-white font-bold text-xs cursor-pointer transition-colors shadow-md active:scale-95"
                >
                  Order More Snacks
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty Tray View */
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-burgundy-50 text-burgundy-900 flex items-center justify-center mx-auto border border-burgundy-100">
                <ShoppingBag className="w-8 h-8 text-burgundy-800" />
              </div>
              <h4 className="font-bold text-slate-800 text-base">Your tray is empty!</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore our digital canteen menu, choose some crispy snacks or chilled beverages, and add them here.
              </p>
            </div>
          ) : (
            /* Cart Items List */
            <div className="space-y-3">
              {cartItems.map(({ food, quantity }) => (
                <div
                  key={food.id}
                  className="p-3 bg-white rounded-2xl border border-burgundy-100 shadow-2xs flex items-center justify-between gap-3"
                >
                  <img
                    src={food.imageUrl}
                    alt={food.name}
                    onError={(e) => handleImageError(e, food.category, food.dietary)}
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-100"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 truncate">
                      <DietaryBadge dietary={food.dietary} isVeg={food.isVeg} size="sm" />
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {food.name}
                      </p>
                    </div>
                    <p className="text-xs font-extrabold text-burgundy-900 font-['Outfit'] mt-0.5">
                      ₹{food.price * quantity}
                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                        (₹{food.price} each)
                      </span>
                    </p>
                  </div>

                  {/* Quantity adjustment */}
                  <div className="flex items-center gap-1.5 bg-burgundy-50 border border-burgundy-100 p-1 rounded-xl">
                    <button
                      id={`drawer-minus-${food.id}`}
                      onClick={() => onUpdateQty(food.id, -1)}
                      className="w-6 h-6 rounded-lg bg-white shadow-2xs hover:bg-burgundy-100 flex items-center justify-center text-burgundy-950 cursor-pointer transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-black px-1.5 text-burgundy-950">{quantity}</span>
                    <button
                      id={`drawer-plus-${food.id}`}
                      onClick={() => onUpdateQty(food.id, 1)}
                      className="w-6 h-6 rounded-lg bg-white shadow-2xs hover:bg-burgundy-100 flex items-center justify-center text-burgundy-950 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer with Checkout */}
        {!placedOrder && cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-burgundy-100 bg-[#FAF7F8] space-y-3 shrink-0">
            {/* Student Name & Kitchen Notes input for Chef identification */}
            <div className="bg-white p-3 rounded-2xl border border-burgundy-200/80 space-y-2 shadow-2xs">
              <div>
                <label className="text-[11px] font-extrabold text-slate-700 block mb-1 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-burgundy-800" />
                  Student Name (Sent to Chef)
                </label>
                <input
                  id="student-name-input"
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g., Sai Priya (2nd Year CS)"
                  className="w-full px-3 py-1.5 text-xs bg-[#FAF7F8] border border-burgundy-200 rounded-xl focus:outline-none focus:border-burgundy-800 font-bold text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1 flex items-center gap-1">
                  <span>Custom Kitchen Note (Optional)</span>
                </label>
                <input
                  id="student-notes-input"
                  type="text"
                  value={studentNotes}
                  onChange={(e) => setStudentNotes(e.target.value)}
                  placeholder="e.g. Extra chutney, less spicy..."
                  className="w-full px-3 py-1.5 text-xs bg-[#FAF7F8] border border-slate-200 rounded-xl focus:outline-none focus:border-burgundy-800 text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.reduce((acc, c) => acc + c.quantity, 0)} items)</span>
                <span className="font-bold text-slate-800">₹{totalAmount}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Campus Pickup Service Fee</span>
                <span className="font-bold">FREE (₹0)</span>
              </div>
              <div className="flex justify-between text-base font-black text-burgundy-950 border-t border-burgundy-200/60 pt-2 font-['Outfit']">
                <span>Total Due at Counter</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            <button
              id="confirm-token-order-btn"
              onClick={handlePlaceOrder}
              disabled={isOrdering}
              className="w-full py-3.5 rounded-2xl bg-burgundy-900 hover:bg-burgundy-950 disabled:opacity-50 text-white font-black text-sm font-['Outfit'] flex items-center justify-center gap-2 shadow-lg shadow-burgundy-950/25 active:scale-98 transition-all cursor-pointer border border-burgundy-800"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isOrdering ? 'Notifying Kitchen...' : `Place Canteen Order • ₹${totalAmount}`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
