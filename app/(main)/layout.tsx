"use client";

import React, { useEffect, useState } from 'react';
import { BottomNav } from '@/components/ui/BottomNav';
import { useAuth } from '@/app/providers/AuthProvider';
import { colors } from '@/lib/utils';
import { usePathname } from 'next/navigation';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isCheckingAuth } = useAuth();
  const pathname = usePathname();

  // Paths that should show the BottomNav
  const showNavPaths = ['/dashboard', '/account', '/attendance'];
  const shouldShowNav = showNavPaths.includes(pathname) || pathname.startsWith('/finance') || pathname.startsWith('/projects');

  if (isCheckingAuth) {
    return (
      <div style={{ backgroundColor: colors.primary }} className="h-screen w-full flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.primary, fontFamily: 'var(--font-sans)' }} 
      className="text-dark h-screen w-full overflow-hidden relative selection:bg-gold selection:text-black">
      {children}
      {shouldShowNav && <BottomNav />}
    </div>
  );
}
