"use client";

import React, { useEffect, useState } from 'react';
import { PresensiView } from '@/components/views/PresensiView';
import { useClocking } from '@/hooks/useClocking';
import { useAuth } from '@/app/providers/AuthProvider';

export default function AttendancePage() {
  const { apiToken, userData, showToast } = useAuth();
  
  const {
    activeAttendance, lastFinishedAttendance, isSubmittingAttendance,
    handleAddAttendance, handleResetAttendance, loadActiveAttendance
  } = useClocking({ apiToken, userData, showToast });

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    if (apiToken) {
      loadActiveAttendance();
    }
  }, [apiToken]); // load data on mount or token change

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      
      if (activeAttendance?.in_time) {
        try {
          const inTimeStr = activeAttendance.in_time.replace(' ', 'T') + 'Z';
          const inTime = new Date(inTimeStr);
          if (!isNaN(inTime.getTime())) {
            const diffMs = Math.max(0, now.getTime() - inTime.getTime());
            const diffSecs = Math.floor(diffMs / 1000);
            const hours = Math.floor(diffSecs / 3600).toString().padStart(2, '0');
            const minutes = Math.floor((diffSecs % 3600) / 60).toString().padStart(2, '0');
            const seconds = (diffSecs % 60).toString().padStart(2, '0');
            setCurrentTime(`${hours}:${minutes}:${seconds}`);
            return;
          }
        } catch (e) {}
      }

      // Jika belum clock-in, tampilkan 00:00:00
      setCurrentTime('00:00:00');
    }, 1000);
    return () => clearInterval(timer);
  }, [activeAttendance]);

  return (
    <PresensiView 
      currentTime={currentTime}
      handleAddAttendance={handleAddAttendance}
      handleResetAttendance={handleResetAttendance}
      isSubmittingAttendance={isSubmittingAttendance}
      activeAttendance={activeAttendance}
      lastFinishedAttendance={lastFinishedAttendance}
    />
  );
}
