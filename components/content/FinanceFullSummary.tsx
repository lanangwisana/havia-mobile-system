import React from 'react';
import { ArrowLeft, Briefcase, TrendingDown, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: any[];
  isLoading: boolean;
  onBack: () => void;
}

export const FinanceFullSummary: React.FC<Props> = ({ data, isLoading, onBack }) => {
  return (
    <div className="space-y-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="w-10 h-10 border-2 border-[#C69C3D] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : data.length > 0 ? (
        <div className="space-y-4 px-1">
          {data.map((p) => {
            const ratio = Math.min(100, p.expense_ratio || 0);
            const isOverBudget = ratio >= 90;
            
            return (
              <div key={p.project_id} className="bg-white rounded-[2rem] border border-neutral-100 p-6 shadow-sm hover:border-[#C69C3D]/30 transition-all transition-all group overflow-hidden relative">
                <div className="absolute right-0 top-0 w-24 h-24 bg-[#C69C3D]/5 rounded-full -mr-12 -mt-12"></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex-1 pr-4">
                    <h4 className="font-bold text-neutral-900 text-sm leading-tight group-hover:text-[#C69C3D] transition-colors">{p.project_title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[9px] px-2 py-0.5 bg-neutral-50 border border-neutral-200 rounded-md text-neutral-500 uppercase font-bold tracking-wider">{p.status_title}</span>
                       <span className="text-[9px] text-neutral-400 font-medium italic">{p.progress}% tasks done</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-neutral-400 uppercase font-black tracking-widest mb-0.5">Budget</p>
                    <p className="text-sm font-bold text-neutral-900 font-mono tracking-tighter">{formatCurrency(p.project_price)}</p>
                  </div>
                </div>

                <div className="space-y-6 pt-1 relative z-10">
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                          <TrendingDown className={`w-3 h-3 ${isOverBudget ? 'text-rose-500' : 'text-neutral-400'}`} />
                          Used Budget
                        </span>
                        <span className={`text-[11px] font-black font-mono ${isOverBudget ? 'text-rose-600' : 'text-[#C69C3D]'}`}>{ratio}%</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden flex p-0.5">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-rose-500' : 'bg-[#C69C3D]'}`}
                          style={{ width: `${ratio}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                          <TrendingUp className="w-3 h-3 text-[#C69C3D]" />
                          Project Progress
                        </span>
                        <span className="text-[11px] font-black font-mono text-[#C69C3D]">{p.progress}%</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden flex p-0.5">
                        <div 
                          className="h-full rounded-full bg-[#C69C3D] transition-all duration-1000 opacity-60"
                          style={{ width: `${p.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100">
                      <p className="text-[8px] text-neutral-400 uppercase font-black tracking-widest mb-1">Expenses</p>
                      <p className="text-sm font-bold text-rose-600 font-mono">{formatCurrency(p.total_expense)}</p>
                    </div>
                    <div className={`rounded-2xl p-4 border ${p.balance < 0 ? 'bg-rose-50 border-rose-100' : 'bg-[#C69C3D]/5 border-[#C69C3D]/10'}`}>
                      <p className="text-[8px] text-neutral-400 uppercase font-black tracking-widest mb-1">Balance</p>
                      <p className={`text-sm font-bold font-mono ${p.balance < 0 ? 'text-rose-600' : 'text-[#C69C3D]'}`}>{formatCurrency(p.balance)}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 px-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-neutral-300" />
          </div>
          <p className="text-neutral-400 text-sm">No project reports found.</p>
        </div>
      )}
    </div>
  );
};
