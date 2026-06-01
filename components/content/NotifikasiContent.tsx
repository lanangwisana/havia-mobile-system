import React from 'react';
import { Activity, Info } from 'lucide-react';

interface NotifikasiContentProps {
  isLoadingNotif: boolean;
  notifications: any[];
  onProjectClick: (id: string, name: string, taskId?: string | null) => void;
  onNav: (view: string, nav?: string | null, title?: string) => void;
  paginationMeta?: any;
  onPageChange?: (page: number) => void;
}

export const NotifikasiContent: React.FC<NotifikasiContentProps> = ({
  isLoadingNotif, notifications, paginationMeta, onPageChange
}) => {
  const renderPaginationButtons = () => {
    if (!paginationMeta) return null;
    const { current_page, total_pages } = paginationMeta;
    let pages = [];
    
    if (total_pages <= 3) {
      for (let i = 1; i <= total_pages; i++) {
        pages.push(i);
      }
    } else {
      if (current_page === 1) {
        pages = [1, 2, 3];
      } else if (current_page === total_pages) {
        pages = [total_pages - 2, total_pages - 1, total_pages];
      } else {
        pages = [current_page - 1, current_page, current_page + 1];
      }
    }

    return pages.map(page => (
      <button 
        key={page}
        onClick={() => onPageChange?.(page)}
        className={`w-8 h-8 rounded-xl font-bold text-[0.6875rem] transition-all flex items-center justify-center border-b-2
          ${current_page === page 
            ? 'bg-[#2C2A29] text-white border-[#C69C3D] scale-110 shadow-lg' 
            : 'bg-white text-neutral-500 border-neutral-100 hover:bg-neutral-50 active:scale-95'
          }`}
      >
        {page}
      </button>
    ));
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      {isLoadingNotif ? (
        <div className="flex flex-col items-center justify-center py-20">
           <div className="w-10 h-10 rounded-full border-t-2 border-[#C69C3D] animate-spin mb-4"></div>
           <p className="text-[0.625rem] text-neutral-400 font-black uppercase tracking-widest">Scanning System...</p>
        </div>
      ) : notifications.length > 0 ? (
        notifications.map((notif: any, index: number) => {
          const isUrgent = notif.severity === 'urgent';
          const accentColor = isUrgent ? 'bg-red-500' : 'bg-[#C69C3D]';
          const textColor = isUrgent ? 'text-red-600' : 'text-[#C69C3D]';
          
          return (
            <div key={notif.id || index} 
              className="p-5 rounded-2xl bg-white border border-[#E8E4E1] flex flex-col gap-3 shadow-sm relative overflow-hidden"
            >
              {/* Subtle accent line on top */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${accentColor} opacity-80`}></div>

              <div className="flex justify-between items-start pt-1">
                <div className="flex flex-col gap-1">
                  <h4 className={`font-black text-[1rem] leading-tight uppercase tracking-wide ${textColor}`}>
                    {notif.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-md text-[0.5rem] font-black uppercase tracking-widest ${isUrgent ? 'bg-red-50 text-red-500' : 'bg-[#C69C3D]/10 text-[#C69C3D]'}`}>
                        {notif.module}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-[0.5rem] text-neutral-400 font-black uppercase tracking-widest mb-0.5">Deadline</span>
                  <span className="text-[0.6875rem] text-neutral-800 font-bold bg-neutral-50 px-2 py-1 rounded-lg border border-neutral-100">
                    {notif.date ? new Date(notif.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100/50 flex">
                <p className="text-[0.875rem] text-neutral-700 font-bold leading-snug flex-1 min-w-0 truncate">
                  {notif.message}
                </p>
              </div>
            </div>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-20 opacity-30">
          <div className="w-16 h-16 rounded-[2rem] border border-dashed border-[#6B6865] flex items-center justify-center mb-6">
            <Info className="w-8 h-8 text-[#6B6865]" />
          </div>
          <p className="text-[0.625rem] text-[#2C2A29] font-black uppercase tracking-[0.3em]">No Active Alerts</p>
          <p className="text-[0.5625rem] text-[#6B6865] font-medium mt-2">Your workspace is all clear</p>
        </div>
      )}

      {/* Pagination Container */}
      {!isLoadingNotif && paginationMeta && paginationMeta.total_pages > 1 && (
        <div className="flex flex-col items-center gap-4 mt-8 pt-6 border-t border-dashed border-neutral-200">
          <div className="bg-[#F8F6F3] p-1.5 rounded-2xl flex items-center justify-center gap-2 max-w-[280px] w-full border border-[#E8E4E1]">
            <button 
              disabled={paginationMeta.current_page === 1}
              onClick={() => onPageChange?.(paginationMeta.current_page - 1)}
              className="px-4 py-2 rounded-xl font-black text-[0.5625rem] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-20 bg-white text-neutral-600 shadow-sm"
            >Prev</button>
            
            <div className="flex items-center gap-1.5 flex-1 justify-center">
              {renderPaginationButtons()}
            </div>
            
            <button 
              disabled={paginationMeta.current_page >= paginationMeta.total_pages}
              onClick={() => onPageChange?.(paginationMeta.current_page + 1)}
              className="px-4 py-2 rounded-xl font-black text-[0.5625rem] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-20 bg-[#C69C3D] text-white shadow-md"
            >Next</button>
          </div>
          
          <div className="flex items-center gap-3 opacity-40">
             <span className="text-[0.5625rem] text-[#6B6865] font-black uppercase tracking-widest">Page {paginationMeta.current_page} / {paginationMeta.total_pages}</span>
             <div className="h-1 w-1 rounded-full bg-neutral-400"></div>
             <span className="text-[0.5625rem] text-[#6B6865] font-black uppercase tracking-widest">
               {paginationMeta.total_records} NOTIFICATIONS
             </span>
          </div>
        </div>
      )}
    </div>
  );
};
