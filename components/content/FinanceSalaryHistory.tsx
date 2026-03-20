import React from 'react';
import { ArrowLeft, TrendingDown, Receipt, Banknote, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: any[];
  isLoading: boolean;
  onBack: () => void;
}

export const FinanceSalaryHistory: React.FC<Props> = ({ data, isLoading, onBack }) => {
  return (
    <div className="space-y-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="w-10 h-10 border-2 border-[#C69C3D] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : data.length > 0 ? (
        <div className="space-y-4 px-1">
          <div className="space-y-4 pt-2">
            {data.map((expense: any, idx: number) => {
              const amount = parseFloat(expense.amount || '0');
              const taxAmt = parseFloat(expense.tax_amount || expense.tax || '0');
              const tax2Amt = parseFloat(expense.second_tax_amount || expense.second_tax || '0');
              const total = amount + taxAmt + tax2Amt;
              const expDate = expense.expense_date || expense.date || '';
              const description = expense.description || '';
              const isDisbursed = expense.status === 'disbursed';

              return (
                <div key={idx} className="bg-white rounded-3xl border border-neutral-100 p-5 shadow-sm hover:border-[#C69C3D]/20 transition-all group active:scale-[0.98]">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center group-hover:bg-[#FAF7EF] group-hover:scale-110 transition-all duration-300">
                      <Banknote className="w-6 h-6 text-[#C69C3D]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-neutral-900 text-sm leading-tight group-hover:text-[#C69C3D] transition-colors">{expense.title || 'Salary Expense'}</h4>
                      <div className="flex items-center gap-1.5 mt-1.5 opacity-60">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        <p className="text-[10px] text-neutral-500 font-medium">{expDate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#C69C3D] font-mono tracking-tighter">{formatCurrency(total)}</p>
                      <span className="text-[9px] text-neutral-400 uppercase font-black tracking-widest opacity-50">Disbursed</span>
                    </div>
                  </div>
                  
                  {description && (
                    <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 group-hover:bg-[#FAF7EF] group-hover:border-[#C69C3D]/10 transition-all duration-300">
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <TrendingDown className="w-3 h-3 text-neutral-300" />
                            Note
                        </p>
                        <p className="text-[11px] text-neutral-600 leading-relaxed font-medium italic overflow-hidden line-clamp-2">
                          {description}
                        </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 px-10 text-center space-y-4 text-neutral-300">
          <Receipt className="w-12 h-12 opacity-30" />
          <p className="text-sm">No payroll records found.</p>
        </div>
      )}
    </div>
  );
};
