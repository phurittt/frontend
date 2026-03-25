import { defineStore } from 'pinia';
import type {
  MasterCourse,
  CreateMasterCourseDto,
  UpdateMasterCourseDto,
} from '../models/masterCourse';
import { api } from 'src/boot/axios';

export const useMasterCourseStore = defineStore('masterCourse', {
  state: () => ({
    // ใส่ข้อมูลจำลองตั้งต้นไว้ใน State เลย
    courses: [] as MasterCourse[],
    loading: false,
  }),

  actions: {
    async fetchCourses() {
      this.loading = true;
      try {
        const response = await api.get('/courses');
        this.courses = response.data.map((c: any) => ({
          ...c,
          is_visible: !!c.is_visible, // Map 1/0 to true/false
        }));
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        this.loading = false;
      }
    },

    async createCourse(data: CreateMasterCourseDto) {
      this.loading = true;
      try {
        const payload = {
          ...data,
          is_visible: data.is_visible ? 1 : 0,
        };
        await api.post('/courses', payload);
        await this.fetchCourses();
      } finally {
        this.loading = false;
      }
    },

    async updateCourse(id: number, data: UpdateMasterCourseDto) {
      this.loading = true;
      try {
        const payload = {
          ...data,
          is_visible: data.is_visible ? 1 : 0,
        };
        await api.patch(`/courses/${id}`, payload);
        await this.fetchCourses();
      } finally {
        this.loading = false;
      }
    },

    async deleteCourse(id: number) {
      this.loading = true;
      try {
        await api.delete(`/courses/${id}`);
        await this.fetchCourses();
      } catch (error) {
        console.error('Failed to delete course:', error);
      } finally {
        this.loading = false;
      }
    },
  },
});
