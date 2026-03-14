import React, { useState } from 'react';
import { Lock, ShieldCheck, Key } from 'lucide-react';
import { colors } from '@/lib/utils';
import { postToApi } from '@/app/actions';

interface ResetPasswordContentProps {
  apiToken: string;
  showToast: (msg: string) => void;
  onSuccess: () => void;
}

export const ResetPasswordContent: React.FC<ResetPasswordContentProps> = ({
  apiToken, showToast, onSuccess
}) => {
  const [form, setForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleReset = async () => {
    if (!form.current_password || !form.new_password || !form.confirm_password) {
      showToast('Semua field wajib diisi.');
      return;
    }
    if (form.new_password !== form.confirm_password) {
      showToast('Password baru tidak cocok.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await postToApi('haviacms/profile/reset_password', apiToken, form);
      if (res.success) {
        showToast('Password berhasil diganti! 🔐');
        onSuccess();
      } else {
        showToast(res.error || 'Gagal meriset password.');
      }
    } catch (e: any) {
      showToast('Terjadi kesalahan koneksi.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full text-white text-sm rounded-xl focus:ring-1 focus:ring-[#C69C3D] focus:border-[#C69C3D] block p-4 placeholder-neutral-600 transition-all border outline-none";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-neutral-900 border border-[#C69C3D]/20 flex items-center justify-center mb-4">
          <ShieldCheck className="w-10 h-10 text-[#C69C3D]" />
        </div>
        <h3 className="text-lg font-bold text-white tracking-wide">Ganti Password</h3>
        <p className="text-[10px] text-neutral-500 uppercase tracking-widest text-center mt-1 px-10">Amankan akun Anda dengan mengganti kata sandi secara berkala</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest flex items-center gap-2">
            <Key className="w-3 h-3" /> Password Saat Ini
          </label>
          <input 
            type="password" 
            value={form.current_password} 
            onChange={(e) => setForm({...form, current_password: e.target.value})} 
            placeholder="••••••••" 
            style={{ backgroundColor: colors.card, borderColor: colors.border }} 
            className={inputClass} 
          />
        </div>

        <div className="pt-4 space-y-4 border-t border-neutral-800/50">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Password Baru</label>
            <input 
              type="password" 
              value={form.new_password} 
              onChange={(e) => setForm({...form, new_password: e.target.value})} 
              placeholder="Minimal 6 karakter" 
              style={{ backgroundColor: colors.card, borderColor: colors.border }} 
              className={inputClass} 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 ml-1 uppercase tracking-widest">Konfirmasi Password Baru</label>
            <input 
              type="password" 
              value={form.confirm_password} 
              onChange={(e) => setForm({...form, confirm_password: e.target.value})} 
              placeholder="Ulangi password baru" 
              style={{ backgroundColor: colors.card, borderColor: colors.border }} 
              className={inputClass} 
            />
          </div>
        </div>
      </div>

      <div className="pt-6 space-y-3">
        <button 
          onClick={handleReset} 
          disabled={isSaving}
          className={`w-full gold-gradient text-black font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <Lock className="w-5 h-5" />
          <span className="uppercase tracking-widest text-xs">{isSaving ? 'MEMPROSES...' : 'Perbarui Password'}</span>
        </button>
      </div>
    </div>
  );
};
