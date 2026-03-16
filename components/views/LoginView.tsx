import React from 'react';
import { Mail, Lock, Fingerprint } from 'lucide-react';
import { colors } from '@/lib/utils';

interface LoginViewProps {
  loginEmail: string;
  setLoginEmail: (v: string) => void;
  loginPassword: string;
  setLoginPassword: (v: string) => void;
  handleLogin: (e: React.FormEvent) => void;
  isLoading: boolean;
  isCheckingAuth: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({
  loginEmail, setLoginEmail, loginPassword, setLoginPassword, handleLogin, isLoading, isCheckingAuth
}) => {
  if (isCheckingAuth) return null;

  return (
    <section className="h-full w-full flex flex-col px-8 relative z-20 animate-in fade-in duration-500">
      <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[50%] bg-neutral-800/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[40%] bg-[#C69C3D]/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="flex-1 flex flex-col justify-center">
        {/* Havia Logo */}
        <div className="flex flex-col items-center mb-16">
          <img 
            src="/LogoHavia_primary1.png" 
            alt="Havia Logo" 
            className="w-48 h-auto object-contain opacity-90"
          />
          <div style={{ backgroundColor: colors.gold }} className="h-[1px] w-12 mt-4 mb-3"></div>
          <p className="text-[9px] text-neutral-500 tracking-[0.3em] uppercase">Enterprise App</p>
        </div>

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="text-neutral-500 w-5 h-5 group-focus-within:text-[#C69C3D] transition-colors" />
              </div>
              <input 
                type="email" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Enter Email..." 
                style={{ backgroundColor: colors.card, borderColor: colors.border }} 
                className="w-full text-neutral-900 text-sm rounded-xl focus:ring-1 focus:ring-[#C69C3D] focus:border-[#C69C3D] block pl-12 p-4 placeholder-neutral-400 transition-all border outline-none" 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="text-neutral-500 w-5 h-5 group-focus-within:text-[#C69C3D] transition-colors" />
              </div>
              <input 
                type="password" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter Password..." 
                style={{ backgroundColor: colors.card, borderColor: colors.border }} 
                className="w-full text-neutral-900 text-sm rounded-xl focus:ring-1 focus:ring-[#C69C3D] focus:border-[#C69C3D] block pl-12 p-4 placeholder-neutral-400 transition-all border outline-none" 
              />
            </div>
          </div>

          <button disabled={isLoading} type="submit" className={`w-full gold-gradient text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 mt-8 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            <Fingerprint className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
            <span className="uppercase tracking-widest text-xs">{isLoading ? 'CONNECTING...' : 'Login Application'}</span>
          </button>
        </form>
      </div>
      <div className="py-8 text-center">
        <p className="text-[9px] text-neutral-600 uppercase tracking-widest">Havia Studio & GampaWorks v3.5</p>
      </div>
    </section>
  );
};
