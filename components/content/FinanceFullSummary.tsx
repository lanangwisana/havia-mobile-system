import React from 'react';
import { ArrowLeft, Briefcase, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: any[];
  isLoading: boolean;
  paginationMeta?: any;
  onPageChange?: (page: number) => void;
  onBack: () => void;
}

export const FinanceFullSummary: React.FC<Props> = ({ data, isLoading, paginationMeta, onPageChange, onBack }) => {
  const renderLargeAmount = (amount: number, justifyAlign: string = "justify-end") => {
    const abs = Math.abs(amount || 0);
    if (abs >= 1000000000) {
      return (
        <span className={`flex items-baseline ${justifyAlign} gap-[2px]`}>
          <span className="tracking-tighter">{amount < 0 ? '-' : ''}{(abs / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}</span>
          <span className="text-[0.5rem] lowercase italic opacity-70 font-medium tracking-normal font-sans ml-0.5">milyar</span>
        </span>
      );
    }
    return <span className="text-[0.75rem] font-bold tracking-tighter leading-none">{formatCurrency(amount).replace('IDR', 'Rp')}</span>;
  };

  const globalTotalBudget = paginationMeta?.global_total_budget || 0;
  const globalTotalBalance = paginationMeta?.global_total_balance || 0;

  return (
    <div className="space-y-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <div className="w-10 h-10 border-2 border-[#C69C3D] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Global Summary Cards */}
          <div className="grid grid-cols-2 gap-4 px-1">
            <div className="bg-white rounded-3xl border border-neutral-100 p-5 shadow-sm relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-24 h-24 bg-[#C69C3D]/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-[#FAF7EF] flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-[#C69C3D]" />
                </div>
                <span className="text-[0.625rem] text-neutral-400 uppercase tracking-widest font-black">Total Budget</span>
              </div>
              <p className={`font-bold text-neutral-900 font-mono tracking-tighter ${globalTotalBudget >= 1000000000 ? 'text-xl' : 'text-base'}`}>
                {globalTotalBudget >= 1000000000 ? (
                  <>
                    {(globalTotalBudget / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}
                    <span className="text-[0.625rem] lowercase italic ml-1 opacity-70 font-medium">milyar</span>
                  </>
                ) : (
                  formatCurrency(globalTotalBudget)
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
              <p className={`font-bold text-[#C69C3D] font-mono tracking-tighter ${globalTotalBalance >= 1000000000 ? 'text-xl' : 'text-base'}`}>
                {globalTotalBalance >= 1000000000 ? (
                  <>
                    {(globalTotalBalance / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}
                    <span className="text-[0.625rem] lowercase italic ml-1 opacity-70 font-medium">milyar</span>
                  </>
                ) : (
                  formatCurrency(globalTotalBalance)
                )}
              </p>
            </div>
          </div>

          {data.length > 0 ? (
            <div className="space-y-4 px-1">
              {data.map((p) => {
            const ratio = Math.min(100, p.expense_ratio || 0);
            const isOverBudget = ratio >= 90;
            
            return (
              <div key={p.project_id} className="bg-white rounded-[2rem] border border-neutral-100 p-6 shadow-sm hover:border-[#C69C3D]/30 transition-all group overflow-hidden relative">
                <div className="absolute right-0 top-0 w-24 h-24 bg-[#C69C3D]/5 rounded-full -mr-12 -mt-12"></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex-1 pr-4">
                    <h4 className="font-bold text-neutral-900 text-sm leading-tight group-hover:text-[#C69C3D] transition-colors">{p.project_title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[0.5625rem] px-2 py-0.5 bg-neutral-50 border border-neutral-200 rounded-md text-neutral-500 uppercase font-bold tracking-wider">{p.status_title}</span>
                       <span className="text-[0.5625rem] text-neutral-400 font-medium italic">{p.progress}% tasks done</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[0.5625rem] text-neutral-400 uppercase font-black tracking-widest mb-0.5">Budget</p>
                    <div className="text-sm font-bold text-neutral-900 font-mono tracking-tighter">{renderLargeAmount(p.project_price)}</div>
                  </div>
                </div>

                <div className="space-y-6 pt-1 relative z-10">
                  <div className="grid grid-cols-1 gap-5">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[0.5625rem] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                          <TrendingDown className={`w-3 h-3 ${isOverBudget ? 'text-rose-500' : 'text-neutral-400'}`} />
                          Used Budget
                        </span>
                        <span className={`text-[0.6875rem] font-black font-mono ${isOverBudget ? 'text-rose-600' : 'text-[#C69C3D]'}`}>{ratio}%</span>
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
                        <span className="text-[0.5625rem] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5">
                          <TrendingUp className="w-3 h-3 text-[#C69C3D]" />
                          Project Progress
                        </span>
                        <span className="text-[0.6875rem] font-black font-mono text-[#C69C3D]">{p.progress}%</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden flex p-0.5">
                        <div 
                           className="h-full rounded-full bg-[#C69C3D] transition-all duration-1000 opacity-60"
                          style={{ width: `${p.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-100 flex flex-col justify-center min-w-0">
                      <p className="text-[0.5rem] text-neutral-400 uppercase font-black tracking-widest mb-1">Expenses</p>
                      <div className="text-sm font-bold text-rose-600 font-mono truncate">{renderLargeAmount(p.total_expense, "justify-start")}</div>
                    </div>
                    <div className={`rounded-2xl p-3 border flex flex-col justify-center min-w-0 ${p.balance < 0 ? 'bg-rose-50 border-rose-100' : 'bg-[#C69C3D]/5 border-[#C69C3D]/10'}`}>
                      <p className="text-[0.5rem] text-neutral-400 uppercase font-black tracking-widest mb-1">Balance</p>
                      <div className={`text-sm font-bold font-mono truncate ${p.balance < 0 ? 'text-rose-600' : 'text-[#C69C3D]'}`}>{renderLargeAmount(p.balance, "justify-start")}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination UI */}
          {paginationMeta && paginationMeta.total_pages > 1 && (
            <div className="flex flex-col items-center gap-4 mt-8 pb-10">
              <div className="flex items-center justify-between w-full max-w-[280px] p-1.5 bg-white rounded-2xl border border-[#E8E4E1] shadow-sm">
                <button 
                  disabled={paginationMeta.current_page <= 1}
                  onClick={() => onPageChange?.(paginationMeta.current_page - 1)}
                  className="px-4 py-2 rounded-xl font-black text-[0.5625rem] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-20 bg-[#2C2A29]/5 text-[#2C2A29]"
                >
                  Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: paginationMeta.total_pages }, (_, i) => i + 1).map((p) => {
                    const current = paginationMeta.current_page;
                    const total = paginationMeta.total_pages;
                    
                    if (p === 1 || p === total || (p >= current - 1 && p <= current + 1)) {
                       return (
                        <button
                          key={p}
                          onClick={() => onPageChange?.(p)}
                          className={`w-8 h-8 rounded-lg font-black text-[0.6875rem] transition-all duration-300 flex items-center justify-center ${
                            current === p 
                              ? 'bg-[#C69C3D] text-white shadow-sm' 
                              : 'bg-transparent text-[#6B6865]/60 hover:text-[#282524] hover:bg-[#2C2A29]/5'
                          }`}
                        >
                          {p}
                        </button>
                      );
                    } else if (p === current - 2 || p === current + 2) {
                      return <span key={p} className="text-[#6B6865]/20 text-[0.5625rem]">..</span>;
                    }
                    return null;
                  })}
                </div>

                <button 
                  disabled={paginationMeta.current_page >= paginationMeta.total_pages}
                  onClick={() => onPageChange?.(paginationMeta.current_page + 1)}
                  className="px-4 py-2 rounded-xl font-black text-[0.5625rem] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-20 bg-[#2C2A29]/5 text-[#2C2A29]"
                >
                  Next
                </button>
              </div>
              
              <div className="flex items-center gap-3 opacity-40">
                 <span className="text-[0.5625rem] text-[#6B6865] font-black uppercase tracking-widest">
                   Page {paginationMeta.current_page} / {paginationMeta.total_pages}
                 </span>
                 <div className="h-1 w-1 rounded-full bg-neutral-300"></div>
                 <span className="text-[0.5625rem] text-[#6B6865] font-black uppercase tracking-widest">
                   {paginationMeta.total_items} Reports
                 </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-40 px-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-neutral-300" />
          </div>
          <p className="text-neutral-400 text-sm">No project reports found.</p>
        </div>
      )}
    </>
  )}
</div>
  );
};
