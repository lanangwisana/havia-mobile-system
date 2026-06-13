"use client";

import React, { useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { FinanceSalaryHistory } from '@/components/content/FinanceSalaryHistory';
import { useFinance } from '@/hooks/useFinance';
import { useAuth } from '@/app/providers/AuthProvider';

export default function FinanceHistoryPage() {
  const { apiToken, userData } = useAuth();
  
  const {
    expenses, isLoadingExpenses, loadExpenses, expensesMeta
  } = useFinance({ apiToken, userData });

  useEffect(() => {
    if (apiToken) {
      loadExpenses(1);
    }
  }, [apiToken]);

  return (
    <PageWrapper title="Payment History" backRoute="/finance?tab=salary">
      <FinanceSalaryHistory 
        data={expenses}
        isLoading={isLoadingExpenses}
        paginationMeta={expensesMeta}
        onPageChange={(p) => loadExpenses(p)}
        onBack={() => {}} // Controlled by PageWrapper
      />
    </PageWrapper>
  );
}
