"use client";

import React, { useEffect, useState } from 'react';
import { DashboardView } from '@/components/views/DashboardView';
import { useAuth } from '@/app/providers/AuthProvider';

export default function DashboardPage() {
  const { userData } = useAuth();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // activeAttendance and notifications could be fetched here via a lighter hook
  // For now, pass empty or implement the hook later.
  return (
    <DashboardView 
      userData={userData}
      currentTime={currentTime}
      activeAttendance={null} // TODO: hook up attendance
      notifications={[]}      // TODO: hook up notifications
      unreadNotifCount={0}
    />
  );
}
