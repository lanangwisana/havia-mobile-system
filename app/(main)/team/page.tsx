"use client";

import React, { useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { TimContent } from '@/components/content/TimContent';
import { useTeamAttendance } from '@/hooks/useTeamAttendance';
import { useAuth } from '@/app/providers/AuthProvider';
import { canSeeTeamDashboard } from '@/lib/permissions';
import { LeaveModal } from '@/components/ui/LeaveModal';

export default function TeamPage() {
  const { apiToken, userData, showToast } = useAuth();
  
  const {
    attendances, isLoadingAttendances, loadAttendances,
    leaves, isLoadingLeaves, loadLeaves,
    teamMembers, isLoadingTeam, loadTeamMembers,
    leaveTypes, loadLeaveTypes,
    isLeaveModalOpen, setIsLeaveModalOpen,
    leaveModalType, setLeaveModalType,
    isSubmittingLeave, handleLeaveSubmit
  } = useTeamAttendance({ apiToken, userData, showToast });

  useEffect(() => {
    if (apiToken) {
      loadAttendances();
      loadLeaves();
      loadLeaveTypes();
      if (canSeeTeamDashboard(userData)) loadTeamMembers();
    }
  }, [apiToken, userData]);

  return (
    <PageWrapper title={canSeeTeamDashboard(userData) ? "Teams" : "Attendance"} backRoute="/dashboard">
      <TimContent 
        attendances={attendances}
        isLoadingAttendances={isLoadingAttendances}
        leaves={leaves}
        onOpenLeaveModal={(type) => {
          setLeaveModalType(type);
          setIsLeaveModalOpen(true);
        }}
        userData={userData}
        teamMembers={teamMembers}
        isLoadingTeam={isLoadingTeam}
      />
      
      <LeaveModal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        leaveTypes={leaveTypes}
        type={leaveModalType}
        isSubmitting={isSubmittingLeave}
        onSubmit={handleLeaveSubmit}
      />
    </PageWrapper>
  );
}
