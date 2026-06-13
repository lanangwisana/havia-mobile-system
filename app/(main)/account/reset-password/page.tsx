"use client";

import React from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { ResetPasswordContent } from '@/components/content/ResetPasswordContent';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const { apiToken, showToast } = useAuth();
  const router = useRouter();

  return (
    <PageWrapper title="Reset Password" backRoute="/account">
      <ResetPasswordContent 
        apiToken={apiToken}
        showToast={showToast}
        onSuccess={() => {
          showToast('Password successfully changed.');
          router.push('/account');
        }}
      />
    </PageWrapper>
  );
}
