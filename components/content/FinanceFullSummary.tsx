import React from 'react';
import { ArrowLeft, Briefcase, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: any[];
  isLoading: boolean;
  paginationMeta?: any;
  onPageChange?: (page: number) => void;
  onBack: () => void;
  financeTotals?: any;
}

export const FinanceFullSummary: React.FC<Props> = ({ data, isLoading, paginationMeta, onPageChange, onBack, financeTotals }) => {
  const renderLargeAmount = (amount: number, justifyAlign: string = "justify-end") => {
    const abs = Math.abs(amount || 0);
    
    // Format Milyar
    if (abs >= 1000000000) {
      return (
        <span className={`flex items-baseline ${justifyAlign} gap-[2px]`}>
          <span className="tracking-tighter text-[min(3.5vw,1.1rem)]">
            {amount < 0 ? '-' : ''}{(abs / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 1 })}
          </span>
          <span className="text-[0.5rem] lowercase italic opacity-70 font-medium tracking-normal font-sans ml-0.5">milyar</span>
        </span>
      );
    }
    
    const formatted = formatCurrency(amount).replace('IDR', 'Rp');
    
    return (
      <span className="font-bold tracking-tighter leading-none whitespace-nowrap">
        {formatted}
      </span>
    );
  };

  const globalTotalBudget = financeTotals ? (financeTotals.total_budget || 0) : (paginationMeta?.global_total_budget || 0);
  const globalTotalBalance = financeTotals ? (financeTotals.total_balance || 0) : (paginationMeta?.global_total_balance || 0);

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
              <p className={`font-bold text-neutral-900 font-mono tracking-tighter ${
                globalTotalBudget >= 1000000000 ? 'text-xl' : 
                globalTotalBudget >= 100000000 ? 'text-[0.85rem]' :
                globalTotalBudget >= 10000000 ? 'text-sm' : 'text-base'
              }`}>
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
              <p className={`font-bold text-[#C69C3D] font-mono tracking-tighter ${
                globalTotalBalance >= 1000000000 ? 'text-xl' : 
                globalTotalBalance >= 100000000 ? 'text-[0.85rem]' :
                globalTotalBalance >= 10000000 ? 'text-sm' : 'text-base'
              }`}>
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
              <div key={p.project_id} className="bg-white rounded-[2rem] border border-neutral-100 p-5 shadow-sm hover:border-[#C69C3D]/30 transition-all group overflow-hidden relative">
                <div className="absolute right-0 top-0 w-24 h-24 bg-[#C69C3D]/5 rounded-full -mr-12 -mt-12"></div>
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="flex-1 pr-4">
                    <h4 className="font-bold text-neutral-900 text-sm leading-tight group-hover:text-[#C69C3D] transition-colors">{p.project_title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="text-[0.5625rem] px-2 py-0.5 bg-neutral-50 border border-neutral-200 rounded-md text-neutral-500 uppercase font-bold tracking-wider">{p.status_title}</span>
                       <span className="text-[0.5625rem] text-neutral-400 font-medium italic">{p.progress}% tasks done • {p.expense_count || 0} items</span>
                    </div>
                    {p.expense_titles && (
                      <p className="text-[0.5rem] text-neutral-400 mt-1 leading-tight line-clamp-2 italic">
                        Incl: {p.expense_titles}
                      </p>
                    )}
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
                      <div className="text-[0.8125rem] font-bold text-rose-600 font-mono truncate">{renderLargeAmount(p.total_expense, "justify-start")}</div>
                    </div>
                    <div className={`rounded-2xl p-3 border flex flex-col justify-center min-w-0 ${p.balance < 0 ? 'bg-rose-50 border-rose-100' : 'bg-[#C69C3D]/5 border-[#C69C3D]/10'}`}>
                      <p className="text-[0.5rem] text-neutral-400 uppercase font-black tracking-widest mb-1">Balance</p>
                      <div className={`text-[0.8125rem] font-bold font-mono truncate ${p.balance < 0 ? 'text-rose-600' : 'text-[#C69C3D]'}`}>{renderLargeAmount(p.balance, "justify-start")}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Pagination UI - Redesigned for premium look and better spacing */}
          {paginationMeta && paginationMeta.total_pages > 1 && (
            <div className="flex flex-col items-center gap-5 mt-10 pb-16">
              <div className="flex items-center justify-between w-full max-w-[320px] p-1.5 bg-white/80 backdrop-blur-md rounded-2xl border border-neutral-200 shadow-sm">
                <button 
                  disabled={paginationMeta.current_page <= 1}
                  onClick={() => onPageChange?.(paginationMeta.current_page - 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl font-black text-[0.5625rem] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-20 bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                >
                  Prev
                </button>

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: paginationMeta.total_pages }, (_, i) => i + 1).map((p) => {
                    const current = paginationMeta.current_page;
                    const total = paginationMeta.total_pages;
                    
                    // Logic: Show [Current-1], [Current], and [Total]
                    const isCurrent = p === current;
                    const isPrev = p === current - 1 && p > 0;
                    const isLast = p === total;
                    
                    if (isCurrent || isPrev || isLast) {
                       return (
                        <React.Fragment key={p}>
                          {isLast && p > current + 1 && (
                            <span className="w-4 text-center text-neutral-300 text-[0.625rem] font-bold">..</span>
                          )}
                          <button
                            onClick={() => onPageChange?.(p)}
                            className={`w-9 h-9 rounded-xl font-black text-[0.75rem] transition-all duration-300 flex items-center justify-center ${
                              isCurrent 
                                ? 'bg-[#C69C3D] text-white shadow-md shadow-[#C69C3D]/20 scale-110 z-10' 
                                : 'bg-transparent text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'
                            }`}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      );
                    }
                    return null;
                  })}
                </div>

                <button 
                  disabled={paginationMeta.current_page >= paginationMeta.total_pages}
                  onClick={() => onPageChange?.(paginationMeta.current_page + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl font-black text-[0.5625rem] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-20 bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                >
                  Next
                </button>
              </div>
              
              <div className="flex items-center gap-3 py-1 px-4 bg-neutral-50 rounded-full border border-neutral-100 shadow-inner">
                 <span className="text-[0.5625rem] text-neutral-500 font-bold uppercase tracking-[0.15em]">
                   Page {paginationMeta.current_page} / {paginationMeta.total_pages}
                 </span>
                 <div className="h-1 w-1 rounded-full bg-[#C69C3D]/30"></div>
                 <span className="text-[0.5625rem] text-neutral-500 font-bold uppercase tracking-[0.15em]">
                   {paginationMeta.total_items} Projects
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
