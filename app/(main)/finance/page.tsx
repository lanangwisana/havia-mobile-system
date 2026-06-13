"use client";

import React, { useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { FinanceContent } from '@/components/content/FinanceContent';
import { useFinance } from '@/hooks/useFinance';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { canSeeProjectSummary } from '@/lib/permissions';

export default function FinancePage() {
  const { apiToken, userData } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get('tab') as 'overview' | 'salary' | null;
  
  const {
    expenses, isLoadingExpenses, loadExpenses,
    financeSummary, financeTotals, isLoadingFinanceSummary, loadFinanceSummary
  } = useFinance({ apiToken, userData });

  useEffect(() => {
    if (apiToken) {
      loadExpenses(1);
      if (canSeeProjectSummary(userData)) {
        loadFinanceSummary(1, "");
      }
    }
  }, [apiToken, userData]);

  return (
    <PageWrapper title="Finance" backRoute="/dashboard">
      <FinanceContent 
        expenses={expenses}
        isLoadingExpenses={isLoadingExpenses}
        financeSummary={financeSummary}
        financeTotals={financeTotals}
        isLoadingFinanceSummary={isLoadingFinanceSummary}
        userData={userData}
        onViewAll={() => router.push('/finance/summary')}
        onHistory={() => router.push('/finance/history')}
        defaultTab={defaultTab}
      />
    </PageWrapper>
  );
}
