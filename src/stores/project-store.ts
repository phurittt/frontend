import { defineStore } from 'pinia';
import type { Project, ProjectForm, ProjectCourse, ProjectLecturer } from '../models/project';

const defaultProjectForm = (): ProjectForm => ({
  year: '',
  projectType: null,
  projectName: '',
  dateFrom: '',
  dateTo: '',
  manager: null,
  location: '',
  regisOpenDate: '',
  regisCloseDate: '',
  timeFrom: '',
  timeTo: '',
  cancelDays: '',
  askFood: false,
  isOpen: false,
});

export const useProjectStore = defineStore('project', {
  state: () => ({
    editId: null as number | null, // เก็บ ID ของโครงการที่กำลังแก้ไข
    projectForm: defaultProjectForm(),
    courseList: [] as ProjectCourse[],
    lecturerList: [] as ProjectLecturer[],
    projects: [] as Project[],
    loading: false,
  }),

  actions: {
    // 1. จำลองข้อมูลโครงการ
    fetchProjects() {
      this.loading = true;
      try {
        if (this.projects.length === 0) {
          this.projects = [
            {
              id: 1,
              projectData: {
                year: '2569',
                projectType: { label: 'โครงการอบรมเชิงปฏิบัติการ', value: 1 },
                projectName:
                  'โครงการพัฒนาทักษะดิจิทัลสำหรับบุคลากรกองกิจการนิสิต Unlock Potential พลิกโฉมงานยุคใหม่ด้วย Generative AI',
                dateFrom: '27/01/2569',
                dateTo: '27/01/2569',
                manager: { label: 'อนุทิน ชาญชัย', value: 1 },
                location: 'ห้องปฏิบัติการคอมพิวเตอร์',
                regisOpenDate: '15/01/2569',
                regisCloseDate: '25/01/2569',
                timeFrom: '08:30',
                timeTo: '16:00',
                cancelDays: '3',
                askFood: false,
                isOpen: true,
              },
              courses: [
                {
                  course: { label: 'การใช้ Generative AI เบื้องต้น', value: 1 },
                  targetGroups: ['เจ้าหน้าที่'],
                  targetAmount: '40',
                  isOpen: true,
                },
              ],
              lecturers: [],
            },
            {
              id: 2,
              projectData: {
                year: '2569',
                projectType: { label: 'โครงการบริการวิชาการ', value: 2 },
                projectName: 'โครงการอบรมเชิงปฏิบัติการ การใช้งานระบบบัญชีใหม่',
                dateFrom: '15/02/2569',
                dateTo: '16/02/2569',
                manager: { label: 'สมชาย ใจดี', value: 2 },
                location: 'ห้องประชุม 2',
                regisOpenDate: '01/02/2569',
                regisCloseDate: '10/02/2569',
                timeFrom: '09:00',
                timeTo: '16:00',
                cancelDays: '5',
                askFood: true,
                isOpen: false,
              },
              courses: [
                {
                  course: { label: 'ระบบบัญชีพื้นฐาน', value: 2 },
                  targetGroups: ['เจ้าหน้าที่'],
                  targetAmount: '30',
                  isOpen: true,
                },
                {
                  course: { label: 'ระบบบัญชีขั้นสูง', value: 3 },
                  targetGroups: ['เจ้าหน้าที่'],
                  targetAmount: '30',
                  isOpen: false,
                },
              ],
              lecturers: [],
            },
          ];
        }
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.editId = null;
      this.projectForm = defaultProjectForm();
      this.courseList = [];
      this.lecturerList = [];
    },

    // 2. จัดการตารางย่อย
    addCourse(course: ProjectCourse) {
      this.courseList.push({ ...course });
    },
    removeCourse(index: number) {
      this.courseList.splice(index, 1);
    },
    addLecturer(lecturer: ProjectLecturer) {
      this.lecturerList.push({ ...lecturer });
    },
    removeLecturer(index: number) {
      this.lecturerList.splice(index, 1);
    },

    // 3. จัดเตรียมข้อมูลสำหรับหน้า Edit
    setEditProject(project: Project) {
      this.editId = project.id || null;
      this.projectForm = JSON.parse(JSON.stringify(project.projectData));
      this.courseList = JSON.parse(JSON.stringify(project.courses));
      this.lecturerList = JSON.parse(JSON.stringify(project.lecturers));
    },

    // 4. บันทึก (แยกเป็น เพิ่มใหม่ / อัปเดต)
    submitProject() {
      this.loading = true;
      try {
        if (this.editId) {
          // โหมดแก้ไข
          const index = this.projects.findIndex((p) => p.id === this.editId);
          if (index !== -1) {
            this.projects[index] = {
              id: this.editId,
              projectData: { ...this.projectForm },
              courses: [...this.courseList],
              lecturers: [...this.lecturerList],
            };
          }
        } else {
          // โหมดเพิ่มใหม่
          const payload: Project = {
            id: Date.now(),
            projectData: { ...this.projectForm },
            courses: [...this.courseList],
            lecturers: [...this.lecturerList],
          };
          this.projects.unshift(payload);
        }
        this.resetForm();
      } finally {
        this.loading = false;
      }
    },

    // 5. ลบโครงการ
    deleteProject(id: number) {
      this.projects = this.projects.filter((p) => p.id !== id);
    },
  },
});
