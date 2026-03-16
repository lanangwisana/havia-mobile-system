import React from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import { colors } from '@/lib/utils';

// Import all content components
import { ProjectContent } from '../content/ProjectContent';
import { TaskList } from '../content/TaskList';
import { FinanceContent } from '../content/FinanceContent';
import { JadwalContent, EventDetailContent } from '../content/JadwalContent';
import { TimContent } from '../content/TimContent';
import { AbsensiContent } from '../content/AbsensiContent';
import { AkunContent } from '../content/AkunContent';
import { EditProfileContent } from '../content/EditProfileContent';
import { NotifikasiContent } from '../content/NotifikasiContent';
import { ResetPasswordContent } from '../content/ResetPasswordContent';
import { RiwayatPengajuanContent } from '../content/RiwayatPengajuanContent';

interface SubpageViewProps {
  subpageTitle: string;
  onNav: (view: string, nav?: string | null, title?: string) => void;
  // State from parent
  projects: any[];
  isLoadingProjects: boolean;
  projectTasks: any[];
  isLoadingTasks: boolean;
  activeProjectName: string;
  expenses: any[];
  isLoadingExpenses: boolean;
  events: any[];
  isLoadingEvents: boolean;
  selectedEvent: any;
  setSelectedEvent: (v: any) => void;
  attendances: any[];
  isLoadingAttendances: boolean;
  leaves: any[];
  isLoadingLeaves: boolean;
  notifications: any[];
  isLoadingNotif: boolean;
  userData: any;
  editForm: any;
  setEditForm: (v: any) => void;
  isSavingProfile: boolean;
  handleSaveProfile: () => void;
  onLogout: () => void;
  showToast: (msg: string) => void;
  newEvent: any;
  setNewEvent: (v: any) => void;
  handleCreateEvent: () => void;
  isSavingEvent: boolean;
  onProjectClick: (id: string, name: string) => void;
  projectPaginationMeta: any;
  onProjectPageChange: (page: number) => void;
  onProjectFilterChange: (status: string) => void;
  apiToken: string;
  onUploadImage: (file: File) => void;
  isUploadingImage: boolean;
  onDeleteImage: () => void;
  isDeletingImage: boolean;
  // Events Filtering
  eventLabels: any[];
  eventFilterType: string;
  setEventFilterType: (v: string) => void;
  eventFilterLabel: string;
  setEventFilterLabel: (v: string) => void;
  onOpenLeaveModal?: (type: 'izin' | 'cuti') => void;
}

export const SubpageView: React.FC<SubpageViewProps> = (props) => {
  const { subpageTitle, onNav } = props;

  const renderContent = () => {
    switch(subpageTitle) {
      case 'Project': 
        return <ProjectContent 
          projects={props.projects} 
          isLoadingProjects={props.isLoadingProjects} 
          onProjectClick={props.onProjectClick} 
          paginationMeta={props.projectPaginationMeta}
          onPageChange={props.onProjectPageChange}
          onFilterChange={props.onProjectFilterChange}
        />;
      case 'All Tasks': 
        return <TaskList 
          tasks={props.projectTasks} 
          isLoading={props.isLoadingTasks} 
          projects={props.projects} 
        />;
      case 'Tasks': 
        return <TaskList 
          tasks={props.projectTasks} 
          isLoading={props.isLoadingTasks} 
          projectName={props.activeProjectName} 
        />;
      case 'Finance': 
        return <FinanceContent 
          expenses={props.expenses} 
          isLoadingExpenses={props.isLoadingExpenses} 
        />;
      case 'Schedule': 
        return <JadwalContent 
          events={props.events} 
          isLoadingEvents={props.isLoadingEvents} 
          onEventClick={(ev) => {
            props.setSelectedEvent(ev);
            onNav('subpage', null, 'Event Detail');
          }} 
          onCreateEvent={() => {}}
          labels={props.eventLabels}
          filterType={props.eventFilterType}
          setFilterType={props.setEventFilterType}
          filterLabel={props.eventFilterLabel}
          setFilterLabel={props.setEventFilterLabel}
        />;
      case 'Team': 
        return <TimContent 
          onNav={onNav} 
          attendances={props.attendances} 
          isLoadingAttendances={props.isLoadingAttendances} 
          leaves={props.leaves}
          onOpenLeaveModal={props.onOpenLeaveModal}
        />;
      case 'Attendance': 
        return <AbsensiContent 
          attendances={props.attendances} 
          isLoadingAttendances={props.isLoadingAttendances} 
        />;
      case 'Event Detail': 
        return <EventDetailContent 
          selectedEvent={props.selectedEvent} 
          onBack={() => onNav('subpage', null, 'Schedule')} 
        />;
      case 'Account': 
        return <AkunContent 
          userData={props.userData} 
          onNav={onNav}
          onEditProfile={() => onNav('subpage', null, 'Edit Profile')} 
          onLogout={props.onLogout} 
          showToast={props.showToast} 
        />;
      case 'Edit Profile': 
        return <EditProfileContent 
          userData={props.userData} 
          editForm={props.editForm} 
          setEditForm={props.setEditForm} 
          handleSaveProfile={props.handleSaveProfile} 
          isSavingProfile={props.isSavingProfile} 
          onCancel={() => onNav('subpage', null, 'Account')} 
          onUploadImage={props.onUploadImage}
          isUploadingImage={props.isUploadingImage}
          onDeleteImage={props.onDeleteImage}
          isDeletingImage={props.isDeletingImage}
        />;
      case 'Notifications': 
        return <NotifikasiContent 
          isLoadingNotif={props.isLoadingNotif} 
          notifications={props.notifications} 
        />;
      case 'Reset Password':
        return <ResetPasswordContent 
          apiToken={props.apiToken}
          showToast={props.showToast}
          onSuccess={() => onNav('subpage', null, 'Account')}
        />;
      case 'Submission History':
        return <RiwayatPengajuanContent 
          leaves={props.leaves}
          isLoading={props.isLoadingLeaves}
        />;
      default: 
        return (
          <div className="flex flex-col items-center justify-center h-64 opacity-50 animate-in fade-in">
            <Info className="w-12 h-12 mb-4" style={{ color: colors.gold }} />
            <p className="text-center text-neutral-400 text-sm">Feature <strong className="text-neutral-900">{subpageTitle}</strong> is currently under development.</p>
          </div>
        );
    }
  };

  return (
    <section className="h-full w-full flex flex-col relative z-40 animate-in slide-in-from-right-4 duration-300 bg-white overflow-hidden">
      <div style={{ backgroundColor: `${colors.primary}FA` }} className="px-6 py-6 flex items-center justify-between border-b border-neutral-100 backdrop-blur-md sticky top-0 z-[70]">
        <button 
          onClick={() => {
            if (subpageTitle === 'Event Detail') {
              onNav('subpage', null, 'Schedule');
            } else if (subpageTitle === 'Attendance' || subpageTitle === 'Submission History') {
              onNav('subpage', null, 'Team');
            } else if (subpageTitle === 'Tasks') {
              // Rincian Task dari Project -> Kembali ke List Project
              onNav('subpage', 'project', 'Project');
            } else if (subpageTitle === 'All Tasks') {
              // Menu Task dari Dashboard -> Kembali ke Dashboard
              onNav('dashboard');
            } else {
              onNav('dashboard');
            }
          }} 
          style={{ backgroundColor: colors.card, borderColor: colors.border }} 
          className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-neutral-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-neutral-900" />
        </button>
        <h2 style={{ color: colors.gold }} className="font-bold text-sm uppercase tracking-widest">{subpageTitle}</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="flex-1 px-6 pt-6 pb-40 overflow-y-auto scrollbar-hide relative z-10">
        {renderContent()}
      </div>
    </section>
  );
};
