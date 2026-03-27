import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';

interface LeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  leaveTypes: any[];
  type: 'izin' | 'cuti';
  isSubmitting: boolean;
}

export const LeaveModal: React.FC<LeaveModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  leaveTypes, 
  type,
  isSubmitting 
}) => {
  const [formData, setFormData] = useState({
    leave_type_id: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: ''
  });

  useEffect(() => {
    if (isOpen) {
      // Auto select first relevant type
      const relevantType = leaveTypes.find(t => {
        const title = t.title.toLowerCase();
        if (type === 'cuti') {
          return title === 'cuti' || title.includes('cuti') || title.includes('leave');
        } else {
          return title === 'izin' || title.includes('izin') || (!title.includes('cuti') && !title.includes('leave'));
        }
      });
      if (relevantType) {
        setFormData(prev => ({ ...prev, leave_type_id: relevantType.id }));
      }
    }
  }, [isOpen, type, leaveTypes]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white border-t sm:border border-neutral-100 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-full duration-500">
        <div className="p-6 pb-20 sm:pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center border bg-[#C69C3D]/10 border-[#C69C3D]/20 text-[#C69C3D]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-neutral-900 uppercase tracking-wider">
                  Submission
                </h3>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Complete the data below</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Leave Type */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] ml-1">Submission Type</label>
              <div className="relative">
                <select
                  required
                  value={formData.leave_type_id}
                  onChange={(e) => setFormData({ ...formData, leave_type_id: e.target.value })}
                  className="w-full appearance-none bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-4 text-sm text-neutral-900 focus:outline-none focus:border-[#C69C3D] transition-all"
                >
                  <option value="" disabled>Select Type</option>
                  {leaveTypes.map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] ml-1">Start Date</label>
                <input
                  type="date"
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-4 text-sm text-neutral-900 focus:outline-none focus:border-[#C69C3D] transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] ml-1">End Date</label>
                <input
                  type="date"
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-4 text-sm text-neutral-900 focus:outline-none focus:border-[#C69C3D] transition-all"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] ml-1">Reason / Description</label>
              <textarea
                required
                rows={3}
                placeholder="Explain the reason for your submission..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-100 rounded-2xl px-4 py-4 text-sm text-neutral-900 focus:outline-none focus:border-[#C69C3D] transition-all resize-none placeholder:text-neutral-400"
              />
            </div>

            {/* Info Box */}
            <div className="flex gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-[10px] text-neutral-500 leading-relaxed font-medium">
                Submission will be sent to HRD/Admin for review.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 ${
                isSubmitting 
                  ? 'bg-neutral-800 text-neutral-500' 
                  : 'bg-[#C69C3D] text-[#0A0A0A] hover:bg-[#D4A848] active:scale-[0.98] shadow-[0_10px_30px_-10px_rgba(198,156,61,0.3)]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
