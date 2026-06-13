"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { colors } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface PageWrapperProps {
  title: string;
  children: React.ReactNode;
  onBack?: () => void;
  backRoute?: string;
}

export const PageWrapper: React.FC<PageWrapperProps> = ({ title, children, onBack, backRoute }) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backRoute) {
      router.push(backRoute);
    } else {
      router.back();
    }
  };

  return (
    <section className="h-full w-full flex flex-col relative z-40 animate-in slide-in-from-right-4 duration-300 bg-white overflow-hidden">
      <div style={{ backgroundColor: `${colors.primary}FA` }} className="px-6 py-6 flex items-center justify-between border-b border-neutral-100 backdrop-blur-md sticky top-0 z-[70]">
        <button 
          onClick={handleBack}
          style={{ backgroundColor: colors.card, borderColor: colors.border }} 
          className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-900" />
        </button>
        <h2 style={{ color: colors.gold }} className="font-bold text-xs sm:text-sm uppercase tracking-widest text-center flex-1 px-4 line-clamp-2">
          {title}
        </h2>
        <div className="w-10 h-10"></div>
      </div>
      
      <div className="flex-1 px-6 pt-6 pb-40 overflow-y-auto scrollbar-hide relative z-10">
        {children}
      </div>
    </section>
  );
};
