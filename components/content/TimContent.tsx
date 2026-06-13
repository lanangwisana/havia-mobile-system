import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, History, Users, ArrowLeft, Loader2, Briefcase, DollarSign, CalendarRange, Info, Clock } from 'lucide-react';
import { colors, getUserImage, formatCurrency } from '@/lib/utils';
import { canSeeTeamDashboard } from '@/lib/permissions';
import { fetchFromApi } from '@/app/actions';
import { useRouter } from 'next/navigation';

interface TimContentProps {
  attendances: any[];
  isLoadingAttendances: boolean;
  leaves: any[];
  onOpenLeaveModal?: (type: 'izin' | 'cuti') => void;
  userData?: any;
  teamMembers?: any[];
  isLoadingTeam?: boolean;
}

export const TimContent: React.FC<TimContentProps> = ({ 
  attendances, 
  isLoadingAttendances, 
  leaves,
  onOpenLeaveModal,
  userData,
  teamMembers = [],
  isLoadingTeam = false
}) => {
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [memberSummary, setMemberSummary] = useState<any>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const router = useRouter();

  const adminMode = canSeeTeamDashboard(userData);

  useEffect(() => {
    if (!adminMode && userData?.id) {
      const loadMySummary = async () => {
        const cacheKey = `swr_havia_member_summary_${userData.id}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        let isUsingCache = false;

        if (cachedData) {
          try {
            setMemberSummary(JSON.parse(cachedData));
            isUsingCache = true;
          } catch (e) {}
        }

        if (!isUsingCache) {
          setIsLoadingSummary(true);
        }

        try {
          const token = localStorage.getItem('havia_token') || '';
          const res = await fetchFromApi(`haviacms/teams/summary/${userData.id}?_t=${Date.now()}`, token);
          if (res.success) {
            setMemberSummary(res.data);
            sessionStorage.setItem(cacheKey, JSON.stringify(res.data));
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingSummary(false);
        }
      };
      loadMySummary();
    }
  }, [adminMode, userData?.id]);

  const handleMemberClick = async (member: any) => {
    setSelectedMember(member);
    
    const cacheKey = `swr_havia_member_summary_${member.id}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    let isUsingCache = false;

    if (cachedData) {
      try {
        setMemberSummary(JSON.parse(cachedData));
        isUsingCache = true;
      } catch (e) {}
    } else {
      setMemberSummary(null);
    }

    if (!isUsingCache) {
      setIsLoadingSummary(true);
    }
    
    try {
      const token = localStorage.getItem('havia_token') || '';
      const res = await fetchFromApi(`haviacms/teams/summary/${member.id}?_t=${Date.now()}`, token);
      
      if (res.success) {
        setMemberSummary(res.data);
        sessionStorage.setItem(cacheKey, JSON.stringify(res.data));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  if (adminMode && selectedMember) {
    return (
      <div key="profile-view" className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-32">
        <div className="flex items-center gap-3 pl-1 mb-4">
          <button 
            onClick={() => setSelectedMember(null)}
            className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center hover:bg-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <h3 className="text-sm font-bold text-neutral-900 tracking-wide truncate">Member Profile</h3>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-tr from-[#F4EBD4]/90 via-white to-white rounded-[2.5rem] p-6 relative overflow-hidden shadow-[0_12px_35px_-10px_rgba(0,0,0,0.08)] border border-neutral-100 flex items-center gap-5">
          <img src={getUserImage(selectedMember)} alt={selectedMember.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm" />
          <div className="flex flex-col">
            <h2 className="text-xl font-black text-neutral-900 leading-tight">{selectedMember.name}</h2>
            <p className="text-[0.625rem] font-black uppercase tracking-[0.2em] text-[#C69C3D] mt-1">{selectedMember.role_title || selectedMember.job_title || 'TEAM MEMBER'}</p>
            {memberSummary?.biodata?.email && (
              <p className="text-[0.625rem] text-neutral-500 mt-1">{memberSummary.biodata.email}</p>
            )}
          </div>
        </div>

        {isLoadingSummary ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#C69C3D]" />
            <p className="text-xs text-neutral-400 mt-4 uppercase tracking-widest font-bold">Loading Data...</p>
          </div>
        ) : memberSummary ? (
          <div className="space-y-4">
            {/* Biodata / General Info */}
            <div className="bg-white border border-neutral-100 rounded-[2rem] p-6 shadow-sm flex flex-col gap-3">
               <h4 className="text-[0.6875rem] font-black text-neutral-900 uppercase tracking-widest mb-1">General Info</h4>
               <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                 {memberSummary.biodata.phone && (
                   <div className="flex flex-col">
                     <span className="text-[0.5625rem] font-bold text-neutral-400 uppercase tracking-widest">Phone</span>
                     <span className="text-xs font-medium text-neutral-900">{memberSummary.biodata.phone}</span>
                   </div>
                 )}
                 {memberSummary.biodata.alternative_phone && (
                   <div className="flex flex-col">
                     <span className="text-[0.5625rem] font-bold text-neutral-400 uppercase tracking-widest">Alt Phone</span>
                     <span className="text-xs font-medium text-neutral-900">{memberSummary.biodata.alternative_phone}</span>
                   </div>
                 )}
                 {memberSummary.biodata.dob && memberSummary.biodata.dob !== '0000-00-00' && (
                   <div className="flex flex-col">
                     <span className="text-[0.5625rem] font-bold text-neutral-400 uppercase tracking-widest">Date of Birth</span>
                     <span className="text-xs font-medium text-neutral-900">{memberSummary.biodata.dob}</span>
                   </div>
                 )}
                 {memberSummary.biodata.gender && (
                   <div className="flex flex-col">
                     <span className="text-[0.5625rem] font-bold text-neutral-400 uppercase tracking-widest">Gender</span>
                     <span className="text-xs font-medium text-neutral-900 capitalize">{memberSummary.biodata.gender}</span>
                   </div>
                 )}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-neutral-100 rounded-3xl p-5 flex flex-col items-center justify-center shadow-sm">
                <span className="text-[0.5625rem] text-neutral-400 font-bold uppercase tracking-widest mb-1 text-center">Total Pengajuan Cuti/Izin</span>
                <span className="text-3xl font-black text-neutral-900 leading-none">{memberSummary.total_leaves}</span>
              </div>
              <div className="bg-white border border-neutral-100 rounded-3xl p-5 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <DollarSign className="w-12 h-12 text-[#C69C3D]" />
                </div>
                <span className="text-[0.5625rem] text-neutral-400 font-bold uppercase tracking-widest mb-1 text-center relative z-10">Salary</span>
                <span className="text-base font-black text-[#C69C3D] leading-none relative z-10">{formatCurrency(memberSummary.total_salary)}</span>
                {memberSummary.salary_term && (
                  <span className="text-[0.5rem] font-bold text-neutral-400 uppercase tracking-widest relative z-10 mt-1">{memberSummary.salary_term}</span>
                )}
              </div>
            </div>

            <div className="bg-white border border-neutral-100 rounded-[2rem] p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-5">
                 <div className="w-8 h-8 rounded-xl bg-[#C69C3D]/10 flex items-center justify-center">
                   <Briefcase className="w-4 h-4 text-[#C69C3D]" />
                 </div>
                 <h4 className="text-[0.6875rem] font-black text-neutral-900 uppercase tracking-widest">Active Tasks</h4>
               </div>
               
               {memberSummary.active_tasks && memberSummary.active_tasks.length > 0 ? (
                 <div className="space-y-3">
                   {memberSummary.active_tasks.map((task: any) => (
                     <div key={task.id} className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col gap-2">
                       <span className="text-[0.625rem] font-bold text-[#C69C3D] uppercase tracking-widest leading-none">{task.project_title || 'Unknown Project'}</span>
                       <span className="text-sm font-black text-neutral-900 leading-tight">{task.title}</span>
                       <div className="flex items-center gap-2 mt-1">
                         {task.deadline && (
                           <span className="text-[0.625rem] font-bold text-red-500 uppercase tracking-widest flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md">
                             <Clock className="w-3 h-3" />
                             {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                           </span>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="text-center py-6 text-neutral-400 text-xs font-medium">No active tasks currently.</div>
               )}
            </div>
          </div>
        ) : (
           <div className="text-center py-10 text-neutral-400">Failed to load member data.</div>
        )}
      </div>
    );
  }

  return (
    <div key="list-view" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300 pb-32">
      <div className="flex items-center justify-between pl-1">
        <h3 className="text-sm font-bold text-neutral-900 tracking-wide">
          {adminMode ? 'Team Management' : 'My Attendance'}
        </h3>
      </div>
      
      {/* Create Submission (Available for ALL roles) */}
      <button 
        onClick={() => onOpenLeaveModal?.('izin')}
        className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-[#C69C3D] to-[#D4A848] rounded-[2rem] hover:opacity-90 transition-all group active:scale-[0.98] shadow-[0_12px_30px_-10px_rgba(198,156,61,0.4)]"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col items-start leading-tight">
            <span className="text-xs font-black text-white uppercase tracking-widest">Create Submission</span>
            <span className="text-[0.625rem] font-bold text-white/80 tracking-widest">Leave / Permission</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md group-hover:bg-white/30 transition-colors">
          <ChevronRight className="w-5 h-5 text-white transition-colors" />
        </div>
      </button>

      {adminMode ? (
        // ================= ADMIN VIEW: TEAM MEMBERS LIST =================
        <div className="space-y-4">
          <h4 className="text-[0.6875rem] font-black text-neutral-500 uppercase tracking-[0.2em] px-1">All Members</h4>
          {isLoadingTeam ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-neutral-400" /></div>
          ) : teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {teamMembers.map(member => (
                <div 
                  key={member.id} 
                  onClick={() => handleMemberClick(member)}
                  className="bg-white p-4 rounded-3xl border border-neutral-100 flex items-center justify-between shadow-sm hover:border-[#C69C3D]/30 cursor-pointer active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <img src={getUserImage(member)} alt={member.name} className="w-12 h-12 rounded-full object-cover bg-neutral-100" />
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-neutral-900">{member.name}</span>
                      <span className="text-[0.5625rem] font-bold text-[#C69C3D] uppercase tracking-widest mt-0.5">
                        {member.role_title || member.job_title || 'Member'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-neutral-300" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-neutral-400">No members found.</div>
          )}
        </div>
      ) : (
        // ================= STAFF VIEW: MY ATTENDANCE =================
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-neutral-100 rounded-3xl p-5 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                 <CalendarRange className="w-24 h-24 text-neutral-900" />
               </div>
               <span className="text-[0.5625rem] text-neutral-400 font-bold uppercase tracking-widest mb-2 text-center relative z-10">Total Pengajuan Cuti / Izin</span>
               <div className="flex items-end gap-1 relative z-10">
                 <span className="text-[2.5rem] font-black text-neutral-900 leading-none">
                   {leaves.filter(l => l.status === 'approved').reduce((acc, l) => acc + parseFloat(l.total_days || 0), 0)}
                 </span>
               </div>
            </div>

            <div className="bg-white border border-neutral-100 rounded-3xl p-5 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <DollarSign className="w-12 h-12 text-[#C69C3D]" />
              </div>
              <span className="text-[0.5625rem] text-neutral-400 font-bold uppercase tracking-widest mb-1 text-center relative z-10">Salary</span>
              {isLoadingSummary ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#C69C3D] relative z-10 mt-2" />
              ) : (
                <>
                  <span className="text-base font-black text-[#C69C3D] leading-none relative z-10 text-center">{formatCurrency(memberSummary?.total_salary || 0)}</span>
                  {memberSummary?.salary_term && (
                    <span className="text-[0.5rem] font-bold text-neutral-400 uppercase tracking-widest relative z-10 mt-1">{memberSummary.salary_term}</span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="px-1 pt-4">
            <button 
              onClick={() => router.push('/team/leaves')}
              className="w-full flex items-center justify-between p-4 bg-neutral-50 border border-neutral-100 rounded-2xl hover:border-neutral-200 transition-all active:scale-[0.98] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-neutral-200 flex items-center justify-center shadow-sm">
                  <History className="w-4 h-4 text-neutral-600" />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[0.625rem] font-black text-neutral-900 uppercase tracking-widest">View History</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[0.5rem] font-black text-neutral-400 uppercase tracking-widest transition-all group-hover:text-[#C69C3D]">Detail</span>
                <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-[#C69C3D]" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
