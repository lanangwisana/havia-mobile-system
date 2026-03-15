import React from 'react';
import { Calendar, FileText, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';

interface RiwayatPengajuanContentProps {
  leaves: any[];
  isLoading: boolean;
}

export const RiwayatPengajuanContent: React.FC<RiwayatPengajuanContentProps> = ({ leaves, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-8 h-8 border-2 border-[#C69C3D] border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Memuat Riwayat...</p>
      </div>
    );
  }

  if (!leaves || leaves.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 opacity-50 space-y-4">
        <AlertCircle className="w-12 h-12 text-neutral-700" />
        <p className="text-center text-neutral-400 text-sm">Belum ada riwayat pengajuan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {leaves.map((leave, idx) => {
        const isApproved = leave.status === 'approved';
        const isRejected = leave.status === 'rejected';
        const isPending = !isApproved && !isRejected;

        return (
          <div 
            key={idx} 
            className="group bg-[#111] border border-neutral-800 rounded-[2rem] p-5 hover:border-neutral-700 transition-all shadow-xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                  isApproved ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                  isRejected ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                  'bg-amber-500/10 border-amber-500/20 text-amber-500'
                }`}>
                  {isApproved ? <CheckCircle2 className="w-6 h-6" /> : 
                   isRejected ? <XCircle className="w-6 h-6" /> : 
                   <Clock className="w-6 h-6" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white uppercase tracking-widest">{leave.leave_type_title || 'Pengajuan'}</span>
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-tighter">
                    {new Date(leave.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                isApproved ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                isRejected ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                'bg-amber-500/10 border-amber-500/20 text-amber-400'
              }`}>
                {leave.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-neutral-900/50 rounded-2xl p-3 border border-neutral-800/30">
                <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">Durasi</span>
                <span className="text-xs font-bold text-white uppercase">{leave.total_days || '0'} Hari</span>
              </div>
              <div className="bg-neutral-900/50 rounded-2xl p-3 border border-neutral-800/30">
                <span className="text-[8px] text-neutral-500 font-bold uppercase tracking-widest block mb-1">Sampai</span>
                <span className="text-xs font-bold text-white uppercase">
                  {new Date(leave.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>

            <div className="bg-neutral-900/30 rounded-2xl p-4 border border-neutral-800/20">
              <span className="text-[8px] text-neutral-600 font-black uppercase tracking-[0.2em] block mb-2">Alasan / Keterangan</span>
              <p className="text-[11px] text-neutral-400 leading-relaxed italic">
                "{leave.reason || leave.note || 'Tidak ada keterangan'}"
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
