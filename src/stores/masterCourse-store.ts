import { defineStore } from 'pinia';
import type { MasterCourse, CreateMasterCourseDto } from '../models/masterCourse';

export const useMasterCourseStore = defineStore('masterCourse', {
  state: () => ({
    // ใส่ข้อมูลจำลองตั้งต้นไว้ใน State เลย
    courses: [] as MasterCourse[],
    loading: false,
  }),

  actions: {
    fetchCourses() {
      this.loading = true;
      try {
        // ถ้ายังไม่มีข้อมูล ให้โหลดข้อมูลเริ่มต้น
        if (this.courses.length === 0) {
          this.courses = [
            {
              id: 1,
              name: 'การใช้ Microsoft Excel ในการคำนวณและวิเคราะห์ข้อมูลทางสถิติเบื้องต้น',
              category: 'Microsoft Office',
              objectives: '',
              content: '',
              prerequisites: '',
              duration: '6 ชั่วโมง',
              show_on_web: true,
            },
            {
              id: 2,
              name: 'Microsoft Word ระดับกลาง',
              category: 'Microsoft Office',
              objectives: '',
              content: '',
              prerequisites: '',
              duration: '6 ชั่วโมง',
              show_on_web: false,
            },
            {
              id: 3,
              name: 'Microsoft Excel ระดับกลาง',
              category: 'Microsoft Office',
              objectives: '',
              content: '',
              prerequisites: '',
              duration: '6 ชั่วโมง',
              show_on_web: true,
            },
            {
              id: 4,
              name: 'สร้างงานนำเสนอด้วย Microsoft PowerPoint อย่างมืออาชีพ',
              category: 'Microsoft Office',
              objectives: '',
              content: '',
              prerequisites: '',
              duration: '6 ชั่วโมง',
              show_on_web: true,
            },
            {
              id: 5,
              name: 'ประสบการณ์การเรียนรู้แบบใหม่ด้วย Office 365 สำหรับอาจารย์',
              category: 'Microsoft Office',
              objectives: '',
              content: '',
              prerequisites: '',
              duration: '6 ชั่วโมง',
              show_on_web: true,
            },
            {
              id: 6,
              name: 'ประสบการณ์การเรียนรู้แบบใหม่ด้วย Office 365 สำหรับนิสิตและบุคลากร',
              category: 'Microsoft Office',
              objectives: '',
              content: '',
              prerequisites: '',
              duration: '6 ชั่วโมง',
              show_on_web: false,
            },
          ];
        }
      } finally {
        this.loading = false;
      }
    },

    createCourse(data: CreateMasterCourseDto) {
      this.loading = true;
      try {
        // สร้าง ID จำลองด้วย Date.now() และดันข้อมูลใหม่ไปไว้บรรทัดบนสุด
        const newId = Date.now();
        this.courses.unshift({ ...data, id: newId });
      } finally {
        this.loading = false;
      }
    },

    updateCourse(id: number, data: CreateMasterCourseDto) {
      this.loading = true;
      try {
        const index = this.courses.findIndex((c) => c.id === id);
        if (index !== -1) {
          this.courses[index] = { ...this.courses[index], ...data } as MasterCourse;
        }
      } finally {
        this.loading = false;
      }
    },

    deleteCourse(id: number) {
      this.loading = true;
      try {
        // กรองเอาตัวที่ถูกลบออกไปจาก Array
        this.courses = this.courses.filter((c) => c.id !== id);
      } finally {
        this.loading = false;
      }
    },
  },
});
