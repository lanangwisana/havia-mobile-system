import { useState } from 'react';
import { fetchFromApi } from '@/app/actions';
import { canSeeProjectSummary } from '@/lib/permissions';

interface UseFinanceProps {
  apiToken: string;
  userData: any;
}

export function useFinance({ apiToken, userData }: UseFinanceProps) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoadingExpenses, setIsLoadingExpenses] = useState(false);
  const [financeSummary, setFinanceSummary] = useState<any[]>([]);
  const [isLoadingFinanceSummary, setIsLoadingFinanceSummary] = useState(false);
  const [financeSummaryMeta, setFinanceSummaryMeta] = useState<any>(null);
  const [currentFinanceSummaryPage, setCurrentFinanceSummaryPage] = useState(1);
  const [currentFinanceSearch, setCurrentFinanceSearch] = useState('');
  const [financeSummaryTotal, setFinanceSummaryTotal] = useState(0);
  const [financeTotals, setFinanceTotals] = useState<any>(null);
  const [expensesMeta, setExpensesMeta] = useState<any>(null);
  const [currentExpensesPage, setCurrentExpensesPage] = useState(1);
  const [expensesTotal, setExpensesTotal] = useState(0);

  const loadExpenses = async (page: number = 1) => {
    if (!apiToken) return;
    setCurrentExpensesPage(page);

    const cacheKey = `havia_finance_expenses_${page}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    let isUsingCache = false;

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setExpenses(parsed.data);
        if (parsed.meta) {
          setExpensesMeta(parsed.meta);
          setExpensesTotal(parsed.meta.total_items || 0);
        } else {
          setExpensesTotal(parsed.data?.length || 0);
        }
        isUsingCache = true;
      } catch (e) {}
    }

    if (!isUsingCache) {
      setIsLoadingExpenses(true);
    }

    // Fetch specifically salaries for the logged-in user
    const res = await fetchFromApi(`haviacms/finance/salaries?page=${page}`, apiToken);
    if (res.success) {
      const expenseData = Array.isArray(res.data) ? res.data : [];
      setExpenses(expenseData);
      if (res.meta) {
        setExpensesMeta(res.meta);
        setExpensesTotal(res.meta.total_items || 0);
      } else {
        setExpensesTotal(expenseData.length);
      }
      sessionStorage.setItem(cacheKey, JSON.stringify({ data: expenseData, meta: res.meta }));
    }
    setIsLoadingExpenses(false);
  };

  const loadFinanceSummary = async (page: number = 1, search: string = currentFinanceSearch) => {
    if (!apiToken || !canSeeProjectSummary(userData)) return;
    setCurrentFinanceSummaryPage(page);
    setCurrentFinanceSearch(search);
    
    // Gunakan ID user pada cache key untuk mencegah kebocoran data (cache poisoning) antar user
    const cacheKey = `havia_finance_summary_user_${userData?.id}_${page}_${search}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    let isUsingCache = false;

    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setFinanceSummary(parsed.data);
        if (parsed.totals) setFinanceTotals(parsed.totals);
        if (parsed.meta) {
          setFinanceSummaryMeta(parsed.meta);
          setFinanceSummaryTotal(parsed.meta.total_items || 0);
        } else {
          setFinanceSummaryTotal(parsed.data?.length || 0);
        }
        isUsingCache = true;
      } catch (e) {}
    }

    if (!isUsingCache) {
      setIsLoadingFinanceSummary(true);
    }
    
    let endpoint = `haviacms/finance/summary?page=${page}`;
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }
    const res = await fetchFromApi(endpoint, apiToken);
    if (res.success) {
      const summaryData = Array.isArray(res.data) ? res.data : [];
      setFinanceSummary(summaryData);
      if (res.totals) {
        setFinanceTotals(res.totals);
      }
      if (res.meta) {
        setFinanceSummaryMeta(res.meta);
        setFinanceSummaryTotal(res.meta.total_items || 0);
      } else {
        setFinanceSummaryTotal(summaryData.length);
      }
      sessionStorage.setItem(cacheKey, JSON.stringify({ data: summaryData, totals: res.totals, meta: res.meta }));
    }
    setIsLoadingFinanceSummary(false);
  };

  return {
    expenses, setExpenses,
    isLoadingExpenses,
    financeSummary, setFinanceSummary,
    isLoadingFinanceSummary,
    financeSummaryMeta,
    currentFinanceSummaryPage, setCurrentFinanceSummaryPage,
    currentFinanceSearch, setCurrentFinanceSearch,
    financeSummaryTotal,
    financeTotals,
    expensesMeta,
    currentExpensesPage, setCurrentExpensesPage,
    expensesTotal,
    loadExpenses,
    loadFinanceSummary
  };
}
