"use client";

import React, { useEffect, useState } from 'react';
import { PresensiView } from '@/components/views/PresensiView';
import { useTeamAttendance } from '@/hooks/useTeamAttendance';
import { useAuth } from '@/app/providers/AuthProvider';

export default function AttendancePage() {
  const { apiToken, userData, showToast } = useAuth();
  
  const {
    activeAttendance, lastFinishedAttendance, isSubmittingAttendance,
    handleAddAttendance, handleResetAttendance, loadActiveAttendance
  } = useTeamAttendance({ apiToken, userData, showToast });

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    if (apiToken) {
      loadActiveAttendance();
    }
    
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, [apiToken]);

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
