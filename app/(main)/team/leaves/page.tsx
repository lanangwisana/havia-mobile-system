"use client";

import React, { useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { RiwayatPengajuanContent } from '@/components/content/RiwayatPengajuanContent';
import { useLeaves } from '@/hooks/useLeaves';
import { useAuth } from '@/app/providers/AuthProvider';

export default function TeamLeavesPage() {
  const { apiToken, showToast } = useAuth();
  
  const { leaves, isLoadingLeaves, loadLeaves } = useLeaves({ apiToken, showToast });

  useEffect(() => {
    if (apiToken) {
      loadLeaves();
    }
  }, [apiToken]);

  return (
    <PageWrapper title="Submission History" backRoute="/team">
      <RiwayatPengajuanContent 
        leaves={leaves}
        isLoading={isLoadingLeaves}
      />
    </PageWrapper>
  );
}
