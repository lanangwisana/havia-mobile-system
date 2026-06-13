import { useState } from 'react';
import { fetchFromApi, postToApi, deleteFromApi } from '@/app/actions';
import { isAdmin } from '@/lib/permissions';

interface UseTeamAttendanceProps {
  apiToken: string;
  userData: any;
  showToast: (msg: string) => void;
}

export function useTeamAttendance({ apiToken, userData, showToast }: UseTeamAttendanceProps) {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [isLoadingAttendances, setIsLoadingAttendances] = useState(false);
  const [activeAttendance, setActiveAttendance] = useState<any | null>(null);
  const [lastFinishedAttendance, setLastFinishedAttendance] = useState<any | null>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [isLoadingLeaveTypes, setIsLoadingLeaveTypes] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveModalType, setLeaveModalType] = useState<'izin' | 'cuti'>('izin');
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

  const loadLeaves = async () => {
    if (!apiToken) return;
    const cacheKey = 'swr_havia_leaves';
    const cachedData = sessionStorage.getItem(cacheKey);
    let isUsingCache = false;

    if (cachedData) {
      try {
        setLeaves(JSON.parse(cachedData));
        isUsingCache = true;
      } catch (e) {}
    }

    if (!isUsingCache) {
      setIsLoadingLeaves(true);
    }

    const res = await fetchFromApi('haviacms/leaves', apiToken);
    if (res.success) {
      const data = Array.isArray(res.data) ? res.data : [];
      setLeaves(data);
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    }
    setIsLoadingLeaves(false);
  };

  const loadTeamMembers = async () => {
    if (!apiToken || !isAdmin(userData)) return;
    const cacheKey = 'swr_havia_teams';
    const cachedData = sessionStorage.getItem(cacheKey);
    let isUsingCache = false;

    if (cachedData) {
      try {
        setTeamMembers(JSON.parse(cachedData));
        isUsingCache = true;
      } catch (e) {}
    }

    if (!isUsingCache) {
      setIsLoadingTeam(true);
    }

    const res = await fetchFromApi(`haviacms/teams?_t=${Date.now()}`, apiToken);
    if (res.success) {
      const data = Array.isArray(res.data) ? res.data : [];
      setTeamMembers(data);
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    }
    setIsLoadingTeam(false);
  };

  const loadLeaveTypes = async () => {
    if (!apiToken) return;
    const cacheKey = 'swr_havia_leave_types';
    const cachedData = sessionStorage.getItem(cacheKey);
    let isUsingCache = false;

    if (cachedData) {
      try {
        setLeaveTypes(JSON.parse(cachedData));
        isUsingCache = true;
      } catch (e) {}
    }

    if (!isUsingCache) {
      setIsLoadingLeaveTypes(true);
    }

    const res = await fetchFromApi('haviacms/leave_types', apiToken);
    if (res.success) {
      const data = Array.isArray(res.data) ? res.data : [];
      setLeaveTypes(data);
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    }
    setIsLoadingLeaveTypes(false);
  };

  const handleLeaveSubmit = async (data: any) => {
    if (!apiToken) return;
    setIsSubmittingLeave(true);
    const res = await postToApi('haviacms/leaves', apiToken, data);
    if (res.success) {
      showToast("Submission sent successfully!");
      setIsLeaveModalOpen(false);
      loadLeaves();
    } else {
      showToast(`Failed: ${(res as any).message || (res as any).error}`);
    }
    setIsSubmittingLeave(false);
  };

  const loadAttendances = async () => {
    if (!userData?.id || !apiToken) return;
    setIsLoadingAttendances(true);
    // Pakai API haviacms yang baru agar lebih akurat
    const res = await fetchFromApi(`haviacms/attendance`, apiToken);
    if (res.success) {
      const data = Array.isArray(res.data) ? res.data : [];
      // Pastikan urutan terbaru di atas
      data.sort((a: any, b: any) => parseInt(b.id) - parseInt(a.id));
      setAttendances(data);
      
      // Cari yang statusnya masih aktif (belum ada jam keluar valid)
      const active = data.find((att: any) => {
        const isStatusActive = att.status === 'incomplete';
        const isOutTimeEmpty = !att.out_time || 
                               att.out_time.startsWith('0000') || 
                               att.out_time.startsWith('-0001');
        return isStatusActive || (att.status === 'pending' && isOutTimeEmpty);
      });
      setActiveAttendance(active || null);
      
      // AUTO-HEAL: Jika record aktif memiliki junk data (0000-00-00), langsung HAPUS dari server
      if (active && (active.out_time?.startsWith('0000') || active.out_time?.startsWith('-0001'))) {
        console.log("Rogue record detected! Auto-healing by deletion...");
        (async () => {
          const res = await deleteFromApi(`attendance/${active.id}`, apiToken);
          if (res.success) {
            console.log("Rogue record deleted successfully.");
            loadAttendances();
          }
        })();
      }

      // Cari record terakhir yang benar-benar sudah selesai (Clock Out valid)
      const lastFinished = data.find((att: any) => {
        const hasOutTime = att.out_time && 
                           !att.out_time.startsWith('0000') && 
                           !att.out_time.startsWith('-0001');
        return hasOutTime;
      });
      setLastFinishedAttendance(lastFinished || null);
    }
    setIsLoadingAttendances(false);
  };

  const loadActiveAttendance = () => {
    loadAttendances();
  };

  const handleResetAttendance = async () => {
    if (!apiToken || !activeAttendance) return;
    try {
      const res = await deleteFromApi(`attendance/${activeAttendance.id}`, apiToken);
      if (res.success) {
        setActiveAttendance(null);
        showToast('Attendance Reset. You can Clock In now.');
        loadAttendances();
      } else {
        showToast('Failed to reset attendance.');
      }
    } catch (e) {
      showToast('Error connecting to server.');
    }
  };

  const handleAddAttendance = async () => {
    if (!apiToken) return;
    setIsSubmittingAttendance(true);

    if (activeAttendance) {
      // CLOCK OUT
      const isJunk = !activeAttendance.out_time || 
                     activeAttendance.out_time.startsWith('0000') || 
                     activeAttendance.out_time.startsWith('-0001');

      if (isJunk) {
        showToast('Corrupted data detected, cleaning Brain... 🧹');
        const delRes = await deleteFromApi(`attendance/${activeAttendance.id}`, apiToken);
        if (delRes.success) {
          setActiveAttendance(null);
          loadAttendances();
          showToast('Havia Brain Cleaned! Please Clock In again. ✨');
        } else {
          showToast('Failed to clean corrupted data.');
        }
        setIsSubmittingAttendance(false);
        return;
      }

      // Proses normal CLOCK OUT (Update)
      try {
        const url = `https://brain.havia.id/index.php/api/haviacms/attendance/${activeAttendance.id}`;
        const res = await fetch(url, {
          method: 'PUT',
          headers: {
            'authtoken': apiToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({}),
          cache: 'no-store'
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          showToast('Clocked Out Successfully!');
          setActiveAttendance(null);
          loadAttendances();
        } else {
          showToast(`Clock Out Failed: ${data.message || data.error || 'Server rejected the out time'}`);
        }
      } catch (e) {
        showToast('Connection error during Clock Out');
      }

    } else {
      // CLOCK IN
      try {
        const url = `https://brain.havia.id/index.php/api/haviacms/attendance`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'authtoken': apiToken,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ note: "Clock In via Mobile" }),
          cache: 'no-store'
        });
        const data = await res.json();
        
        if (res.ok && data.success) {
          showToast('Clocked In Successfully!');
          loadAttendances();
        } else {
          showToast(`Clock In Failed: ${data.message || data.error || 'Server error'}`);
        }
      } catch (e) {
        showToast('Connection error during Clock In');
      }
    }
    
    setIsSubmittingAttendance(false);
  };

  return {
    attendances, setAttendances,
    isLoadingAttendances,
    activeAttendance, setActiveAttendance,
    lastFinishedAttendance, setLastFinishedAttendance,
    leaves, setLeaves,
    isLoadingLeaves,
    teamMembers, setTeamMembers,
    isLoadingTeam,
    leaveTypes, setLeaveTypes,
    isLoadingLeaveTypes,
    isLeaveModalOpen, setIsLeaveModalOpen,
    leaveModalType, setLeaveModalType,
    isSubmittingLeave, setIsSubmittingLeave,
    isSubmittingAttendance, setIsSubmittingAttendance,
    loadLeaves,
    loadTeamMembers,
    loadLeaveTypes,
    handleLeaveSubmit,
    loadAttendances,
    loadActiveAttendance,
    handleAddAttendance,
    handleResetAttendance
  };
}
