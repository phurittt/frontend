import { defineStore } from 'pinia';
import { useProjectStore } from './project-store';
import { useMasterCourseStore } from './masterCourse-store';
import type { SlideShow, CreateSlideShowDto, SlideShowDisplay } from '../models/slideshow';
import { api } from 'src/boot/axios';

export const useSlideShowStore = defineStore('slideshow', {
  state: () => ({
    rawSlides: [] as SlideShow[], // เก็บแค่ข้อมูลดิบ (มีแต่ ID)
    loading: false,
  }),

  getters: {
    // ประกอบร่างข้อมูลสำหรับโชว์หน้าตาราง
    slides: (state): SlideShowDisplay[] => {
      const projectStore = useProjectStore();
      const masterCourseStore = useMasterCourseStore();

      return state.rawSlides.map((slide) => {
        const project = projectStore.projects.find((p) => p.id === slide.projectId);
        const masterCourse = masterCourseStore.courses.find((c) => c.id === slide.courseId);

        return {
          ...slide,
          courseName: masterCourse?.title || 'ไม่พบข้อมูลหลักสูตร',
          projectName: project?.projectData.projectName || 'ไม่พบข้อมูลโครงการ',
          trainingDate: project ? `${project.projectData.dateFrom}` : '-',
          trainingTime: project
            ? `${project.projectData.timeFrom} - ${project.projectData.timeTo} น.`
            : '-',
        };
      });
    },
  },

  actions: {
    async fetchSlides() {
      this.loading = true;
      try {
        const response = await api.get('/slide-shows');
        this.rawSlides = response.data.map((s: any) => ({
          ...s,
        }));
      } catch (error) {
        console.error('Error fetching slides:', error);
      } finally {
        this.loading = false;
      }
    },

    async addSlide(data: CreateSlideShowDto) {
      if (!data.projectId || !data.courseId) return;
      this.loading = true;
      try {
        await api.post('/slide-shows', data);
        await this.fetchSlides();
      } catch (error) {
        console.error('Error adding slide:', error);
      } finally {
        this.loading = false;
      }
    },

    async updateSlide(id: number, data: CreateSlideShowDto) {
      if (!data.projectId || !data.courseId) return;
      this.loading = true;
      try {
        await api.patch(`/slide-shows/${id}`, data);
        await this.fetchSlides();
      } catch (error) {
        console.error('Error updating slide:', error);
      } finally {
        this.loading = false;
      }
    },

    async deleteSlide(id: number | string) {
      this.loading = true;
      try {
        await api.delete(`/slide-shows/${id}`);
        await this.fetchSlides();
      } catch (error) {
        console.error('Error deleting slide:', error);
      } finally {
        this.loading = false;
      }
    },

    async toggleStatus(id: number | string) {
      const slide = this.rawSlides.find((s) => String(s.id) === String(id));
      if (slide) {
        this.loading = true;
        try {
          await api.patch(`/slide-shows/${id}`, { isActive: !slide.isActive });
          await this.fetchSlides();
        } catch (error) {
          console.error('Error toggling status:', error);
        } finally {
          this.loading = false;
        }
      }
    },
  },
});
