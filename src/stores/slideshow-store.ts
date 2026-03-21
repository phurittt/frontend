import { defineStore } from 'pinia';
import { useProjectStore } from './project-store';
import { useMasterCourseStore } from './masterCourse-store';
import type { SlideShow, CreateSlideShowDto, SlideShowDisplay } from '../models/slideshow';

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
          courseName: masterCourse?.name || 'ไม่พบข้อมูลหลักสูตร',
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
    fetchSlides() {
      this.loading = true;
      try {
        if (this.rawSlides.length === 0) {
          // จำลองข้อมูลที่มีอยู่แล้ว (เชื่อมกับ Project ID 1 และ 2 ตาม Mock Data)
          this.rawSlides = [
            {
              id: 1,
              projectId: 1,
              courseId: 1,
              imageUrl: 'https://cdn.quasar.dev/img/parallax2.jpg',
              isActive: true,
            },
            {
              id: 2,
              projectId: 2,
              courseId: 2,
              imageUrl: 'https://cdn.quasar.dev/img/parallax1.jpg',
              isActive: true,
            },
          ];
        }
      } finally {
        this.loading = false;
      }
    },

    addSlide(data: CreateSlideShowDto) {
      if (!data.projectId || !data.courseId) return;
      const newId = Date.now();
      this.rawSlides.push({
        id: newId,
        projectId: data.projectId,
        courseId: data.courseId,
        imageUrl: data.imageUrl,
        isActive: data.isActive,
      });
    },

    updateSlide(id: number, data: CreateSlideShowDto) {
      if (!data.projectId || !data.courseId) return;
      const index = this.rawSlides.findIndex((s) => String(s.id) === String(id));
      if (index !== -1) {
        this.rawSlides[index] = { ...this.rawSlides[index], ...(data as SlideShow) };
      }
    },

    deleteSlide(id: number | string) {
      const index = this.rawSlides.findIndex((s) => String(s.id) === String(id));
      if (index !== -1) {
        this.rawSlides.splice(index, 1);
      }
    },

    toggleStatus(id: number | string) {
      const slide = this.rawSlides.find((s) => String(s.id) === String(id));
      if (slide) {
        slide.isActive = !slide.isActive;
      }
    },
  },
});
