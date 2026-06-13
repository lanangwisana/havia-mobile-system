"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers/AuthProvider';

export default function RootRedirect() {
  const router = useRouter();
  const { userData, isCheckingAuth } = useAuth();

  useEffect(() => {
    if (!isCheckingAuth) {
      if (userData) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [userData, isCheckingAuth, router]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#1A1918]">
      <div className="w-10 h-10 border-4 border-[#C69C3D] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
