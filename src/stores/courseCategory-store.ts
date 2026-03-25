import { defineStore } from 'pinia';
import type { CourseCategory, CreateCourseCategoryDto } from '../models/courseCategory';
import { api } from 'src/boot/axios';

export const useCourseCategoryStore = defineStore('courseCategory', {
  state: () => ({
    categories: [] as CourseCategory[],
    loading: false,
  }),

  actions: {
    async fetchCategories() {
      this.loading = true;
      try {
        const response = await api.get('/course-types');
        this.categories = response.data.map((c: any) => ({
          id: c.id,
          code: c.code || '-',
          name: c.name || 'Unnamed Category',
          description: c.description || '',
          courseCount: c.courses?.length || 0,
        }));
      } catch (error) {
        console.error('Error fetching course categories:', error);
      } finally {
        this.loading = false;
      }
    },

    async createCategory(data: CreateCourseCategoryDto) {
      this.loading = true;
      try {
        await api.post('/course-types', data);
        await this.fetchCategories();
      } catch (error) {
        console.error('Error creating category:', error);
      } finally {
        this.loading = false;
      }
    },

    async updateCategory(id: number, data: CreateCourseCategoryDto) {
      this.loading = true;
      try {
        await api.patch(`/course-types/${id}`, data);
        await this.fetchCategories();
      } catch (error) {
        console.error('Error updating category:', error);
      } finally {
        this.loading = false;
      }
    },

    async deleteCategory(id: number) {
      this.loading = true;
      try {
        await api.delete(`/course-types/${id}`);
        await this.fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      } finally {
        this.loading = false;
      }
    },
  },
});
