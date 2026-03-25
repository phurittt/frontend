import { defineStore } from 'pinia';
import type { Project, CreateProjectPayload, ProjectApi } from '../models/project';
import { api } from 'src/boot/axios';

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [] as Project[],
    loading: false,
  }),

  actions: {
    async fetchProjects() {
      this.loading = true;
      try {
        const response = await api.get('/projects');
        this.projects = response.data.map((p: any) => ({
          id: p.id,
          projectData: {
            year: p.projectYear || '-',
            projectType: p.projectType
              ? { label: p.projectType.name, value: p.projectType.id }
              : null,
            projectName: p.name || 'Unnamed Project',
            dateFrom: p.projectDurationStart ? p.projectDurationStart.slice(0, 10) : '',
            dateTo: p.projectDurationEnd ? p.projectDurationEnd.slice(0, 10) : '',
            manager: p.manager
              ? { label: `${p.manager.firstName} ${p.manager.lastName}`, value: p.manager.id }
              : null,
            location: p.location || '',
            regisOpenDate: p.registrationStartDate ? p.registrationStartDate.slice(0, 10) : '',
            regisCloseDate: p.registrationEndDate ? p.registrationEndDate.slice(0, 10) : '',
            timeFrom: '',
            timeTo: '',
            cancelDays: p.cancelDaysBefore?.toString() || '',
            askFood: p.requireFoodSurvey ?? false,
            isOpen: p.status ?? true,
            isVisible: p.isVisible ?? true,
          },
          // A project has one course (courseId). Wrap in array so .length reflects 0 or 1.
          courses: p.course
            ? [
                {
                  course: { label: p.course.title, value: p.course.id },
                  targetGroups: [],
                  targetAmount: '',
                  isOpen: true,
                },
              ]
            : [],
          lecturers: (p.lecturers || []).map((l: any) => ({
            course: p.course ? { label: p.course.title, value: p.course.id } : null,
            lecturerName: { label: `${l.firstName} ${l.lastName}`, value: l.id },
            assistantName: null,
          })),
        }));
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchProject(id: number): Promise<ProjectApi> {
      const response = await api.get<ProjectApi>(`/projects/${id}`);
      return response.data;
    },

    async submitProject(payload: CreateProjectPayload, editId: number | null = null) {
      this.loading = true;
      try {
        if (editId) {
          await api.patch(`/projects/${editId}`, payload);
        } else {
          await api.post('/projects', payload);
        }
        await this.fetchProjects();
      } catch (error) {
        console.error('Failed to submit project:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async patchProject(id: number, data: Partial<CreateProjectPayload>) {
      try {
        await api.patch(`/projects/${id}`, data);
        await this.fetchProjects();
      } catch (error) {
        console.error('Failed to patch project:', error);
        throw error;
      }
    },

    async deleteProject(id: number) {
      try {
        await api.delete(`/projects/${id}`);
        await this.fetchProjects();
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    },

    // Stubs kept for ProjectManagementPage compatibility.
    // ProjectAddPage now loads edit data via fetchProject(id) in onMounted.
    setEditProject(_project: Project) {},
    resetForm() {},
  },
});
