"use client";

import React from 'react';
import { Clock, FileText, CalendarRange } from 'lucide-react';

interface TimContentProps {
  handleNav: (view: string, nav?: string | null, title?: string) => void;
}

export function TimContent({ handleNav }: TimContentProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex items-center justify-between pl-1">
        <h3 className="text-sm font-bold text-white tracking-wide">Tim & Kehadiran</h3>
      </div>
      
      {/* Grid tombol absensi, izin, cuti */}
      <div className="grid grid-cols-3 gap-3">
        {/* Tombol Absensi */}
        <button onClick={() => handleNav('subpage', null, 'Absensi')} className="flex flex-col items-center justify-center bg-[#2C2A29] border border-neutral-800 rounded-3xl p-5 hover:border-[#C69C3D]/50 transition-colors group relative overflow-hidden active:scale-95 duration-200 shadow-lg">
          <div className="absolute top-[-10%] right-[-10%] w-10 h-10 bg-[#C69C3D]/10 rounded-full blur-[10px] pointer-events-none group-hover:bg-[#C69C3D]/20 transition-colors"></div>
          <div className="w-10 h-10 rounded-2xl bg-[#C69C3D]/10 border border-[#C69C3D]/20 flex items-center justify-center mb-3">
            <Clock className="w-5 h-5 text-[#C69C3D]" />
          </div>
          <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest group-hover:text-white transition-colors">Riwayat Absensi</span>
        </button>

        {/* Tombol Izin */}
        <button className="flex flex-col items-center justify-center bg-[#2C2A29] border border-neutral-800 rounded-3xl p-5 hover:border-[#C69C3D]/50 transition-colors group relative overflow-hidden active:scale-95 duration-200 shadow-lg">
          <div className="absolute top-[-10%] right-[-10%] w-10 h-10 bg-blue-500/10 rounded-full blur-[10px] pointer-events-none group-hover:bg-blue-500/20 transition-colors"></div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-3">
            <FileText className="w-5 h-5 text-blue-400" />
          </div>
          <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest group-hover:text-white transition-colors">Izin</span>
        </button>

        {/* Tombol Cuti */}
        <button className="flex flex-col items-center justify-center bg-[#2C2A29] border border-neutral-800 rounded-3xl p-5 hover:border-[#C69C3D]/50 transition-colors group relative overflow-hidden active:scale-95 duration-200 shadow-lg">
          <div className="absolute top-[-10%] right-[-10%] w-10 h-10 bg-purple-500/10 rounded-full blur-[10px] pointer-events-none group-hover:bg-purple-500/20 transition-colors"></div>
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-3">
            <CalendarRange className="w-5 h-5 text-purple-400" />
          </div>
          <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest group-hover:text-white transition-colors">Cuti</span>
        </button>
      </div>

      <div className="bg-[#2C2A29] rounded-3xl border border-neutral-800 p-5 relative overflow-hidden shadow-lg mt-6">
         <div className="flex items-center justify-between mb-4">
           <h4 className="text-xs font-bold text-white uppercase tracking-widest">Daftar Anggota Tim</h4>
           <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center">
             <span className="text-[10px] font-bold text-neutral-400">3</span>
           </div>
         </div>
         <div className="space-y-4">
           {/* dummy list based on previously available users response */}
           <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#C69C3D]/5 border border-[#C69C3D]/10">
             <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center border border-neutral-700">
               <span className="text-xs font-bold text-neutral-400">AY</span>
             </div>
             <div className="flex-1">
               <p className="text-sm font-bold text-white">Ayu Wira</p>
               <p className="text-[10px] text-[#C69C3D] uppercase tracking-widest">Staff</p>
             </div>
             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
           </div>

           <div className="flex items-center gap-4 p-3 rounded-2xl bg-neutral-800/30 border border-neutral-800/50">
             <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center border border-neutral-700">
               <span className="text-xs font-bold text-neutral-400">BI</span>
             </div>
             <div className="flex-1">
               <p className="text-sm font-bold text-white">Bitari Ratih</p>
               <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Staff</p>
             </div>
             <div className="w-2 h-2 rounded-full bg-neutral-600"></div>
           </div>

           <div className="flex items-center gap-4 p-3 rounded-2xl bg-[#C69C3D]/5 border border-[#C69C3D]/10">
             <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center border border-neutral-700">
               <span className="text-xs font-bold text-neutral-400">LW</span>
             </div>
             <div className="flex-1">
               <p className="text-sm font-bold text-white">Lanang Wisana</p>
               <p className="text-[10px] text-[#C69C3D] uppercase tracking-widest">Staff</p>
             </div>
             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
           </div>
         </div>
      </div>
    </div>
  );
}
