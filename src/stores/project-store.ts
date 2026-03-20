// src/stores/project-store.ts

import { defineStore } from 'pinia';
import type { Project, ProjectForm, ProjectCourse, ProjectLecturer } from '../models/project';

const defaultProjectForm = (): ProjectForm => ({
  year: '', projectType: null, projectName: '', dateFrom: '', dateTo: '',
  manager: null, location: '', regisOpenDate: '', regisCloseDate: '',
  timeFrom: '', timeTo: '', cancelDays: '', askFood: false, isOpen: false
});

export const useProjectStore = defineStore('project', {
  state: () => ({
    // ข้อมูลฟอร์มหลัก
    projectForm: defaultProjectForm(),
    // ข้อมูลตารางหลักสูตรและวิทยากร
    courseList: [] as ProjectCourse[],
    lecturerList: [] as ProjectLecturer[],

    // จำลองฐานข้อมูลโครงการทั้งหมด (ไว้โชว์ในหน้าตารางรวม)
    projects: [] as Project[],
    loading: false,
  }),

  actions: {
    // ล้างข้อมูลฟอร์มเมื่อบันทึกเสร็จ
    resetForm() {
      this.projectForm = defaultProjectForm();
      this.courseList = [];
      this.lecturerList = [];
    },

    // จัดการตารางหลักสูตร
    addCourse(course: ProjectCourse) {
      this.courseList.push({ ...course });
    },
    removeCourse(index: number) {
      this.courseList.splice(index, 1);
    },

    // จัดการตารางวิทยากร
    addLecturer(lecturer: ProjectLecturer) {
      this.lecturerList.push({ ...lecturer });
    },
    removeLecturer(index: number) {
      this.lecturerList.splice(index, 1);
    },

    // บันทึกโครงการ
    submitProject() {
      this.loading = true;
      try {
        const payload: Project = {
          id: Date.now(), // จำลอง ID
          projectData: { ...this.projectForm },
          courses: [...this.courseList],
          lecturers: [...this.lecturerList]
        };

        console.log('ข้อมูลเตรียมส่ง Backend:', payload);

        // บันทึกลง Array
        this.projects.unshift(payload);

        // ล้างฟอร์มเตรียมรับข้อมูลใหม่
        this.resetForm();
      } finally {
        this.loading = false;
      }
    }
  }
});
