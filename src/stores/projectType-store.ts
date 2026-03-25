import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import type { ProjectType, CreateProjectTypeDto } from '../models/projectType';

// ตัวแปรสำหรับสลับโหมด (เปลี่ยนเป็น false เมื่อต้องการให้ระบบยิง API จริง)
const USE_MOCK = false;

export const useProjectTypeStore = defineStore('projectType', {
  state: () => ({
    projectTypes: [] as ProjectType[],
    loading: false,
  }),

  actions: {
    // 1. ดึงข้อมูลทั้งหมด
    async fetchProjectTypes() {
      this.loading = true;
      try {
        if (USE_MOCK) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          if (this.projectTypes.length === 0) {
            this.projectTypes = [
              {
                id: 1,
                name: 'โครงการอบรมเชิงปฏิบัติการ (Workshop)',
                regis_fee: 1,
                description: 'เน้นการลงมือปฏิบัติจริง',
              },
              {
                id: 2,
                name: 'โครงการสัมมนาวิชาการ (Seminar)',
                regis_fee: 0,
                description: 'เน้นการบรรยายและแลกเปลี่ยนความรู้',
              },
              {
                id: 3,
                name: 'โครงการศึกษาดูงาน',
                regis_fee: 1,
                description: 'เดินทางไปศึกษาดูงานนอกสถานที่',
              },
            ];
          }
          return; // ออกจากฟังก์ชันทันที โค้ดด้านล่างจะไม่ถูกรัน
        }

        // --- โค้ด API จริง (ไม่ถูกคอมเมนต์) ---
        const response = await api.get<ProjectType[]>('/project-types');
        this.projectTypes = response.data;
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        this.loading = false;
      }
    },

    // 2. เพิ่มข้อมูลใหม่
    async createProjectType(data: CreateProjectTypeDto) {
      this.loading = true;
      try {
        if (USE_MOCK) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const newId = Date.now();
          this.projectTypes.unshift({ ...data, id: newId });
          return;
        }

        // --- โค้ด API จริง ---
        const response = await api.post<ProjectType>('/project-types', data);
        this.projectTypes.unshift(response.data);
      } finally {
        this.loading = false;
      }
    },

    // 3. ลบข้อมูล
    async deleteProjectType(id: number) {
      this.loading = true;
      try {
        if (USE_MOCK) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          this.projectTypes = this.projectTypes.filter((item) => item.id !== id);
          return;
        }

        // --- โค้ด API จริง ---
        await api.delete(`/project-types/${id}`);
        this.projectTypes = this.projectTypes.filter((item) => item.id !== id);
      } finally {
        this.loading = false;
      }
    },

    // 4. แก้ไขข้อมูล
    async updateProjectType(id: number, data: CreateProjectTypeDto) {
      this.loading = true;
      try {
        if (USE_MOCK) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const index = this.projectTypes.findIndex((item) => item.id === id);
          if (index !== -1) {
            this.projectTypes[index] = { ...this.projectTypes[index], ...data };
          }
          return;
        }

        // --- โค้ด API จริง ---
        const response = await api.patch<ProjectType>(`/project-types/${id}`, data);
        const index = this.projectTypes.findIndex((item) => item.id === id);
        if (index !== -1) {
          this.projectTypes[index] = response.data;
        }
      } finally {
        this.loading = false;
      }
    },
  },
});
