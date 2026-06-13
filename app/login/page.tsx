"use client";

import React from 'react';
import { useAuth } from '@/app/providers/AuthProvider';
import { LoginView } from '@/components/views/LoginView';
import { colors } from '@/lib/utils';

export default function LoginPage() {
  const { 
    loginEmail, setLoginEmail, 
    loginPassword, setLoginPassword, 
    handleLogin, isLoading, isCheckingAuth 
  } = useAuth();

  return (
    <div style={{ backgroundColor: colors.primary, fontFamily: 'var(--font-sans)' }} 
      className="text-dark h-screen w-full overflow-hidden relative selection:bg-gold selection:text-black">
      <LoginView 
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        handleLogin={handleLogin}
        isLoading={isLoading}
        isCheckingAuth={isCheckingAuth}
      />
    </div>
  );
}
