import React, { useState } from 'react';
import { TrendingDown, Receipt, DollarSign, Tag, Briefcase, Wallet, PieChart, TrendingUp, Banknote } from 'lucide-react';
import { colors, formatCurrency } from '@/lib/utils';

interface FinanceContentProps {
  expenses: any[];
  isLoadingExpenses: boolean;
  financeSummary: any[];
  isLoadingFinanceSummary: boolean;
}

export const FinanceContent: React.FC<FinanceContentProps> = ({ 
  expenses, 
  isLoadingExpenses, 
  financeSummary, 
  isLoadingFinanceSummary 
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'salary'>('overview');

  // Filter salaries specifically
  const salaryExpenses = expenses.filter(exp => {
    const category = (exp.category_title || exp.category_name || exp.category || '').toLowerCase();
    const title = (exp.title || '').toLowerCase();
    return category.includes('salary') || title.includes('gaji') || title.includes('salary');
  });

  const totalSalaryAmount = salaryExpenses.reduce((sum, exp) => {
    const amt = parseFloat(exp.amount || '0');
    const tax = parseFloat(exp.tax_amount || exp.tax || '0');
    const tax2 = parseFloat(exp.second_tax_amount || exp.second_tax || '0');
    return sum + amt + tax + tax2;
  }, 0);

  const totalExpense = expenses.reduce((sum, exp) => {
    const amt = parseFloat(exp.amount || '0');
    const tax = parseFloat(exp.tax_amount || exp.tax || '0');
    const tax2 = parseFloat(exp.second_tax_amount || exp.second_tax || '0');
    return sum + amt + tax + tax2;
  }, 0);

  const totalProjectsBudget = financeSummary.reduce((sum, p) => sum + (p.project_price || 0), 0);
  const totalBalance = financeSummary.reduce((sum, p) => sum + (p.balance || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32">
      {/* Tab Switcher - Premium Style */}
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
          Salary/Payroll
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl border border-neutral-100 p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">Total Budget</span>
              </div>
              <p className="text-xl font-bold text-neutral-900 font-mono tracking-tighter">{formatCurrency(totalProjectsBudget)}</p>
            </div>

            <div className="bg-white rounded-3xl border border-neutral-100 p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-[#C69C3D]/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-[#C69C3D]/5 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-[#C69C3D]" />
                </div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">Tot. Balance</span>
              </div>
              <p className="text-xl font-bold text-[#C69C3D] font-mono tracking-tighter">{formatCurrency(totalBalance)}</p>
            </div>
          </div>

          <div className="px-1 flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              Financial Progress Reports
              <span className="px-2 py-0.5 bg-neutral-100 rounded-full text-[10px] text-neutral-500">{financeSummary.length}</span>
            </h3>
          </div>

          {isLoadingFinanceSummary ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-[#C69C3D] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-bold">Analisis Keuangan...</p>
            </div>
          ) : financeSummary.length > 0 ? (
            <div className="space-y-4">
              {financeSummary.map((p) => {
                const ratio = Math.min(100, p.expense_ratio || 0);
                const isOverBudget = ratio >= 90;
                
                return (
                  <div key={p.project_id} className="bg-white rounded-3xl border border-neutral-100 p-5 shadow-sm hover:border-[#C69C3D]/30 transition-all group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 pr-4">
                        <h4 className="font-bold text-neutral-900 text-[13px] leading-tight group-hover:text-[#C69C3D] transition-colors">{p.project_title}</h4>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] px-2 py-0.5 bg-neutral-50 border border-neutral-200 rounded text-neutral-500 uppercase font-bold tracking-wider">{p.status_title}</span>
                          <span className="text-[9px] text-neutral-400 flex items-center gap-1 font-medium italic">
                            {p.progress}% tasks done
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-neutral-400 uppercase font-black tracking-widest mb-0.5">Budget</p>
                        <p className="text-sm font-bold text-neutral-900 font-mono">{formatCurrency(p.project_price)}</p>
                      </div>
                    </div>

                    <div className="space-y-5 pt-1">
                      {/* Progress Comparison Section */}
                      <div className="grid grid-cols-1 gap-4">
                        {/* Financial Progress Bar */}
                        <div>
                          <div className="flex justify-between items-end mb-1.5">
                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                              <TrendingDown className={`w-3 h-3 ${isOverBudget ? 'text-rose-500' : 'text-neutral-400'}`} />
                              Used Budget
                            </span>
                            <span className={`text-[11px] font-black font-mono ${isOverBudget ? 'text-rose-600' : 'text-[#C69C3D]'}`}>
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
                            <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                              <TrendingUp className="w-3 h-3 text-[#C69C3D]" />
                              Project Progress
                            </span>
                            <span className="text-[11px] font-black font-mono text-[#C69C3D]">
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
                          <p className="text-[8px] text-neutral-400 uppercase font-black tracking-widest mb-1">Expenses</p>
                          <p className="text-[13px] font-bold text-rose-600 font-mono">{formatCurrency(p.total_expense)}</p>
                        </div>
                        <div className={`rounded-2xl p-3 border ${p.balance < 0 ? 'bg-rose-50 border-rose-100' : 'bg-[#C69C3D]/5 border-[#C69C3D]/10'}`}>
                          <p className="text-[8px] text-neutral-400 uppercase font-black tracking-widest mb-1">Balance</p>
                          <p className={`text-[13px] font-bold font-mono ${p.balance < 0 ? 'text-rose-600' : 'text-[#C69C3D]'}`}>{formatCurrency(p.balance)}</p>
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
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 px-1">
            <div className="relative overflow-hidden rounded-2xl border border-neutral-100 p-4" style={{ backgroundColor: colors.card }}>
              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-blue-500/10 blur-2xl pointer-events-none"></div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Banknote className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Total Salary Paid</span>
              </div>
              <p className="text-lg font-bold text-blue-600 font-mono tracking-tight">{formatCurrency(totalSalaryAmount)}</p>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-neutral-100 p-4" style={{ backgroundColor: colors.card }}>
              <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-[#C69C3D]/10 blur-2xl pointer-events-none"></div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#C69C3D]/5 flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-[#C69C3D]" />
                </div>
                <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Count</span>
              </div>
              <p className="text-lg font-bold text-[#C69C3D] font-mono tracking-tight">{salaryExpenses.length} <span className="text-xs font-normal text-neutral-400">items</span></p>
            </div>
          </div>

          <div className="flex items-center justify-between px-1 pt-2">
            <h3 className="text-sm font-bold text-neutral-900 tracking-wide">Salary & Payroll Records</h3>
            <span style={{ color: colors.gold }} className="text-[10px] font-bold uppercase tracking-widest">{salaryExpenses.length} Items</span>
          </div>

          {isLoadingExpenses ? (
            <LoadingState msg="Loading Records..." />
          ) : salaryExpenses.length > 0 ? (
            <div className="space-y-3">
              {salaryExpenses.map((expense: any, idx: number) => {
                const amount = parseFloat(expense.amount || '0');
                const taxAmt = parseFloat(expense.tax_amount || expense.tax || '0');
                const tax2Amt = parseFloat(expense.second_tax_amount || expense.second_tax || '0');
                const total = amount + taxAmt + tax2Amt;
                const expDate = expense.expense_date || expense.date || '';
                const description = expense.description || '';
                const descParts = description.split('\n').filter((s: string) => s.trim());
                
                // Extract recipient (Team Member) - Priority to linked_user_name, then description fallback
                let recipient = expense.linked_user_name || '';
                if (!recipient && description.toLowerCase().includes('team member:')) {
                  const match = description.match(/team member:\s*([^(\n]+)/i);
                  if (match && match[1]) {
                    recipient = match[1].trim();
                  }
                }
                
                const title = expense.title || 'Salary Expense';
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
                            <p className="text-[10px] text-neutral-400 mt-0.5">
                              {expDate ? new Date(expDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-blue-600 font-mono">{formatCurrency(total)}</p>
                          <p className="text-[9px] text-neutral-400 mt-0.5 uppercase tracking-widest font-bold">Disbursed</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-lg text-[9px] font-bold uppercase tracking-widest text-blue-600">
                          <Tag className="w-3 h-3" /> {category}
                        </span>
                        
                        {recipient && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-lg text-[9px] font-bold uppercase tracking-widest text-amber-600">
                            <Briefcase className="w-3 h-3" /> To: {recipient}
                          </span>
                        )}
                      </div>

                      {descParts.length > 0 && (
                        <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 space-y-1">
                          {descParts.map((line: string, lineIdx: number) => {
                            // Don't repeat the Team member line if we already show it as a badge
                            if (line.toLowerCase().includes('team member:')) return null;
                            return (
                              <p key={lineIdx} className="text-[11px] text-neutral-500 leading-relaxed italic">
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
      )}
    </div>
  );
};

const LoadingState = ({ msg }: { msg: string }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="w-8 h-8 border-2 border-[#C69C3D] border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-black">{msg}</p>
  </div>
);

const NoDataState = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200 border-dashed mx-1">
    <TrendingDown className="w-12 h-12 text-neutral-200 mb-4" />
    <p className="text-[10px] text-neutral-400 tracking-widest uppercase font-black text-center px-8 leading-loose">No expense data<br/>available at the moment</p>
  </div>
);

const NoSalaryDataState = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200 border-dashed mx-1">
    <Banknote className="w-12 h-12 text-neutral-200 mb-4" />
    <p className="text-[10px] text-neutral-400 tracking-widest uppercase font-black text-center px-8 leading-loose">No salary records found<br/>for your account</p>
  </div>
);

const ProjectEmptyState = () => (
  <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] border border-neutral-100 shadow-sm mx-1">
    <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
      <Briefcase className="w-8 h-8 text-neutral-200" />
    </div>
    <p className="text-[11px] text-neutral-400 tracking-widest uppercase font-black text-center px-8 leading-loose">No active projects<br/>with financial records</p>
  </div>
);

