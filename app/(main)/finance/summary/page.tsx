"use client";

import React, { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { FinanceFullSummary } from '@/components/content/FinanceFullSummary';
import { useFinance } from '@/hooks/useFinance';
import { useAuth } from '@/app/providers/AuthProvider';

export default function FinanceSummaryPage() {
  const { apiToken, userData } = useAuth();
  
  const {
    financeSummary, financeTotals, isLoadingFinanceSummary, loadFinanceSummary, financeSummaryMeta
  } = useFinance({ apiToken, userData });

  const [currentSearch, setCurrentSearch] = useState("");

  useEffect(() => {
    if (apiToken) {
      loadFinanceSummary(1, "");
    }
  }, [apiToken]);

  const handleSearch = (search: string) => {
    setCurrentSearch(search);
    loadFinanceSummary(1, search);
  };

  return (
    <PageWrapper title="Project Summary History" backRoute="/finance">
      <FinanceFullSummary 
        data={financeSummary}
        isLoading={isLoadingFinanceSummary}
        paginationMeta={financeSummaryMeta}
        financeTotals={financeTotals}
        onPageChange={(p) => loadFinanceSummary(p, currentSearch)}
        onBack={() => {}} // Not used because we use backRoute
        currentFinanceSearch={currentSearch}
        onFinanceSearch={handleSearch}
      />
    </PageWrapper>
  );
}
