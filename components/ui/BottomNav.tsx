import React from 'react';
import { Home, Briefcase, Fingerprint, Calendar, User } from 'lucide-react';
import { colors } from '@/lib/utils';

interface BottomNavProps {
  activeNav: string;
  onNav: (view: string, nav?: string | null, title?: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeNav, onNav }) => {
  return (
    <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderColor: 'rgba(198, 156, 61, 0.1)' }} 
      className="fixed bottom-6 left-6 right-6 h-16 backdrop-blur-xl rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] z-50 flex items-center justify-around px-10 border animate-in slide-in-from-bottom-8">
      
      <button onClick={() => onNav('dashboard', 'home')} className={`flex flex-col items-center transition-colors p-2 ${activeNav === 'home' ? 'text-gold' : 'text-neutral-400 hover:text-dark'}`}>
        <Home className="w-7 h-7" strokeWidth={activeNav === 'home' ? 2.5 : 1.5} />
      </button>
      
      {/* Main FAB - Presensi */}
      <div className="relative -top-6">
        <button onClick={() => onNav('presensi', 'presensi')} className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center shadow-[0_15px_30px_rgba(198,156,61,0.3)] transform hover:scale-105 active:scale-95 transition-all rotate-45 group border-2 border-white">
          <div className="-rotate-45">
            <Fingerprint className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
        </button>
      </div>
      
      <button onClick={() => onNav('subpage', 'akun', 'Account')} className={`flex flex-col items-center transition-colors p-2 ${activeNav === 'akun' ? 'text-gold' : 'text-neutral-400 hover:text-dark'}`}>
        <User className="w-7 h-7" strokeWidth={activeNav === 'akun' ? 2.5 : 1.5} />
      </button>

    </div>
  );
};
