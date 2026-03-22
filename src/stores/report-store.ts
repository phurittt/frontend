import { defineStore } from 'pinia';
import { useProjectStore } from './project-store';
import { useRegistrantStore } from './registrant-store';
import { useMasterCourseStore } from './masterCourse-store';
import { useLecturerStore } from './lecturer-store';
import type {
  ReportFilter,
  SummaryReportItem,
  LecturerReportItem,
  FinanceReportItem,
} from '../models/report';

export const useReportStore = defineStore('report', {
  state: () => ({
    isLoading: false,
    filters: {
      year: '2569',
      type: '',
      search: '',
    } as ReportFilter,
  }),

  getters: {
    // 1. ตัวกรองโครงการหลัก
    filteredProjects: (state) => {
      const projectStore = useProjectStore();
      return projectStore.projects.filter((p) => {
        if (state.filters.year && p.projectData.year !== state.filters.year) return false;

        const isOnline =
          p.projectData.location.includes('ออนไลน์') || p.projectData.location.includes('Zoom');
        if (state.filters.type === 'online' && !isOnline) return false;
        if (state.filters.type === 'onsite' && isOnline) return false;

        if (state.filters.search) {
          const keyword = state.filters.search.toLowerCase();
          if (!p.projectData.projectName.toLowerCase().includes(keyword)) return false;
        }
        return true;
      });
    },

    // 2. ข้อมูล Tab สรุปภาพรวม
    summaryReportData(): SummaryReportItem[] {
      const registrantStore = useRegistrantStore();
      return this.filteredProjects.map((project, index) => {
        const projectRegs = registrantStore.rawRegistrants.filter(
          (r) => r.projectId === project.id,
        );
        const registeredCount = projectRegs.filter((r) => r.status !== 'ยกเลิก').length;
        const attendedCount = projectRegs.filter((r) => r.status === 'ชำระเงินเรียบร้อย').length;
        const isOnline =
          project.projectData.location.includes('ออนไลน์') ||
          project.projectData.location.includes('Zoom');

        return {
          id: project.id || 0,
          index: index + 1,
          projectName: project.projectData.projectName,
          date: `${project.projectData.dateFrom}`,
          format: isOnline ? 'ออนไลน์' : 'อบรมในที่ตั้ง',
          registered: registeredCount,
          attended: attendedCount,
        };
      });
    },

    // 3. ข้อมูล Tab ประวัติวิทยากร (เชื่อม Project ↔️ MasterCourse ↔️ Lecturer)
    lecturerReportData(): LecturerReportItem[] {
      const masterCourseStore = useMasterCourseStore();
      const lecturerStore = useLecturerStore(); // ดึงข้อมูลวิทยากรกลาง
      const report: LecturerReportItem[] = [];
      let indexCounter = 1;

      this.filteredProjects.forEach((project) => {
        project.lecturers.forEach((lecConfig) => {
          // หาชื่อหลักสูตร
          const mCourse = masterCourseStore.courses.find(
            (c) => c.id === Number(lecConfig.course?.value),
          );

          // หาข้อมูลวิทยากรจาก ID
          const actualLecturer = lecturerStore.lecturers.find(
            (l) => String(l.id) === String(lecConfig.lecturerName?.value),
          );

          if (actualLecturer) {
            report.push({
              id: `${project.id}-${actualLecturer.id}`,
              index: indexCounter++,

              lecturerName: actualLecturer.fullName,
              lecturerType:
                actualLecturer.organization.includes('สำนักคอมพิวเตอร์') ||
                actualLecturer.organization.includes('บูรพา')
                  ? 'ภายใน'
                  : 'ภายนอก',

              projectName: project.projectData.projectName,
              courseName: mCourse?.name || 'ไม่ระบุ',
              teachingDate: `${project.projectData.dateFrom}`,
            });
          }
        });
      });
      return report;
    },

    // 4. ข้อมูล Tab การเงิน (เชื่อม Project ↔️ Registrant)
    financeReportData(): FinanceReportItem[] {
      const registrantStore = useRegistrantStore();

      return this.filteredProjects.map((project, index) => {
        // นับคนเข้าอบรมจริง
        const attendedCount = registrantStore.rawRegistrants.filter(
          (r) => r.projectId === project.id && r.status === 'ชำระเงินเรียบร้อย',
        ).length;

        const isOnline =
          project.projectData.location.includes('ออนไลน์') ||
          project.projectData.location.includes('Zoom');

        // จำลองรายรับ (คนละ 1,500 บาท) *ใช้จริงดึงจากค่าลงทะเบียนของ Project ได้
        const income = attendedCount * 1500;

        // จำลองรายจ่ายคงที่ต่อโครงการ
        const expense = isOnline ? 2000 : 15000;

        return {
          id: project.id || 0,
          index: index + 1,
          projectName: project.projectData.projectName,
          format: isOnline ? 'ออนไลน์' : 'อบรมในที่ตั้ง',
          totalAttendees: attendedCount,
          income: income,
          expense: expense,
          profit: income - expense,
        };
      });
    },
  },

  actions: {
    async fetchInitialReportData() {
      this.isLoading = true;
      try {
        const projectStore = useProjectStore();
        const registrantStore = useRegistrantStore();
        const masterCourseStore = useMasterCourseStore();
        const lecturerStore = useLecturerStore();

        // โหลดข้อมูลดิบทุกส่วนมารอไว้
        await Promise.all([
          projectStore.fetchProjects(),
          registrantStore.fetchRegistrants(),
          masterCourseStore.fetchCourses(),
          lecturerStore.fetchLecturers(), // โหลดวิทยากรเพิ่ม
        ]);
      } finally {
        this.isLoading = false;
      }
    },
  },
});
