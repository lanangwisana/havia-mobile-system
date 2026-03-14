import React, { useState } from 'react';
import { Lock, Save, X, Eye, EyeOff } from 'lucide-react';
import { colors } from '@/lib/utils';

interface ResetPasswordContentProps {
  onSave: (password: string) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export const ResetPasswordContent: React.FC<ResetPasswordContentProps> = ({
  onSave, onCancel, isSaving
}) => {
  const [password, setPassword] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const inputClass = "w-full px-5 py-4 rounded-2xl border bg-neutral-900 border-neutral-800 text-white text-sm focus:border-[#C69C3D]/50 focus:ring-1 focus:ring-[#C69C3D]/20 outline-none transition-all placeholder:text-neutral-600";

  const handleProcess = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password || !retypePassword) {
      setError('Semua field wajib diisi.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    if (password !== retypePassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    onSave(password);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex flex-col items-center justify-center p-8 bg-[#C69C3D]/5 rounded-3xl border border-[#C69C3D]/10">
        <div className="w-16 h-16 rounded-2xl bg-[#C69C3D]/10 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-[#C69C3D]" />
        </div>
        <h3 className="text-white font-bold text-lg">Reset Password</h3>
        <p className="text-xs text-neutral-500 text-center mt-2 px-4 leading-relaxed">
          Gunakan minimal 6 karakter kombinasi huruf dan angka untuk keamanan maksimal.
        </p>
      </div>

      <form onSubmit={handleProcess} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Password Baru</label>
          <div className="relative">
            <input 
              type={showPass ? "text" : "password"} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Minimal 6 karakter..." 
              className={inputClass} 
            />
            <button 
              type="button" 
              onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white"
            >
              {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Ulangi Password Baru</label>
          <input 
            type={showPass ? "text" : "password"} 
            value={retypePassword} 
            onChange={(e) => setRetypePassword(e.target.value)} 
            placeholder="Ketik ulang password..." 
            className={inputClass} 
          />
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider text-center">
            ⚠️ {error}
          </div>
        )}

        <div className="flex flex-col gap-3 pt-4">
          <button 
            type="submit" 
            disabled={isSaving}
            className={`w-full py-4 rounded-2xl gold-gradient text-black font-bold text-sm shadow-xl shadow-[#C69C3D]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
            ) : (
              <>
                <Save className="w-5 h-5" />
                SIMPAN PASSWORD
              </>
            )}
          </button>
          
          <button 
            type="button" 
            onClick={onCancel}
            disabled={isSaving}
            className="w-full py-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 font-bold text-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:bg-neutral-800 hover:text-white"
          >
            <X className="w-5 h-5" />
            BATAL
          </button>
        </div>
      </form>
    </div>
  );
};
