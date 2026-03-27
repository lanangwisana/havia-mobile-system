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
  const [errors, setErrors] = useState<{current_password?: string, new_password?: string, confirm_password?: string}>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleReset = async () => {
    const newErrors: typeof errors = {};
    
    if (!form.current_password) newErrors.current_password = 'Required';
    if (!form.new_password) newErrors.new_password = 'Required';
    if (!form.confirm_password) newErrors.confirm_password = 'Required';

    if (form.new_password && form.new_password.length < 6) {
      newErrors.new_password = 'Password must be at least 6 characters long.';
    }
    
    if (form.new_password && form.confirm_password && form.new_password !== form.confirm_password) {
      newErrors.confirm_password = 'New passwords do not match.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      const res = await postToApi('haviacms/profile/reset_password', apiToken, form);
      if (res.success) {
        setErrors({});
        showToast('Password successfully changed! 🔐');
        onSuccess();
      } else {
        const errStr = String(res.error || (res as any).message || '').toLowerCase();
        if (errStr.includes('current') || errStr.includes('incorrect')) {
          setErrors({ current_password: 'Current password is incorrect.' });
        } else {
          showToast(res.error || (res as any).message || 'Failed to reset password.');
        }
      }
    } catch (e: any) {
      showToast('Connection error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full text-neutral-900 text-sm rounded-xl focus:ring-1 focus:ring-[#C69C3D] focus:border-[#C69C3D] block p-4 placeholder-neutral-400 transition-all border outline-none";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-neutral-50 border border-[#C69C3D]/20 flex items-center justify-center mb-4">
          <ShieldCheck className="w-10 h-10 text-[#C69C3D]" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 tracking-wide">Change Password</h3>
        <p className="text-[10px] text-neutral-400 uppercase tracking-widest text-center mt-1 px-10">Secure your account by changing your password regularly</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 ml-1 uppercase tracking-widest flex items-center gap-2">
            <Key className="w-3 h-3" /> Current Password
          </label>
          <input 
            type="password" 
            value={form.current_password} 
            onChange={(e) => {
              setForm({...form, current_password: e.target.value});
              if (errors.current_password) setErrors({...errors, current_password: undefined});
            }} 
            placeholder="••••••••" 
            style={{ backgroundColor: colors.card, borderColor: errors.current_password ? '#ef4444' : colors.border }} 
            className={`${inputClass} ${errors.current_password ? 'focus:ring-red-500 focus:border-red-500' : ''}`} 
          />
          {errors.current_password && <p className="text-xs text-red-500 font-medium ml-1 mt-1 animate-in fade-in">{errors.current_password}</p>}
        </div>

        <div className="pt-4 space-y-4 border-t border-neutral-100">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 ml-1 uppercase tracking-widest">New Password</label>
            <input 
              type="password" 
              value={form.new_password} 
              onChange={(e) => {
                setForm({...form, new_password: e.target.value});
                if (errors.new_password) setErrors({...errors, new_password: undefined});
              }} 
              placeholder="Minimum 6 characters" 
              style={{ backgroundColor: colors.card, borderColor: errors.new_password ? '#ef4444' : colors.border }} 
              className={`${inputClass} ${errors.new_password ? 'focus:ring-red-500 focus:border-red-500' : ''}`} 
            />
            {errors.new_password && <p className="text-xs text-red-500 font-medium ml-1 mt-1 animate-in fade-in">{errors.new_password}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 ml-1 uppercase tracking-widest">Confirm New Password</label>
            <input 
              type="password" 
              value={form.confirm_password} 
              onChange={(e) => {
                setForm({...form, confirm_password: e.target.value});
                if (errors.confirm_password) setErrors({...errors, confirm_password: undefined});
              }} 
              placeholder="Repeat new password" 
              style={{ backgroundColor: colors.card, borderColor: errors.confirm_password ? '#ef4444' : colors.border }} 
              className={`${inputClass} ${errors.confirm_password ? 'focus:ring-red-500 focus:border-red-500' : ''}`} 
            />
            {errors.confirm_password && <p className="text-xs text-red-500 font-medium ml-1 mt-1 animate-in fade-in">{errors.confirm_password}</p>}
          </div>
        </div>
      </div>

      <div className="pt-6 space-y-3">
        <button 
          onClick={handleReset} 
          disabled={isSaving}
          className={`w-full gold-gradient text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all transform active:scale-[0.98] flex justify-center items-center gap-2 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          <Lock className="w-5 h-5" />
          <span className="uppercase tracking-widest text-xs">{isSaving ? 'PROCESSING...' : 'Update Password'}</span>
        </button>
      </div>
    </div>
  );
};
