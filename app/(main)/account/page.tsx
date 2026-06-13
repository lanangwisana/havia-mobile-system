"use client";

import React from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { AkunContent } from '@/components/content/AkunContent';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { userData, handleLogout, showToast } = useAuth();
  const router = useRouter();

  return (
    <PageWrapper title="Account" backRoute="/dashboard">
      <AkunContent 
        userData={userData}
        onEditProfile={() => router.push('/account/edit')}
        onLogout={handleLogout}
        showToast={showToast}
      />
    </PageWrapper>
  );
}
