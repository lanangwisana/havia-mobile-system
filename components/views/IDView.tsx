import React from 'react';
import { ArrowLeft, Sparkles, QrCode } from 'lucide-react';
import { colors, getUserImage } from '@/lib/utils';

interface IDViewProps {
  userData: any;
  onNav: (view: string) => void;
}

export const IDView: React.FC<IDViewProps> = ({ userData, onNav }) => {
  return (
    <section className="h-full w-full flex flex-col relative z-40 animate-in slide-in-from-right-4 duration-300">
      <div style={{ backgroundColor: `${colors.bg}FA` }} className="px-6 py-6 flex items-center relative border-b border-neutral-200/50 backdrop-blur-md">
        <button onClick={() => onNav('dashboard')} style={{ backgroundColor: colors.card, borderColor: colors.border }} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-neutral-100 transition-colors z-20">
          <ArrowLeft className="w-5 h-5 text-neutral-900" />
        </button>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div style={{ color: colors.gold }} className="flex items-center gap-2">
            <Sparkles className="w-3 h-3" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase">Digital ID</span>
          </div>
          <p className="text-[9px] text-neutral-500 mt-1 uppercase tracking-widest">Havia Enterprise</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-8 pb-20">
        <div style={{ backgroundColor: colors.cream }} className="w-full rounded-[2.5rem] p-8 border border-neutral-200 relative overflow-hidden shadow-xl">
          <div className="absolute -right-8 -bottom-12 text-[180px] font-display font-bold text-neutral-900/[0.03] pointer-events-none select-none leading-none">H</div>
  
          <div className="flex justify-between items-start mb-10 relative z-10">
            <div className="flex flex-col">
              <h3 className="font-bold text-lg text-dark tracking-[0.2em] uppercase flex items-center leading-none">
                HA<span className="text-gold">V</span>IA
              </h3>
              <span className="text-[8px] text-neutral-500 uppercase tracking-[0.3em] mt-1 font-medium">Studio</span>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
          </div>


          <div className="flex flex-col items-center mb-10 relative z-10">
            <div className="relative w-36 h-36 mb-6">
              <div className="absolute inset-0 rounded-full avatar-glow"></div>
              <div className="absolute inset-[3px] rounded-full bg-white z-10 flex items-center justify-center overflow-hidden">
                <img src={getUserImage(userData)} className="w-full h-full object-cover" alt={userData?.first_name || "User"} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2 tracking-wide text-center">{userData?.first_name} {userData?.last_name}</h2>
            <span style={{ color: colors.gold }} className="text-[10px] font-bold uppercase tracking-[0.3em]">{userData?.job_title || 'TEAM MEMBER'}</span>
          </div>

          <div className="flex justify-center mb-10 relative z-10">
            <div className="bg-white p-3 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <QrCode className="w-20 h-20 text-black" strokeWidth={1.5} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-neutral-200 pt-6 relative z-10">
            <div>
              <p className="text-[9px] text-neutral-400 uppercase tracking-widest mb-1">ID Number</p>
              <p className="text-sm font-mono text-neutral-900 tracking-wider">HAV-882910</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-neutral-400 uppercase tracking-widest mb-1">Valid Until</p>
              <p className="text-sm font-mono text-neutral-900 tracking-wider">12/30</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
