"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { loginWithToken, verifyUserStatus } from '@/app/actions';

interface AuthContextType {
  apiToken: string;
  setApiToken: (val: string) => void;
  userData: any;
  setUserData: (val: any) => void;
  isCheckingAuth: boolean;
  handleLogout: () => void;
  toastMsg: string;
  showToast: (msg: string) => void;
  loginEmail: string;
  setLoginEmail: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  isLoading: boolean;
  handleLogin: (e: React.FormEvent) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [apiToken, setApiToken] = useState('');
  const [userData, setUserData] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleLogout = () => {
    localStorage.removeItem('havia_user');
    localStorage.removeItem('havia_token');
    sessionStorage.clear();
    setUserData(null);
    setApiToken('');
    router.push('/login');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Email and Password are required.');
      return;
    }
    setIsLoading(true);
    try {
      const { loginWithEmailPassword } = await import('@/app/actions');
      const res = await loginWithEmailPassword(loginEmail, loginPassword);
      if (res.success && res.data) {
        setUserData(res.data);
        setApiToken(res.token || '');
        localStorage.setItem('havia_user', JSON.stringify(res.data));
        localStorage.setItem('havia_token', res.token || '');
        showToast('Welcome!');
        router.push('/dashboard');
      } else {
        showToast(res.error || 'Login Failed. Please check your credentials.');
      }
    } catch (error: any) {
      showToast(error.message || 'Connection error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const savedUserStr = localStorage.getItem('havia_user');
        const savedToken = localStorage.getItem('havia_token');
        
        if (savedUserStr && savedToken && savedUserStr !== 'null' && savedToken !== 'null') {
          try {
            const savedUser = JSON.parse(savedUserStr);
            setUserData(savedUser);
            setApiToken(savedToken);
            
            // Allow them to be wherever they are, but if they are at root or login, push to dashboard
            if (pathname === '/' || pathname === '/login') {
              router.push('/dashboard');
            }
            
            // Background sync
            loginWithToken(savedToken).then(result => {
              if (result.success && result.data) {
                const users = result.data;
                let latestUser = null;
                if (Array.isArray(users)) {
                  latestUser = users.find((u: any) => u.email === savedUser.email);
                } else if (users && typeof users === 'object') {
                  const u = users as any;
                  if (u.email === savedUser.email) latestUser = u;
                }
                
                if (latestUser) {
                  setUserData(latestUser);
                  localStorage.setItem('havia_user', JSON.stringify(latestUser));
                }

                verifyUserStatus(savedToken).then(statusCheck => {
                  if (!statusCheck.success && statusCheck.status === 'blocked') {
                    showToast(statusCheck.message || 'Account disabled');
                    handleLogout();
                  } else if (statusCheck.success && (statusCheck as any).user) {
                    const serverUser = (statusCheck as any).user;
                    setUserData((prev: any) => {
                      const updated = { ...prev, ...serverUser };
                      localStorage.setItem('havia_user', JSON.stringify(updated));
                      return updated;
                    });
                  }
                });
              } else {
                handleLogout();
              }
            }).catch(e => console.warn("Sync error", e));

          } catch (e) {
            handleLogout();
          }
        } else {
          if (pathname !== '/login') {
            router.push('/login');
          }
        }
      } catch (e) {
        console.error("Auth check failed", e);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkAuth();
  }, [pathname]); // Check auth when route changes

  return (
    <AuthContext.Provider value={{
      apiToken, setApiToken,
      userData, setUserData,
      isCheckingAuth,
      handleLogout,
      toastMsg, showToast,
      loginEmail, setLoginEmail,
      loginPassword, setLoginPassword,
      isLoading, handleLogin
    }}>
      {children}
      {/* Toast placed globally inside AuthProvider */}
      <div className="fixed top-0 left-0 z-[100] pointer-events-none w-full flex justify-center">
        {toastMsg && (
          <div className="mt-4 px-4 py-2 bg-neutral-900 text-gold rounded shadow-lg transition-opacity">
            {toastMsg}
          </div>
        )}
      </div>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
