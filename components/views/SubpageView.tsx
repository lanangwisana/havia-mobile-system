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
import { ResetPasswordContent } from '../content/ResetPasswordContent';
import { NotifikasiContent } from '../content/NotifikasiContent';

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
  isResettingPassword: boolean;
  handleResetPassword: (password: string) => void;
  onLogout: () => void;
  showToast: (msg: string) => void;
  newEvent: any;
  setNewEvent: (v: any) => void;
  handleCreateEvent: () => void;
  isSavingEvent: boolean;
  onProjectClick: (id: string, name: string) => void;
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
        />;
      case 'Semua Task': 
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
      case 'Jadwal': 
        return <JadwalContent 
          events={props.events} 
          isLoadingEvents={props.isLoadingEvents} 
          onEventClick={(ev) => {
            props.setSelectedEvent(ev);
            onNav('subpage', null, 'Detail Event');
          }} 
          onCreateEvent={() => {}}
        />;
      case 'Tim': 
        return <TimContent 
          onNav={onNav} 
          attendances={props.attendances} 
          isLoadingAttendances={props.isLoadingAttendances} 
          leaves={props.leaves}
        />;
      case 'Absensi': 
        return <AbsensiContent 
          attendances={props.attendances} 
          isLoadingAttendances={props.isLoadingAttendances} 
        />;
      case 'Detail Event': 
        return <EventDetailContent 
          selectedEvent={props.selectedEvent} 
          onBack={() => onNav('subpage', null, 'Jadwal')} 
        />;
      case 'Akun': 
        return <AkunContent 
          userData={props.userData} 
          onEditProfile={() => {
            props.setEditForm({
              first_name: props.userData?.first_name || '',
              last_name: props.userData?.last_name || '',
              job_title: props.userData?.job_title || '',
              phone: props.userData?.phone || '',
              address: props.userData?.address || '',
              gender: props.userData?.gender || 'male',
            });
            onNav('subpage', null, 'Edit Profile');
          }} 
          onResetPassword={() => onNav('subpage', null, 'Reset Password')}
          onLogout={props.onLogout} 
          showToast={props.showToast} 
        />;
      case 'Reset Password':
        return <ResetPasswordContent 
          onSave={props.handleResetPassword}
          onCancel={() => onNav('subpage', null, 'Akun')}
          isSaving={props.isResettingPassword}
        />;
      case 'Edit Profile': 
        return <EditProfileContent 
          userData={props.userData} 
          editForm={props.editForm} 
          setEditForm={props.setEditForm} 
          handleSaveProfile={props.handleSaveProfile} 
          isSavingProfile={props.isSavingProfile} 
          onCancel={() => onNav('subpage', null, 'Akun')} 
        />;
      case 'Notifikasi': 
        return <NotifikasiContent 
          isLoadingNotif={props.isLoadingNotif} 
          notifications={props.notifications} 
        />;
      default: 
        return (
          <div className="flex flex-col items-center justify-center h-64 opacity-50 animate-in fade-in">
            <Info className="w-12 h-12 mb-4" style={{ color: colors.gold }} />
            <p className="text-center text-neutral-400 text-sm">Fitur <strong className="text-white">{subpageTitle}</strong> sedang dalam tahap pengembangan.</p>
          </div>
        );
    }
  };

  return (
    <section className="h-full w-full flex flex-col relative z-40 animate-in slide-in-from-right-4 duration-300 bg-[#0a0a0a] overflow-hidden">
      <div style={{ backgroundColor: `${colors.bg}FA` }} className="px-6 py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md sticky top-0 z-[70]">
        <button 
          onClick={() => {
            if (subpageTitle === 'Detail Event') {
              onNav('subpage', null, 'Jadwal');
            } else if (subpageTitle === 'Tasks') {
              onNav('subpage', null, 'Project');
            } else if (subpageTitle === 'Edit Profile' || subpageTitle === 'Reset Password') {
              onNav('subpage', null, 'Akun');
            } else {
              onNav('dashboard', 'home');
            }
          }} 
          style={{ backgroundColor: colors.card, borderColor: colors.border }} 
          className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
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
