import { defineStore } from 'pinia';
import type { CourseCategory, CreateCourseCategoryDto } from '../models/courseCategory';
// import { api } from 'boot/axios'; // ปลดคอมเมนต์เมื่อต่อ Backend จริง

export const useCourseCategoryStore = defineStore('courseCategory', {
  state: () => ({
    categories: [] as CourseCategory[],
    loading: false,
  }),

  actions: {
    async fetchCategories() {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 500)); // จำลอง API Load
        // const response = await api.get<CourseCategory[]>('/course-categories');
        // this.categories = response.data;

        if (this.categories.length === 0) {
          this.categories = [
            {
              id: 1,
              code: 'CAT-001',
              name: 'คอมพิวเตอร์และเทคโนโลยี',
              description: 'หลักสูตรด้าน IT และโปรแกรมมิ่ง',
              courseCount: 12,
            },
            {
              id: 2,
              code: 'CAT-002',
              name: 'การบริหารจัดการ',
              description: 'หลักสูตรด้าน Management และ HR',
              courseCount: 5,
            },
            {
              id: 3,
              code: 'CAT-003',
              name: 'ภาษาต่างประเทศ',
              description: 'หลักสูตรด้านภาษา',
              courseCount: 8,
            },
          ];
        }
      } finally {
        this.loading = false;
      }
    },

    async createCategory(data: CreateCourseCategoryDto) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        // const response = await api.post<CourseCategory>('/course-categories', data);
        const newId = Date.now();
        this.categories.unshift({ ...data, id: newId, courseCount: 0 });
      } finally {
        this.loading = false;
      }
    },

    async updateCategory(id: number, data: CreateCourseCategoryDto) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        // const response = await api.patch<CourseCategory>(`/course-categories/${id}`, data);
        const index = this.categories.findIndex((item) => item.id === id);
        if (index !== -1) {
          this.categories[index] = { ...this.categories[index], ...data } as CourseCategory;
        }
      } finally {
        this.loading = false;
      }
    },

    async deleteCategory(id: number) {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        // await api.delete(`/course-categories/${id}`);
        this.categories = this.categories.filter((item) => item.id !== id);
      } finally {
        this.loading = false;
      }
    },
  },
});
