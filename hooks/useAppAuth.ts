import { useState, useEffect } from 'react';
import { loginWithToken, loginWithEmailPassword, verifyUserStatus } from '@/app/actions';

interface UseAppAuthProps {
  showToast: (msg: string) => void;
  onNavReset: (view: string, nav: string) => void;
}

export function useAppAuth({ showToast, onNavReset }: UseAppAuthProps) {
  const [apiToken, setApiToken] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  const handleLogout = () => {
    localStorage.removeItem('havia_user');
    localStorage.removeItem('havia_token');
    setUserData(null);
    setApiToken('');
    onNavReset('login', 'home');
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
            onNavReset('dashboard', 'home');
            
            // Sync with server in background
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

                // Verify status + sync permissions and role info in background
                verifyUserStatus(savedToken).then(statusCheck => {
                  if (!statusCheck.success && statusCheck.status === 'blocked') {
                    showToast(statusCheck.message || 'Account disabled');
                    handleLogout();
                  } else if (statusCheck.success && (statusCheck as any).user) {
                    // Sync latest user info, job title, and permissions from server
                    const serverUser = (statusCheck as any).user;
                    setUserData((prev: any) => {
                      const updated = { ...prev, ...serverUser };
                      localStorage.setItem('havia_user', JSON.stringify(updated));
                      return updated;
                    });
                  }
                });
              } else {
                // If token invalid, logout
                handleLogout();
              }
            }).catch(e => console.warn("Sync error", e));

          } catch (parseError) {
            console.error("Failed to parse user data", parseError);
            localStorage.removeItem('havia_user');
            localStorage.removeItem('havia_token');
          }
        }
      } catch (e) {
        console.error("Auth check failed", e);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Email and Password are required.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await loginWithEmailPassword(loginEmail, loginPassword);
      if (res.success && res.data) {
        setUserData(res.data);
        setApiToken(res.token || '');
        localStorage.setItem('havia_user', JSON.stringify(res.data));
        localStorage.setItem('havia_token', res.token || '');
        onNavReset('dashboard', 'home');
        showToast('Welcome!');
      } else {
        showToast(res.error || 'Login Failed. Please check your credentials.');
      }
    } catch (error: any) {
      showToast(error.message || 'Connection error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const onLogout = () => {
    handleLogout();
    showToast('Logout Success');
  };

  return {
    apiToken, setApiToken,
    loginEmail, setLoginEmail,
    loginPassword, setLoginPassword,
    isLoading,
    isCheckingAuth,
    userData, setUserData,
    handleLogin,
    handleLogout,
    onLogout
  };
}
