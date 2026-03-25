import { defineStore } from 'pinia';
import type {
  Registration,
  CreateRegistrationDto,
  UpdateRegistrationDto,
} from '../models/registrant';
import { api } from 'src/boot/axios';

export const useRegistrantStore = defineStore('registrant', {
  state: () => ({
    // All registrations — used by RegistrantPage to count per project
    allRegistrations: [] as Registration[],
    // Registrations for the currently viewed project — used by RegistrantManagementPage
    projectRegistrations: [] as Registration[],
    loading: false,
  }),

  actions: {
    // Called by RegistrantPage to show per-project counts
    async fetchAll() {
      this.loading = true;
      try {
        const res = await api.get<Registration[]>('/registrations');
        this.allRegistrations = res.data;
      } catch (err) {
        console.error('Failed to fetch all registrations:', err);
      } finally {
        this.loading = false;
      }
    },

    // Called by RegistrantManagementPage for a specific project
    async fetchByProject(projectId: number) {
      this.loading = true;
      try {
        const res = await api.get<Registration[]>(`/registrations/project/${projectId}`);
        this.projectRegistrations = res.data;
      } catch (err) {
        console.error('Failed to fetch project registrations:', err);
      } finally {
        this.loading = false;
      }
    },

    async create(dto: CreateRegistrationDto) {
      const res = await api.post<Registration>('/registrations', dto);
      await this.fetchByProject(dto.projectId);
      return res.data;
    },

    async update(id: number, dto: UpdateRegistrationDto) {
      await api.patch(`/registrations/${id}`, dto);
      const reg = this.projectRegistrations.find((r) => r.id === id);
      if (reg) await this.fetchByProject(reg.projectId);
    },

    async remove(id: number) {
      const reg = this.projectRegistrations.find((r) => r.id === id);
      await api.delete(`/registrations/${id}`);
      if (reg) await this.fetchByProject(reg.projectId);
    },
  },
});
