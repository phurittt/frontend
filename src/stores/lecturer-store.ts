import { defineStore } from 'pinia';
import type { Lecturer, CreateLecturerDto } from '../models/lecturer';
import { api } from 'src/boot/axios';

export const useLecturerStore = defineStore('lecturer', {
  state: () => ({
    lecturers: [] as Lecturer[],
    loading: false,
  }),

  actions: {
    async fetchLecturers() {
      this.loading = true;
      try {
        const response = await api.get('/lecturers');
        this.lecturers = response.data as Lecturer[];
      } catch (error) {
        console.error('Failed to fetch lecturers:', error);
      } finally {
        this.loading = false;
      }
    },

    async createLecturer(data: CreateLecturerDto) {
      this.loading = true;
      try {
        await api.post('/lecturers', data);
        await this.fetchLecturers();
      } catch (error) {
        console.error('Failed to create lecturer:', error);
      } finally {
        this.loading = false;
      }
    },

    async updateLecturer(id: number, data: CreateLecturerDto) {
      this.loading = true;
      try {
        await api.patch(`/lecturers/${id}`, data);
        await this.fetchLecturers();
      } catch (error) {
        console.error('Failed to update lecturer:', error);
      } finally {
        this.loading = false;
      }
    },

    async deleteLecturer(id: number) {
      this.loading = true;
      try {
        await api.delete(`/lecturers/${id}`);
        await this.fetchLecturers();
      } catch (error) {
        console.error('Failed to delete lecturer:', error);
      } finally {
        this.loading = false;
      }
    },
  },
});
