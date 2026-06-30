"use client";

import React, { useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { TimContent } from '@/components/content/TimContent';
import { useClocking } from '@/hooks/useClocking';
import { useLeaves } from '@/hooks/useLeaves';
import { useTeam } from '@/hooks/useTeam';
import { useAuth } from '@/app/providers/AuthProvider';
import { canSeeTeamDashboard } from '@/lib/permissions';
import { LeaveModal } from '@/components/ui/LeaveModal';

export default function TeamPage() {
  const { apiToken, userData, showToast } = useAuth();
  
  const {
    attendances, isLoadingAttendances, loadAttendances
  } = useClocking({ apiToken, userData, showToast });

  const {
    leaves, isLoadingLeaves, loadLeaves,
    leaveTypes, loadLeaveTypes,
    isLeaveModalOpen, setIsLeaveModalOpen,
    leaveModalType, setLeaveModalType,
    isSubmittingLeave, handleLeaveSubmit
  } = useLeaves({ apiToken, showToast });

  const {
    teamMembers, isLoadingTeam, loadTeamMembers
  } = useTeam({ apiToken, userData });

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
