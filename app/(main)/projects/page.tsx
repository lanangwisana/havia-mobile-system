"use client";

import React, { useEffect } from 'react';
import { PageWrapper } from '@/components/ui/PageWrapper';
import { ProjectContent } from '@/components/content/ProjectContent';
import { useProjectsAndTasks } from '@/hooks/useProjectsAndTasks';
import { useAuth } from '@/app/providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function ProjectsPage() {
  const { apiToken, userData, showToast } = useAuth();
  const router = useRouter();
  
  const {
    projects, isLoadingProjects, projectPaginationMeta,
    currentProjectPage, currentProjectFilter, currentProjectSearch,
    loadProjects
  } = useProjectsAndTasks({ apiToken, userData, showToast });

  useEffect(() => {
    if (apiToken) {
      loadProjects(currentProjectFilter, currentProjectPage, currentProjectSearch);
    }
  }, [apiToken]);

  const handleProjectClick = (id: string, name: string) => {
    // Navigate to tasks for this specific project
    router.push(`/projects/${id}?name=${encodeURIComponent(name)}`);
  };

  return (
    <PageWrapper title="Projects" backRoute="/dashboard">
      <ProjectContent 
        projects={projects}
        isLoadingProjects={isLoadingProjects}
        onProjectClick={handleProjectClick}
        paginationMeta={projectPaginationMeta}
        onPageChange={(p) => loadProjects(currentProjectFilter, p, currentProjectSearch)}
        onFilterChange={(s) => loadProjects(s, 1, currentProjectSearch)}
        currentProjectSearch={currentProjectSearch}
        onProjectSearch={(s) => loadProjects(currentProjectFilter, 1, s)}
      />
    </PageWrapper>
  );
}
