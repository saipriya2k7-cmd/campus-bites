import React, { useState, useEffect } from 'react';
import { X, User, ChefHat, Lock, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'student' | 'staff';
  onStaffLoginSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'student',
  onStaffLoginSuccess
}) => {
  const { user, loginAsStudent, loginAsStaff, logout } = useAuth();
  const [role, setRole] = useState<'student' | 'staff'>(defaultRole);

  // Student form state
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentEmail, setStudentEmail] = useState('');

  // Staff form state
  const [staffPasscode, setStaffPasscode] = useState('');
  const [staffError, setStaffError] = useState('');

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    loginAsStudent(studentName, studentId, studentEmail);
    onClose();
  };

  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAsStaff(staffPasscode);
    if (success) {
      setStaffError('');
      onStaffLoginSuccess?.();
      onClose();
    } else {
      setStaffError('Incorrect staff passcode. Access restricted to authorized personnel.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="auth-dialog-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative my-auto max-h-[calc(100vh-2rem)] flex flex-col"
      >
        <button
          id="close-auth-modal-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto pr-1">
          {/* Current user logged in state */}
          {user ? (
            <div className="text-center py-4 space-y-4">
              <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center text-white text-xl font-black ${
                user.role === 'staff' ? 'bg-slate-900 ring-4 ring-blue-100' : 'bg-blue-600 ring-4 ring-blue-100'
              }`}>
                {user.displayName.charAt(0)}
              </div>

              <div>
                <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  user.role === 'staff' ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                  {user.role === 'staff' ? '👨🍳 Staff In-Charge' : '👨🎓 Campus Student'}
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 font-['Outfit'] mt-1.5">
                  {user.displayName}
                </h3>
                <p className="text-xs text-slate-500">{user.email}</p>
                {user.studentId && (
                  <p className="text-xs text-slate-600 font-mono mt-0.5">ID: {user.studentId}</p>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                {user.role === 'staff' && (
                  <button
                    type="button"
                    onClick={() => {
                      onStaffLoginSuccess?.();
                      onClose();
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <ChefHat className="w-4 h-4 text-blue-400" />
                    <span>Open Staff Management Panel</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    logout();
                  }}
                  className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  Log Out of Account
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                >
                  Continue Browsing Menu
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Tab switch Student vs Staff */}
              <div className="flex bg-slate-100 p-1 rounded-2xl mb-5 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    role === 'student'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Student Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('staff')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    role === 'staff'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Staff Portal Login</span>
                </button>
              </div>

              {role === 'student' ? (
                <form onSubmit={handleStudentSubmit} className="space-y-3.5">
                  <div>
                    <h3 className="font-extrabold text-slate-900 font-['Outfit'] text-lg">
                      Student Sign In / Sign Up
                    </h3>
                    <p className="text-xs text-slate-500">
                      Track your orders, leave ratings, and get personalized recommendations
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      College Roll No / Student ID (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 21CS042"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      College Email ID (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. rahul.sharma@college.edu"
                      value={studentEmail}
                      onChange={(e) => setStudentEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-blue-600 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-98"
                  >
                    Enter Student Portal
                  </button>
                </form>
              ) : (
                <form onSubmit={handleStaffSubmit} className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                        <Lock className="w-4 h-4" />
                      </span>
                      <h3 className="font-extrabold text-slate-900 font-['Outfit'] text-lg">
                        Canteen Staff Portal
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Protected area for chefs and managers to update menu, stock, prices, and specials
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                      <span>Staff Security Passcode</span>
                    </div>
                    <input
                      type="password"
                      placeholder="Enter staff security passcode"
                      value={staffPasscode}
                      onChange={(e) => {
                        setStaffPasscode(e.target.value);
                        if (staffError) setStaffError('');
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm tracking-widest font-mono focus:outline-blue-600 bg-white"
                      autoComplete="current-password"
                    />
                    {staffError && (
                      <p className="text-xs text-rose-600 font-medium mt-1.5">{staffError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md shadow-slate-900/20 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2"
                  >
                    <ChefHat className="w-4 h-4 text-blue-400" />
                    <span>Verify Passcode & Open Staff Panel</span>
                  </button>

                  <p className="text-[11px] text-slate-400 text-center">
                    Authorized canteen management personnel only.
                  </p>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
