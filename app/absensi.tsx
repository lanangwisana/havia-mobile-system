"use client";

import React from 'react';
import { Clock, LogOut } from 'lucide-react';

interface AbsensiColors {
  gold: string;
  darkGold: string;
  bg: string;
  card: string;
  border: string;
  textMuted: string;
}

interface AbsensiContentProps {
  attendances: any[];
  isLoadingAttendances: boolean;
  colors: AbsensiColors;
}

export function AbsensiContent({ attendances, isLoadingAttendances, colors }: AbsensiContentProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex items-center justify-between mb-4 pl-1">
        <h3 className="text-sm font-bold text-white tracking-wide">Riwayat Absensi</h3>
        <span style={{ color: colors.gold }} className="text-[10px] font-bold uppercase tracking-widest">{attendances.length} Data</span>
      </div>

      {isLoadingAttendances ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#C69C3D] border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xs text-neutral-500 uppercase tracking-widest">Memuat Riwayat Absensi...</p>
        </div>
      ) : attendances.length > 0 ? (
        <div className="space-y-4">
          {attendances.map((att: any, idx: number) => {
            const dateObj = new Date(att.date || new Date().toISOString());
            const displayDate = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            return (
              <div key={att.id || idx} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="rounded-2xl border relative overflow-hidden group hover:border-[#C69C3D]/30 transition-all shadow-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">{displayDate}</h4>
                    {att.note && <p className="text-[10px] text-neutral-400 italic">Catatan: {att.note}</p>}
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-green-500/20 bg-green-500/10 text-green-400`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    {att.status_title || att.status || 'Hadir'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-800/50">
                  <div className="flex flex-col">
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                      <LogOut className="w-3 h-3 text-red-400 transform rotate-180" /> Masuk
                    </span>
                    <span className="text-base font-mono font-bold text-white group-hover:text-[#C69C3D] transition-colors">
                      {att.in_time || '--:--'}
                    </span>
                  </div>
                  <div className="flex flex-col pl-4 border-l border-neutral-800/50">
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                      <LogOut className="w-3 h-3 text-neutral-400" /> Pulang
                    </span>
                    <span className="text-base font-mono font-bold text-neutral-300">
                      {att.out_time || '--:--'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-[#2C2A29] rounded-3xl border border-neutral-800 border-dashed">
          <Clock className="w-12 h-12 text-neutral-600 mb-4" />
          <p className="text-xs text-neutral-500 tracking-widest uppercase font-bold text-center px-8">Belum ada riwayat<br/>absensi</p>
        </div>
      )}
    </div>
  );
}
