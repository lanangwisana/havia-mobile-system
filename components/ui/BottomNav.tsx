import React from 'react';
import { Home, Briefcase, Fingerprint, Calendar, User } from 'lucide-react';
import { colors } from '@/lib/utils';

interface BottomNavProps {
  activeNav: string;
  onNav: (view: string, nav?: string | null, title?: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeNav, onNav }) => {
  return (
    <div style={{ backgroundColor: 'rgba(23, 23, 23, 0.95)', borderColor: colors.border }} 
      className="fixed bottom-6 left-6 right-6 h-16 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 flex items-center justify-between px-6 border animate-in slide-in-from-bottom-8">
      
      <button onClick={() => onNav('dashboard', 'home')} className={`flex flex-col items-center transition-colors p-2 ${activeNav === 'home' ? 'text-[#C69C3D]' : 'text-neutral-500 hover:text-white'}`}>
        <Home className="w-6 h-6" strokeWidth={activeNav === 'home' ? 2.5 : 1.5} />
      </button>
      
      <button onClick={() => onNav('subpage', 'project', 'Project')} className={`flex flex-col items-center transition-colors p-2 ${activeNav === 'project' ? 'text-[#C69C3D]' : 'text-neutral-500 hover:text-white'}`}>
        <Briefcase className="w-6 h-6" strokeWidth={activeNav === 'project' ? 2.5 : 1.5} />
      </button>
      
      {/* Main FAB - Presensi */}
      <div className="relative -top-6">
        <button onClick={() => onNav('presensi', 'presensi')} className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)] transform hover:scale-105 active:scale-95 transition-all rotate-45 group border-2 border-[#0a0a0a]">
          <div className="-rotate-45">
            <Fingerprint className="w-7 h-7 text-black" strokeWidth={2} />
          </div>
        </button>
      </div>
      
      <button onClick={() => onNav('subpage', 'jadwal', 'Jadwal')} className={`flex flex-col items-center transition-colors p-2 ${activeNav === 'jadwal' ? 'text-[#C69C3D]' : 'text-neutral-500 hover:text-white'}`}>
        <Calendar className="w-6 h-6" strokeWidth={activeNav === 'jadwal' ? 2.5 : 1.5} />
      </button>
      
      <button onClick={() => onNav('subpage', 'akun', 'Akun')} className={`flex flex-col items-center transition-colors p-2 ${activeNav === 'akun' ? 'text-[#C69C3D]' : 'text-neutral-500 hover:text-white'}`}>
        <User className="w-6 h-6" strokeWidth={activeNav === 'akun' ? 2.5 : 1.5} />
      </button>
    </div>
  );
};
