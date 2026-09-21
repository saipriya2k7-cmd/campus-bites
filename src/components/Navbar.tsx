import React, { useState, useRef, useEffect } from 'react';
import { 
  UtensilsCrossed, 
  ShoppingBag, 
  User, 
  ChefHat, 
  Clock, 
  Sparkles, 
  LogOut, 
  IndianRupee, 
  Menu, 
  Bot, 
  ChevronDown, 
  ShieldCheck,
  Bell,
  Receipt
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CanteenInfo } from '../types';

interface NavbarProps {
  canteenInfo: CanteenInfo;
  activeTab: 'student' | 'staff';
  setActiveTab: (tab: 'student' | 'staff') => void;
  cartCount: number;
  pendingOrdersCount?: number;
  activeStudentOrdersCount?: number;
  onOpenKitchenOrders?: () => void;
  onOpenLatestChefNotification?: () => void;
  onOpenMyOrders?: () => void;
  onOpenCart: () => void;
  onOpenTimings: () => void;
  onOpenBudget: () => void;
  onOpenAuth: () => void;
  onOpenChatbot: () => void;
  onOpenLeftMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  canteenInfo,
  activeTab,
  setActiveTab,
  cartCount,
  pendingOrdersCount = 0,
  activeStudentOrdersCount = 0,
  onOpenKitchenOrders,
  onOpenLatestChefNotification,
  onOpenMyOrders,
  onOpenCart,
  onOpenTimings,
  onOpenBudget,
  onOpenAuth,
  onOpenChatbot,
  onOpenLeftMenu
}) => {
  const { user, isStaff, logout } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-burgundy-100/90 shadow-2xs">
      {/* Top micro announcement bar */}
      <div className="bg-linear-to-r from-burgundy-950 via-burgundy-900 to-burgundy-850 text-burgundy-100 text-xs py-1.5 px-4 font-medium border-b border-burgundy-950">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
            </span>
            <span className="truncate">{canteenInfo?.notice || "Welcome to Campus Canteen! Fresh meals prepared hourly."}</span>
          </div>
          <button 
            id="nav-timings-badge-btn"
            type="button"
            onClick={onOpenTimings}
            className="shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded-full text-xs font-semibold cursor-pointer transition-colors text-white border border-white/10"
          >
            <Clock className="w-3.5 h-3.5 text-amber-200" />
            <span>Timings & Rush</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3">
        {/* Left Side: Features Menu Button + Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Menu & Features Drawer Trigger */}
          <button
            id="open-left-features-btn"
            type="button"
            onClick={onOpenLeftMenu}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#FAF7F8] hover:bg-burgundy-50 text-slate-700 hover:text-burgundy-900 border border-burgundy-200/80 transition-all cursor-pointer font-bold text-xs shadow-2xs active:scale-95 group"
            title="Open Campus Features & Services"
            aria-label="Open Left Features Menu"
          >
            <Menu className="w-4 h-4 text-burgundy-800 group-hover:scale-110 transition-transform" />
            <span className="font-['Outfit'] hidden sm:inline">Features</span>
          </button>

          {/* Brand Logo & Name */}
          <button 
            id="brand-logo-btn"
            type="button"
            onClick={() => setActiveTab('student')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-burgundy-800 to-burgundy-950 flex items-center justify-center text-white shadow-md shadow-burgundy-950/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl font-['Outfit'] tracking-tight text-slate-900">
                  Campus<span className="text-burgundy-800">Bites</span>
                </span>
                <span className="text-[10px] uppercase font-extrabold bg-burgundy-50 text-burgundy-800 border border-burgundy-200 px-1.5 py-0.5 rounded-md tracking-wider">
                  Canteen
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                Fresh & Budget-friendly student cafeteria
              </p>
            </div>
          </button>
        </div>

        {/* Center: Current view indicator or clean tagline */}
        <div className="hidden lg:flex items-center gap-2">
          {isStaff ? (
            <div className="bg-[#FAF7F8] p-1 rounded-xl flex items-center border border-burgundy-200/80">
              <button
                id="tab-student-view"
                type="button"
                onClick={() => setActiveTab('student')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'student'
                    ? 'bg-white text-slate-900 shadow-2xs border border-burgundy-100'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                👨🎓 Student Menu
              </button>
              <button
                id="tab-staff-view"
                type="button"
                onClick={() => setActiveTab('staff')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'staff'
                    ? 'bg-burgundy-900 text-white shadow-2xs'
                    : 'text-burgundy-800 hover:text-burgundy-950'
                }`}
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Staff Panel</span>
              </button>
            </div>
          ) : (
            <span className="text-xs font-semibold text-slate-600 bg-burgundy-50/70 px-3 py-1 rounded-full border border-burgundy-200/70">
              Block B Ground Floor • Pure Veg, Egg & Non-Veg Kitchens
            </span>
          )}
        </div>

        {/* Right Side: Tray/Cart (Students) or Kitchen Orders (Staff) + Profile Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* In Student View: My Orders button with live active tokens count */}
          {activeTab !== 'staff' && onOpenMyOrders && (
            <button
              id="nav-my-orders-btn"
              type="button"
              onClick={onOpenMyOrders}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer active:scale-95 ${
                activeStudentOrdersCount > 0
                  ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-burgundy-950 shadow-2xs'
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
              title="View My Orders & Tokens"
            >
              <div className="relative">
                <Receipt className={`w-4 h-4 ${activeStudentOrdersCount > 0 ? 'text-amber-700' : 'text-slate-600'}`} />
                {activeStudentOrdersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                )}
              </div>
              <span className="font-['Outfit']">My Orders</span>
              {activeStudentOrdersCount > 0 && (
                <span className="flex h-5 px-1.5 rounded-full bg-burgundy-900 text-amber-300 font-extrabold text-[10px] items-center justify-center shadow-xs">
                  {activeStudentOrdersCount}
                </span>
              )}
            </button>
          )}

          {/* If Canteen Staff is browsing the student menu, show kitchen orders shortcut */}
          {activeTab !== 'staff' && isStaff && (
            <button
              id="nav-kitchen-orders-bell"
              type="button"
              onClick={() => {
                if (onOpenLatestChefNotification) {
                  onOpenLatestChefNotification();
                } else if (onOpenKitchenOrders) {
                  onOpenKitchenOrders();
                } else {
                  setActiveTab('staff');
                }
              }}
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-burgundy-50 hover:bg-burgundy-100 border border-burgundy-200 text-burgundy-900 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="Staff Kitchen Alert"
            >
              <div className="relative">
                <Bell className="w-4 h-4 text-burgundy-900" />
                {pendingOrdersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500 text-burgundy-950 font-black text-[9px] items-center justify-center">
                      {pendingOrdersCount}
                    </span>
                  </span>
                )}
              </div>
              <span className="hidden md:inline font-['Outfit']">
                {pendingOrdersCount > 0 ? `${pendingOrdersCount} Orders` : 'Kitchen'}
              </span>
            </button>
          )}

          {/* In Student View: Cart / Tray button (Hidden completely in Chef's Panel) */}
          {activeTab !== 'staff' && (
            <button
              id="cart-drawer-trigger-btn"
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-burgundy-900 hover:bg-burgundy-950 text-white font-bold text-xs sm:text-sm shadow-md shadow-burgundy-950/20 transition-all cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">My Tray</span>
              {cartCount > 0 && (
                <span className="flex h-5 w-5 rounded-full bg-white text-burgundy-900 font-extrabold text-[11px] items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* In Chef's Panel: Dedicated Kitchen Orders & Incoming Alert Button (Replacing My Tray) */}
          {activeTab === 'staff' && (
            <button
              id="nav-chef-live-orders-btn"
              type="button"
              onClick={() => {
                if (onOpenLatestChefNotification) {
                  onOpenLatestChefNotification();
                } else if (onOpenKitchenOrders) {
                  onOpenKitchenOrders();
                }
              }}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer active:scale-95 shadow-md ${
                pendingOrdersCount > 0
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-amber-500/25 animate-pulse'
                  : 'bg-burgundy-900 hover:bg-burgundy-950 text-white'
              }`}
              title="Kitchen Incoming Orders & Prep Board"
            >
              <Bell className={`w-4 h-4 ${pendingOrdersCount > 0 ? 'text-slate-950' : 'text-amber-300'}`} />
              <span className="font-['Outfit']">Kitchen Orders</span>
              {pendingOrdersCount > 0 && (
                <span className="flex h-5 min-w-5 px-1.5 rounded-full bg-slate-950 text-amber-300 font-black text-[11px] items-center justify-center shadow-xs">
                  {pendingOrdersCount}
                </span>
              )}
            </button>
          )}

          {/* User Account / Profile with Dropdown below */}
          <div className="relative" ref={profileDropdownRef}>
            <button
              id="user-profile-btn"
              type="button"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-2xl border border-burgundy-200/80 hover:border-burgundy-400 hover:bg-burgundy-50/40 transition-all cursor-pointer text-left shadow-2xs"
              title="Click to view features and account options"
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="true"
            >
              {user ? (
                <div className="w-8 h-8 rounded-full bg-burgundy-900 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                  {user.displayName.charAt(0)}
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#FAF7F8] text-burgundy-800 flex items-center justify-center shrink-0 border border-burgundy-200">
                  <User className="w-4 h-4" />
                </div>
              )}

              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-28">
                  {user ? user.displayName.split(' ')[0] : 'Profile & Menu'}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {user?.role === 'staff' ? '👨🍳 Staff' : (user?.studentId || 'Explore')}
                </p>
              </div>

              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu below the Profile Button */}
            {isProfileMenuOpen && (
              <div 
                id="profile-dropdown-menu"
                className="absolute right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-burgundy-200/90 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
              >
                {/* Account Details Header */}
                <div className="p-3 bg-[#FAF7F8] rounded-2xl border border-burgundy-100 mb-2">
                  {user ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-burgundy-900 text-white font-black text-xs flex items-center justify-center">
                          {user.displayName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{user.displayName}</p>
                          <p className="text-[10px] text-burgundy-800 font-bold">
                            {user.role === 'staff' ? '👨🍳 Canteen Staff' : `${user.studentId || 'Student'} • Active`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-900">Campus Visitor</p>
                        <p className="text-[10px] text-slate-500">Sign in to save your student tray</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          onOpenAuth();
                        }}
                        className="text-xs font-extrabold bg-burgundy-900 text-white px-2.5 py-1 rounded-xl shadow-xs hover:bg-burgundy-950 transition-colors cursor-pointer"
                      >
                        Sign In
                      </button>
                    </div>
                  )}
                </div>

                {/* Feature Quick Actions inside Profile Dropdown */}
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-burgundy-800/80 px-2 py-1">
                    Canteen Utilities
                  </p>

                  <button
                    id="profile-timings-shortcut"
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenTimings();
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-burgundy-50 hover:text-burgundy-900 transition-colors cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-burgundy-800" />
                    <span>Canteen Timings & Rush</span>
                  </button>

                  <button
                    id="profile-budget-shortcut"
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenBudget();
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-burgundy-50 hover:text-burgundy-900 transition-colors cursor-pointer"
                  >
                    <IndianRupee className="w-4 h-4 text-burgundy-800" />
                    <span>Under ₹X Budget Finder</span>
                  </button>

                  <button
                    id="profile-bot-shortcut"
                    type="button"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenChatbot();
                    }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-burgundy-50 hover:text-burgundy-900 transition-colors cursor-pointer"
                  >
                    <Bot className="w-4 h-4 text-burgundy-800" />
                    <span>Ask BiteBot AI</span>
                  </button>

                  {/* Staff Portal Option */}
                  {isStaff ? (
                    <button
                      id="profile-staff-portal-btn"
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        setActiveTab(activeTab === 'student' ? 'staff' : 'student');
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-burgundy-900 bg-burgundy-50 hover:bg-burgundy-100 transition-colors cursor-pointer border border-burgundy-200/60"
                    >
                      <ChefHat className="w-4 h-4 text-burgundy-800" />
                      <span>{activeTab === 'student' ? 'Switch to Staff Panel' : 'Switch to Student Menu'}</span>
                    </button>
                  ) : (
                    <button
                      id="profile-staff-login-btn"
                      type="button"
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenAuth();
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-burgundy-50 hover:text-burgundy-900 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-slate-500" />
                      <span>Staff Login (Kitchen Portal)</span>
                    </button>
                  )}
                </div>

                {/* Logout Button if Logged In */}
                {user && (
                  <div className="mt-2 pt-2 border-t border-slate-100">
                    <button
                      id="profile-logout-btn"
                      type="button"
                      onClick={() => {
                        logout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
