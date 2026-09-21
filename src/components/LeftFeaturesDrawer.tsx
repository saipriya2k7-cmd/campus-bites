import React, { useEffect } from 'react';
import { 
  X, 
  Clock, 
  IndianRupee, 
  Bot, 
  Flame, 
  ChefHat, 
  Sparkles, 
  UtensilsCrossed, 
  ChevronRight, 
  User, 
  LogOut,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { CanteenInfo } from '../types';
import { useAuth } from '../context/AuthContext';

interface LeftFeaturesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  canteenInfo: CanteenInfo;
  onOpenTimings: () => void;
  onOpenBudget: () => void;
  onOpenChatbot: () => void;
  onOpenAuth: () => void;
  onSwitchToStaff: () => void;
  onSelectCravingShortcut?: () => void;
  onOpenMyOrders?: () => void;
  activeOrdersCount?: number;
}

export const LeftFeaturesDrawer: React.FC<LeftFeaturesDrawerProps> = ({
  isOpen,
  onClose,
  canteenInfo,
  onOpenTimings,
  onOpenBudget,
  onOpenChatbot,
  onOpenAuth,
  onSwitchToStaff,
  onSelectCravingShortcut,
  onOpenMyOrders,
  activeOrdersCount = 0
}) => {
  const { user, isStaff, logout } = useAuth();

  // Escape key handler
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

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        id="left-features-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
      />

      {/* Slide-out Drawer from Left */}
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div 
          id="left-features-drawer"
          className="w-84 sm:w-96 bg-white shadow-2xl border-r border-slate-200 flex flex-col relative z-10 animate-in slide-in-from-left duration-300"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-700/20">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                  Campus<span className="text-blue-600">Bites</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Quick Features & Services
                </p>
              </div>
            </div>

            <button
              id="close-left-drawer-btn"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Status Bar */}
          <div className="p-4 bg-blue-50/60 border-b border-blue-100 flex items-center justify-between">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  {user.displayName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{user.displayName}</p>
                  <p className="text-[10px] text-blue-800 font-semibold">
                    {user.role === 'staff' ? '👨🍳 Canteen Staff' : `${user.studentId || 'Student'} • Active`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Visiting Student</p>
                  <p className="text-[10px] text-slate-500">Log in for student ID & tokens</p>
                </div>
              </div>
            )}

            {user ? (
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer p-1.5 rounded-lg hover:bg-white transition-colors"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="text-xs font-extrabold text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-2xs hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Drawer Feature Links */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
              Campus Dining Utilities
            </p>

            {/* Feature 0: My Orders & Active Tokens */}
            {onOpenMyOrders && (
              <button
                id="drawer-my-orders-btn"
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMyOrders();
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer shadow-2xs group flex items-center justify-between ${
                  activeOrdersCount > 0
                    ? 'bg-amber-50/70 hover:bg-amber-100/70 border-amber-300'
                    : 'bg-white hover:bg-burgundy-50/50 border-slate-200 hover:border-burgundy-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shrink-0 ${
                    activeOrdersCount > 0
                      ? 'bg-amber-400 text-burgundy-950 font-black'
                      : 'bg-burgundy-100 text-burgundy-900'
                  }`}>
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">My Orders & Tokens</span>
                      {activeOrdersCount > 0 ? (
                        <span className="text-[10px] bg-amber-400 text-burgundy-950 font-black px-1.5 py-0.2 rounded-md">
                          {activeOrdersCount} Active
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.2 rounded-md">
                          History
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Track live tokens, kitchen prep & pickup status
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-burgundy-700 transition-colors shrink-0" />
              </button>
            )}

            {/* Feature 1: Canteen Timings & Live Rush */}
            <button
              id="drawer-timings-btn"
              type="button"
              onClick={() => {
                onClose();
                onOpenTimings();
              }}
              className="w-full text-left p-3.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Timings & Live Rush</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Live meal slot & queue wait status
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
            </button>

            {/* Feature 2: Under ₹X Budget Finder */}
            <button
              id="drawer-budget-btn"
              type="button"
              onClick={() => {
                onClose();
                onOpenBudget();
              }}
              className="w-full text-left p-3.5 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Under ₹X Budget Finder</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">
                      Pocket Friendly
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Explore meals & combos for ₹30, ₹50, ₹100
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
            </button>

            {/* Feature 3: Ask BiteBot AI */}
            <button
              id="drawer-chatbot-btn"
              type="button"
              onClick={() => {
                onClose();
                onOpenChatbot();
              }}
              className="w-full text-left p-3.5 rounded-2xl bg-white hover:bg-teal-50/50 border border-slate-200 hover:border-teal-300 transition-all cursor-pointer shadow-2xs group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900">Ask BiteBot AI</span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded-md">
                      Smart Assistant
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Instant calorie, craving & meal answers
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-colors shrink-0" />
            </button>

            {/* Feature 4: Staff Portal Access */}
            <div className="pt-2">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-1 mb-2">
                Administration & Kitchen
              </p>

              {isStaff ? (
                <button
                  id="drawer-staff-portal-btn"
                  type="button"
                  onClick={() => {
                    onClose();
                    onSwitchToStaff();
                  }}
                  className="w-full text-left p-3.5 rounded-2xl bg-emerald-800 text-white hover:bg-emerald-900 transition-all cursor-pointer shadow-md group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                      <ChefHat className="w-5 h-5 text-emerald-200" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-white">Staff Management Panel</p>
                      <p className="text-[11px] text-emerald-200 mt-0.5">
                        Stock toggle, add dishes & live rush
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-300 shrink-0" />
                </button>
              ) : (
                <button
                  id="drawer-staff-login-btn"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="w-full text-left p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer shadow-2xs group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">Canteen Staff Access</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Authorized kitchen staff passcode login
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </button>
              )}
            </div>
          </div>

          {/* Drawer Footer Notice */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center">
            <p className="text-[11px] text-slate-500 font-medium">
              Campus Cafeteria • Block B Ground Floor
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Live updates synced directly with kitchen counter
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
