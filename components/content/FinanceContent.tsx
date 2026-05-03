import React, { useState } from 'react';
import { TrendingDown, Receipt, DollarSign, Tag, Briefcase, Wallet, PieChart, TrendingUp, Banknote } from 'lucide-react';
import { colors, formatCurrency } from '@/lib/utils';
import { canSeeProjectSummary } from '@/lib/permissions';

interface FinanceContentProps {
  expenses: any[];
  isLoadingExpenses: boolean;
  financeSummary: any[];
  isLoadingFinanceSummary: boolean;
  userData?: any;
  onViewAll?: () => void;
  onHistory?: () => void;
  financeTotals?: any;
}

export const FinanceContent: React.FC<FinanceContentProps> = ({ 
  expenses, 
  isLoadingExpenses,  
  financeSummary, 
  isLoadingFinanceSummary,
  userData,
  onViewAll,
  onHistory,
  financeTotals
}) => {
  const isUserAdmin = Number(userData?.is_admin) === 1;
  
  // RBAC dari Lanang: Super Admin = semua, PM = Project Summary + Salary, sisanya = Salary saja
  const canSeeOverview = canSeeProjectSummary(userData);

  // Initial tab selection: Default ke overview jika punya akses (Admin/PM)
  const [activeTab, setActiveTab] = useState<'overview' | 'salary'>(canSeeOverview ? 'overview' : 'salary');

  // Sync tab selection if permissions change after initial load
  React.useEffect(() => {
    if (canSeeOverview && activeTab === 'salary' && expenses.length === 0) {
      setActiveTab('overview');
    }
  }, [canSeeOverview]);

  // RBAC Filter: Admin & PM see all projects, others don't see project summary at all
  const filteredSummary = canSeeOverview ? financeSummary : [];

  // Stats for the active context
  // Use global totals from API if available, otherwise fallback to local reduction
  const totalProjectsBudget = financeTotals ? (financeTotals.total_budget || 0) : filteredSummary.reduce((sum, p) => sum + (p.project_price || 0), 0);
  const totalBalance = financeTotals ? (financeTotals.total_balance || 0) : filteredSummary.reduce((sum, p) => sum + (p.balance || 0), 0);

  // Detect if user is in a restricted role (HR, Marketing, QA)
  // Admin/PM are not restricted as they can see all.
  const isRestrictedRole = !isUserAdmin && canSeeOverview;

  // Filter salaries specifically (ONLY for non-admin and non-restricted roles)
  const salaryExpenses = isUserAdmin
    ? expenses.filter(exp => {
        const category = (exp.category_title || exp.category_name || exp.category || '').toLowerCase();
        return !category.includes('project expense');
      })
    : expenses; // Staff see all items returned from the server (filtered by user_id in backend)

  const totalSalaryAmount = salaryExpenses.reduce((sum, exp) => {
    const amt = parseFloat(exp.amount || '0');
    const tax = parseFloat(exp.tax_amount || exp.tax || '0');
    const tax2 = parseFloat(exp.second_tax_amount || exp.second_tax || '0');
    return sum + amt + tax + tax2;
  }, 0);

  const renderLargeAmount = (amount: number, justifyAlign: string = "justify-end") => {
    const abs = Math.abs(amount || 0);
    
    // Format Milyar (Sesuai gaya Gambar 1)
    if (abs >= 1000000000) {
      return (
        <span className={`flex items-baseline ${justifyAlign} gap-[2px]`}>
          <span className="tracking-tighter font-bold text-neutral-900">
            {amount < 0 ? '-' : ''}{(abs / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}
          </span>
          <span className="text-[0.5rem] lowercase italic opacity-70 font-medium tracking-normal font-sans ml-0.5">milyar</span>
        </span>
      );
    }

    // Format Jutaan & Ratusan Juta (Identik dengan Gambar 2)
    const formatted = formatCurrency(amount).replace('IDR', 'Rp');

    return (
      <span className="font-bold tracking-tighter leading-none whitespace-nowrap">
        {formatted}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      {/* Tab Switcher - Visible for Admin, PM, HR, and Marketing */}
      {canSeeOverview && (
        <div className="flex p-1 bg-neutral-100 rounded-2xl mx-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'overview' 
                ? 'bg-white text-[#C69C3D] shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            Project Summary
          </button>
          <button 
            onClick={() => setActiveTab('salary')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'salary' 
                ? 'bg-white text-[#C69C3D] shadow-sm' 
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            <Banknote className="w-3.5 h-3.5" />
            {isRestrictedRole || isUserAdmin ? 'Expenses / Payroll' : 'Salary/Payroll'}
          </button>
        </div>
      )}

      {activeTab === 'overview' && canSeeOverview ? (
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl border border-neutral-100 p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-[#C69C3D]/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-[#FAF7EF] flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-[#C69C3D]" />
                </div>
                <span className="text-[0.625rem] text-neutral-400 uppercase tracking-widest font-black">Total Budget</span>
              </div>
              <p className={`font-bold text-neutral-900 font-mono tracking-tighter ${
                totalProjectsBudget >= 1000000000 ? 'text-xl' : 
                totalProjectsBudget >= 100000000 ? 'text-[0.85rem]' :
                totalProjectsBudget >= 10000000 ? 'text-sm' : 'text-base'
              }`}>
                {totalProjectsBudget >= 1000000000 ? (
                  <>
                    {(totalProjectsBudget / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}
                    <span className="text-[0.625rem] lowercase italic ml-1 opacity-70 font-medium">milyar</span>
                  </>
                ) : (
                  formatCurrency(totalProjectsBudget)
                )}
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-100 p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-[#C69C3D]/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-[#C69C3D]/5 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-[#C69C3D]" />
                </div>
                <span className="text-[0.625rem] text-neutral-400 uppercase tracking-widest font-black">Tot. Balance</span>
              </div>
              <p className={`font-bold text-[#C69C3D] font-mono tracking-tighter ${
                totalBalance >= 1000000000 ? 'text-xl' : 
                totalBalance >= 100000000 ? 'text-[0.85rem]' :
                totalBalance >= 10000000 ? 'text-sm' : 'text-base'
              }`}>
                {totalBalance >= 1000000000 ? (
                  <>
                    {(totalBalance / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}
                    <span className="text-[0.625rem] lowercase italic ml-1 opacity-70 font-medium">milyar</span>
                  </>
                ) : (
                  formatCurrency(totalBalance)
                )}
              </p>
            </div>
          </div>

          <div className="px-1 flex items-center justify-between pt-2">
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              Financial Progress Reports
              <span className="px-2 py-0.5 bg-neutral-100 rounded-full text-[0.625rem] text-neutral-500 font-bold">{filteredSummary.length}</span>
            </h3>
            <button 
              onClick={onViewAll}
              style={{ color: '#C69C3D' }} 
              className="text-[0.6875rem] font-black tracking-[0.2em] hover:opacity-70 transition-opacity"
            >
              View All
            </button>
          </div>

          {isLoadingFinanceSummary ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-[#C69C3D] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[0.625rem] text-neutral-400 uppercase tracking-[0.2em] font-bold">Analisis Keuangan...</p>
            </div>
          ) : filteredSummary.length > 0 ? (
            <div className="space-y-4">
              {filteredSummary.map((p) => {
                const ratio = Math.min(100, p.expense_ratio || 0);
                const isOverBudget = ratio >= 90;
                
                return (
                  <div key={p.project_id} className="bg-white rounded-3xl border border-neutral-100 p-5 shadow-sm hover:border-[#C69C3D]/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 pr-4">
                        <h4 className="font-bold text-neutral-900 text-[0.8125rem] leading-tight group-hover:text-[#C69C3D] transition-colors">{p.project_title}</h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[0.5625rem] px-2 py-0.5 bg-neutral-50 border border-neutral-200 rounded text-neutral-500 uppercase font-bold tracking-wider">{p.status_title}</span>
                          <span className="text-[0.5625rem] text-neutral-400 flex items-center gap-1 font-medium italic">
                            {p.progress}% tasks done • {p.expense_count || 0} items
                          </span>
                        </div>
                        {p.expense_titles && (
                          <p className="text-[0.5rem] text-neutral-400 mt-1 leading-tight line-clamp-1 italic">
                            Incl: {p.expense_titles}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[0.625rem] text-neutral-400 uppercase font-black tracking-widest mb-0.5">Budget</p>
                        <div className="text-sm font-bold text-neutral-900 font-mono">{renderLargeAmount(p.project_price)}</div>
                      </div>
                    </div>

                    <div className="space-y-5 pt-1">
                      {/* Progress Comparison Section */}
                      <div className="grid grid-cols-1 gap-4">
                        {/* Financial Progress Bar */}
                        <div>
                          <div className="flex justify-between items-end mb-1.5">
                            <span className="text-[0.5625rem] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                              <TrendingDown className={`w-3 h-3 ${isOverBudget ? 'text-rose-500' : 'text-neutral-400'}`} />
                              Used Budget
                            </span>
                            <span className={`text-[0.6875rem] font-black font-mono ${isOverBudget ? 'text-rose-600' : 'text-[#C69C3D]'}`}>
                              {ratio}%
                            </span>
                          </div>
                          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden flex p-0.5">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ${
                                isOverBudget ? 'bg-gradient-to-r from-rose-500 to-red-600' : 'bg-gradient-to-r from-[#C69C3D] to-[#E5B54F]'
                              }`}
                              style={{ width: `${ratio}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Project Progress Bar */}
                        <div>
                          <div className="flex justify-between items-end mb-1.5">
                            <span className="text-[0.5625rem] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                              <TrendingUp className="w-3 h-3 text-[#C69C3D]" />
                              Project Progress
                            </span>
                            <span className="text-[0.6875rem] font-black font-mono text-[#C69C3D]">
                              {p.progress}%
                            </span>
                          </div>
                          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden flex p-0.5">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-[#C69C3D] to-[#E5B54F] transition-all duration-1000"
                              style={{ width: `${p.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-100">
                          <p className="text-[0.5rem] text-neutral-400 uppercase font-black tracking-widest mb-1">Expenses</p>
                          <div className="text-[0.8125rem] font-bold text-rose-600 font-mono">{renderLargeAmount(p.total_expense, "justify-start")}</div>
                        </div>
                        <div className={`rounded-2xl p-3 border ${p.balance < 0 ? 'bg-rose-50 border-rose-100' : 'bg-[#C69C3D]/5 border-[#C69C3D]/10'}`}>
                          <p className="text-[0.5rem] text-neutral-400 uppercase font-black tracking-widest mb-1">Balance</p>
                          <div className={`text-[0.8125rem] font-bold font-mono ${p.balance < 0 ? 'text-rose-600' : 'text-[#C69C3D]'}`}>{renderLargeAmount(p.balance, "justify-start")}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <ProjectEmptyState />
          )}
        </div>
      ) : (
        <SalarySection 
          salaryExpenses={salaryExpenses} 
          totalSalaryAmount={totalSalaryAmount} 
          isLoadingExpenses={isLoadingExpenses} 
          onHistory={onHistory}
          title={isRestrictedRole || isUserAdmin ? 'Total Expenses' : 'Total Salary Paid'}
          label={isRestrictedRole || isUserAdmin ? 'Cumulative Expenditure' : 'Cumulative Disbursement'}
        />
      )}
    </div>
  );
};

const SalarySection = ({ salaryExpenses, totalSalaryAmount, isLoadingExpenses, onHistory, title, label }: any) => {
  return (
    <div className="space-y-5">
      <div className="px-1">
        <div className="relative overflow-hidden rounded-3xl border border-neutral-100 p-6 shadow-sm group" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FAF7EF 100%)' }}>
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#C69C3D]/5 blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FAF7EF] flex items-center justify-center border border-[#C69C3D]/10">
                <Banknote className="w-5 h-5 text-[#C69C3D]" />
              </div>
              <div>
                <span className="text-[0.625rem] text-neutral-400 uppercase tracking-[0.2em] font-black block">{title || 'Total Salary Paid'}</span>
                <span className="text-[0.5625rem] text-[#C69C3D] font-bold opacity-60">{label || 'Cumulative Disbursement'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="text-sm font-black text-[#C69C3D]/40 font-mono italic">IDR</span>
            <p className="text-3xl font-black text-[#2C2A29] font-mono tracking-tighter">
              {totalSalaryAmount >= 1000000000 ? (
                <>
                  {(totalSalaryAmount / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}
                  <span className="text-sm font-medium lowercase italic ml-1 opacity-70">milyar</span>
                </>
              ) : (
                totalSalaryAmount.toLocaleString('id-ID')
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 pt-4">
        <h3 className="text-sm font-bold text-[#2C2A29] tracking-wide flex items-center gap-2">
          <span className="w-1 h-4 bg-[#C69C3D] rounded-full"></span>
          Salary & Payroll Records
          <span className="px-2 py-0.5 bg-neutral-100 rounded-full text-[0.625rem] text-neutral-500 font-bold">{salaryExpenses.length}</span>
        </h3>
        <button 
          onClick={onHistory}
          style={{ color: '#C69C3D' }} 
          className="text-[0.6875rem] font-black uppercase tracking-[0.2em] hover:opacity-70 transition-opacity flex items-center gap-1"
        >
          History <TrendingDown className="w-3 h-3 rotate-[-90deg]" />
        </button>
      </div>

      {isLoadingExpenses ? (
        <LoadingState msg="Loading Records..." />
      ) : salaryExpenses.length > 0 ? (
        <div className="space-y-3">
          {salaryExpenses.map((expense: any, idx: number) => {
            const total = parseFloat(expense.total_amount || '0');
            const amount = parseFloat(expense.amount || '0');
            const taxAmt = parseFloat(expense.tax_amount || '0');
            const tax2Amt = parseFloat(expense.second_tax_amount || '0');
            
            // Fallback for manual calculation if total_amount is missing
            const finalTotal = total > 0 ? total : (amount + taxAmt + tax2Amt);
            const expDate = expense.expense_date || expense.date || '';
            const description = expense.description || '';
            const descParts = description.split('\n').filter((s: string) => s.trim());
            
            let recipient = expense.linked_user_name || '';
            if (!recipient && description.toLowerCase().includes('team member:')) {
              const match = description.match(/team member:\s*([^(\n]+)/i);
              if (match && match[1]) {
                recipient = match[1].trim();
              }
            }
            
            const title = expense.title || 'Salary';
            const category = expense.category_name || expense.category || 'Salary';

            return (
              <div key={expense.id || idx} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-2xl border relative overflow-hidden group hover:border-[#C69C3D]/30 transition-all shadow-lg">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-[#C69C3D]"></div>
                <div className="p-4 pl-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                        <Banknote className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm leading-tight">{title}</h4>
                        <p className="text-[0.625rem] text-neutral-400 mt-0.5">
                          {expDate ? new Date(expDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600 font-mono">{formatCurrency(finalTotal)}</p>
                      <p className="text-[0.5625rem] text-neutral-400 mt-0.5 uppercase tracking-widest font-bold">Disbursed</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[0.5625rem] font-bold uppercase tracking-widest text-blue-600">
                      <Tag className="w-3 h-3" /> {category}
                    </span>
                    
                    {recipient && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-lg text-[0.5625rem] font-bold uppercase tracking-widest text-amber-600">
                        <Briefcase className="w-3 h-3" /> To: {recipient}
                      </span>
                    )}
                  </div>

                  {descParts.length > 0 && (
                    <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 space-y-1">
                      {descParts.map((line: string, lineIdx: number) => {
                        if (line.toLowerCase().includes('team member:')) return null;
                        return (
                          <p key={lineIdx} className="text-[0.6875rem] text-neutral-500 leading-relaxed italic">
                            "{line.trim()}"
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <NoSalaryDataState />
      )}
    </div>
  );
};

const LoadingState = ({ msg }: { msg: string }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-[#C69C3D] border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-[0.625rem] text-neutral-400 uppercase tracking-widest font-black">{msg}</p>
  </div>
);

const NoDataState = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200 border-dashed mx-1">
    <TrendingDown className="w-12 h-12 text-neutral-200 mb-4" />
    <p className="text-[0.625rem] text-neutral-400 tracking-widest uppercase font-black text-center px-8 leading-loose">No expense data<br/>available at the moment</p>
  </div>
);

const NoSalaryDataState = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200 border-dashed mx-1">
    <Banknote className="w-12 h-12 text-neutral-200 mb-4" />
    <p className="text-[0.625rem] text-neutral-400 tracking-widest uppercase font-black text-center px-8 leading-loose">No salary records found<br/>for your account</p>
  </div>
);

const ProjectEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-neutral-100 shadow-sm mx-1">
    <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
      <Briefcase className="w-8 h-8 text-neutral-200" />
    </div>
    <p className="text-[0.6875rem] text-neutral-400 tracking-widest uppercase font-black text-center px-8 leading-loose">No active projects<br/>with financial records</p>
  </div>
);
