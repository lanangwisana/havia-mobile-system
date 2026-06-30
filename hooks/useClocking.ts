import { useState } from 'react';
import { fetchFromApi, deleteFromApi } from '@/app/actions';

interface UseClockingProps {
  apiToken: string;
  userData: any;
  showToast: (msg: string) => void;
}

export function useClocking({ apiToken, userData, showToast }: UseClockingProps) {
  const [attendances, setAttendances] = useState<any[]>([]);
  const [isLoadingAttendances, setIsLoadingAttendances] = useState(false);
  const [activeAttendance, setActiveAttendance] = useState<any | null>(null);
  const [lastFinishedAttendance, setLastFinishedAttendance] = useState<any | null>(null);
  const [isSubmittingAttendance, setIsSubmittingAttendance] = useState(false);

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
    isSubmittingAttendance, setIsSubmittingAttendance,
    loadAttendances,
    loadActiveAttendance,
    handleAddAttendance,
    handleResetAttendance
  };
}
