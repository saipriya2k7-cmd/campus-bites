import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { auth } from '../firebase';
import { 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut as fbSignOut 
} from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  isStaff: boolean;
  loginAsStudent: (name: string, studentId?: string, email?: string) => void;
  loginAsStaff: (passcode: string) => boolean;
  logout: () => void;
  quickDemoStudent: () => void;
  quickDemoStaff: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LS_USER = 'campus_bites_user_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(LS_USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default to friendly logged in student so user immediately enjoys the website
    return {
      uid: 'std-2026',
      email: 'student@campus.edu',
      displayName: 'Priya Sharma',
      role: 'student',
      studentId: 'CS-2026-084',
      favoriteIds: ['food-cold-coffee', 'food-dosa']
    };
  });

  useEffect(() => {
    // Attempt anonymous or existing auth state from Firebase
    try {
      const unsub = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser && !user) {
          const profile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || 'student@campus.edu',
            displayName: fbUser.displayName || 'Campus Student',
            role: 'student'
          };
          setUser(profile);
          localStorage.setItem(LS_USER, JSON.stringify(profile));
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn('Firebase auth listener skipped:', e);
    }
  }, []);

  const loginAsStudent = (name: string, studentId?: string, email?: string) => {
    const profile: UserProfile = {
      uid: 'std-' + Date.now(),
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@campus.edu`,
      displayName: name || 'Student',
      role: 'student',
      studentId: studentId || 'CS-' + Math.floor(1000 + Math.random() * 9000),
      favoriteIds: []
    };
    setUser(profile);
    localStorage.setItem(LS_USER, JSON.stringify(profile));
    // Also try firebase anonymous sign in
    signInAnonymously(auth).catch(() => {});
  };

  const loginAsStaff = (passcode: string): boolean => {
    // Staff passcode check (default: 1234 or staff2026)
    if (passcode === '1234' || passcode === 'staff2026' || passcode.toLowerCase() === 'admin') {
      const staffProfile: UserProfile = {
        uid: 'staff-chief',
        email: 'headchef@campusbites.edu',
        displayName: 'Chef Rakesh (Canteen In-charge)',
        role: 'staff'
      };
      setUser(staffProfile);
      localStorage.setItem(LS_USER, JSON.stringify(staffProfile));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LS_USER);
    try {
      fbSignOut(auth).catch(() => {});
    } catch (e) {}
  };

  const quickDemoStudent = () => {
    loginAsStudent('Priya Sharma', 'CS-2026-084', 'priya@campus.edu');
  };

  const quickDemoStaff = () => {
    loginAsStaff('1234');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isStaff: user?.role === 'staff',
        loginAsStudent,
        loginAsStaff,
        logout,
        quickDemoStudent,
        quickDemoStaff
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
