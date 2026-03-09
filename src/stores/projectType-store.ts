import { defineStore } from 'pinia';
import { api } from 'boot/axios'; // ต้องมีไฟล์ boot axios ก่อน
import type { ProjectType, CreateProjectTypeDto } from '../models/projectType';

export const useProjectTypeStore = defineStore('projectType', {
  state: () => ({
    projectTypes: [] as ProjectType[],
    loading: false,
  }),

  actions: {
    // ดึงข้อมูลทั้งหมด
    async fetchProjectTypes() {
      this.loading = true;
      try {
        const response = await api.get<ProjectType[]>('/project-types');
        this.projectTypes = response.data;
      } finally {
        this.loading = false;
      }
    },

    // เพิ่มข้อมูลใหม่
    async createProjectType(data: CreateProjectTypeDto) {
      const response = await api.post<ProjectType>('/project-types', data);
      this.projectTypes.unshift(response.data); // เพิ่มเข้าไปที่แถวบนสุดของตารางทันที
    },

    // ลบข้อมูล
    async deleteProjectType(id: number) {
      await api.delete(`/project-types/${id}`);
      this.projectTypes = this.projectTypes.filter(item => item.id !== id);
    },

    async updateProjectType(id: number, data: CreateProjectTypeDto) {
      const response = await api.patch<ProjectType>(`/project-types/${id}`, data);
      const index = this.projectTypes.findIndex(item => item.id === id);
      if (index !== -1) {
        this.projectTypes[index] = response.data;
      }
    }
  }
});
