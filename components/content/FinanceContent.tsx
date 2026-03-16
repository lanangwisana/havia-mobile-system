import React from 'react';
import { TrendingDown, Receipt, DollarSign, Tag, Briefcase } from 'lucide-react';
import { colors, formatCurrency } from '@/lib/utils';

interface FinanceContentProps {
  expenses: any[];
  isLoadingExpenses: boolean;
}

export const FinanceContent: React.FC<FinanceContentProps> = ({ expenses, isLoadingExpenses }) => {
  const totalExpense = expenses.reduce((sum, exp) => {
    const amt = parseFloat(exp.amount || '0');
    const tax = parseFloat(exp.tax_amount || exp.tax || '0');
    const tax2 = parseFloat(exp.second_tax_amount || exp.second_tax || '0');
    return sum + amt + tax + tax2;
  }, 0);

  const totalAmount = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || '0'), 0);
  const totalTax = expenses.reduce((sum, exp) => sum + parseFloat(exp.tax_amount || exp.tax || '0') + parseFloat(exp.second_tax_amount || exp.second_tax || '0'), 0);

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="grid grid-cols-2 gap-3">
        <div className="relative overflow-hidden rounded-2xl border border-neutral-100 p-4" style={{ backgroundColor: colors.card }}>
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-rose-500/10 blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-rose-600" />
            </div>
            <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Total Expense</span>
          </div>
          <p className="text-lg font-bold text-rose-600 font-mono tracking-tight">{formatCurrency(totalExpense)}</p>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-neutral-100 p-4" style={{ backgroundColor: colors.card }}>
          <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-[#C69C3D]/10 blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#C69C3D]/5 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-[#C69C3D]" />
            </div>
            <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">Count</span>
          </div>
          <p className="text-lg font-bold text-[#C69C3D] font-mono tracking-tight">{expenses.length} <span className="text-xs font-normal text-neutral-400">items</span></p>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-100 p-4 flex items-center justify-between" style={{ backgroundColor: colors.card }}>
        <div className="flex-1 text-center">
          <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Subtotal</p>
          <p className="text-sm font-bold text-neutral-900 font-mono">{formatCurrency(totalAmount)}</p>
        </div>
        <div className="w-px h-10 bg-neutral-100"></div>
        <div className="flex-1 text-center">
          <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1">Tax</p>
          <p className="text-sm font-bold text-amber-600 font-mono">{formatCurrency(totalTax)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 pt-2">
        <h3 className="text-sm font-bold text-neutral-900 tracking-wide">Expense List</h3>
        <span style={{ color: colors.gold }} className="text-[10px] font-bold uppercase tracking-widest">{expenses.length} Items</span>
      </div>

      {isLoadingExpenses ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#C69C3D] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs text-neutral-400 uppercase tracking-widest">Loading Expenses...</p>
        </div>
      ) : expenses.length > 0 ? (
        <div className="space-y-3">
          {expenses.map((expense: any, idx: number) => {
            const amount = parseFloat(expense.amount || '0');
            const taxAmt = parseFloat(expense.tax_amount || expense.tax || '0');
            const tax2Amt = parseFloat(expense.second_tax_amount || expense.second_tax || '0');
            const total = amount + taxAmt + tax2Amt;
            const expDate = expense.expense_date || expense.date || '';
            const category = expense.category_name || expense.category || 'Umum';
            const title = expense.title || 'Expense';
            const description = expense.description || '';
            const descParts = description.split('\n').filter((s: string) => s.trim());

            return (
              <div key={expense.id || idx} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-2xl border relative overflow-hidden group hover:border-[#C69C3D]/30 transition-all shadow-lg">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#C69C3D] to-red-500/50"></div>
                <div className="p-4 pl-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-rose-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-neutral-900 text-sm leading-tight">{title}</h4>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {expDate ? new Date(expDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-rose-600 font-mono">{formatCurrency(total)}</p>
                      {taxAmt > 0 && <p className="text-[9px] text-amber-600 mt-0.5">inc. tax {formatCurrency(taxAmt)}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#C69C3D]/10 border border-[#C69C3D]/20 rounded-lg text-[9px] font-bold uppercase tracking-widest text-[#C69C3D]">
                      <Tag className="w-3 h-3" /> {category}
                    </span>
                    {expense.project_title && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[9px] font-bold uppercase tracking-widest text-blue-600">
                        <Briefcase className="w-3 h-3" /> {expense.project_title}
                      </span>
                    )}
                  </div>

                  {descParts.length > 0 && (
                    <div className="bg-neutral-50 rounded-xl p-3 border border-neutral-100 space-y-1">
                      {descParts.map((line: string, lineIdx: number) => (
                        <p key={lineIdx} className="text-[11px] text-neutral-500 leading-relaxed">
                          {line.trim()}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-neutral-100">
                    <div>
                      <p className="text-[8px] text-neutral-400 uppercase tracking-[0.2em] mb-0.5">Amount</p>
                      <p className="text-[11px] text-neutral-700 font-medium font-mono">{formatCurrency(amount)}</p>
                    </div>
                    {taxAmt > 0 && (
                      <div>
                        <p className="text-[8px] text-neutral-400 uppercase tracking-[0.2em] mb-0.5">Tax</p>
                        <p className="text-[11px] text-amber-600 font-medium font-mono">{formatCurrency(taxAmt)}</p>
                      </div>
                    )}
                    <div className="ml-auto">
                      <p className="text-[8px] text-neutral-400 uppercase tracking-[0.2em] mb-0.5">Total</p>
                      <p className="text-[11px] text-rose-600 font-bold font-mono">{formatCurrency(total)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-neutral-50 rounded-3xl border border-neutral-200 border-dashed">
          <DollarSign className="w-12 h-12 text-neutral-200 mb-4" />
          <p className="text-xs text-neutral-400 tracking-widest uppercase font-bold text-center px-8">No expense data<br/>currently available</p>
        </div>
      )}
    </div>
  );
};
