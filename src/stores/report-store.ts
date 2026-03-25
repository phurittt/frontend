import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
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
import { AttendanceStatus } from '../models/registrant';

export const useReportStore = defineStore('report', {
  state: () => ({
    isLoading: false,
    filters: {
      year: '2569',
      type: '',
      search: '',
    } as ReportFilter,
    rawProjects: [] as any[],
    allFinanceRecords: [] as any[],
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
        const projectRegs = registrantStore.allRegistrations.filter(
          (r) => r.projectId === project.id,
        );
        const registeredCount = projectRegs.filter(
          (r) => r.attendanceStatus !== AttendanceStatus.CANCELLED,
        ).length;
        const attendedCount = projectRegs.filter(
          (r) => r.attendanceStatus === AttendanceStatus.ATTENDED,
        ).length;
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

              lecturerName: `${actualLecturer.firstName} ${actualLecturer.lastName}`,
              lecturerType:
                actualLecturer.department.includes('สำนักคอมพิวเตอร์') ||
                actualLecturer.department.includes('บูรพา')
                  ? 'ภายใน'
                  : 'ภายนอก',

              projectName: project.projectData.projectName,
              courseName: mCourse?.title || 'ไม่ระบุ',
              teachingDate: `${project.projectData.dateFrom}`,
            });
          }
        });
      });
      return report;
    },

    // 4. ข้อมูล Tab การเงิน (เชื่อม Project ↔️ Registrant ↔️ Finance)
    financeReportData(): FinanceReportItem[] {
      const registrantStore = useRegistrantStore();

      return this.filteredProjects.map((project, index) => {
        const rawProject = this.rawProjects.find((p: any) => p.id === project.id);

        // นับผู้ที่ต้องชำระค่าลงทะเบียน (attended + missed, ไม่รวม waiting list)
        const paidCount = registrantStore.allRegistrations.filter(
          (r) =>
            r.projectId === project.id &&
            !r.isWaitingList &&
            (r.attendanceStatus === AttendanceStatus.ATTENDED ||
              r.attendanceStatus === AttendanceStatus.MISSED),
        ).length;

        const registrationFee = Number(rawProject?.registrationFee || 0);
        const lecturerRemuneration = Number(rawProject?.lecturerRemuneration || 0);

        // รายการการเงินที่บันทึกแบบ manual
        const projectFinances = this.allFinanceRecords.filter(
          (f: any) => f.projectId === project.id,
        );
        const manualIncome = projectFinances
          .filter((f: any) => f.type === 'income')
          .reduce((s: number, f: any) => s + Number(f.amount), 0);
        const manualExpense = projectFinances
          .filter((f: any) => f.type === 'expense')
          .reduce((s: number, f: any) => s + Number(f.amount), 0);

        const income = paidCount * registrationFee + manualIncome;
        const expense = lecturerRemuneration + manualExpense;

        const isOnline =
          project.projectData.location.includes('ออนไลน์') ||
          project.projectData.location.includes('Zoom');

        return {
          id: project.id || 0,
          index: index + 1,
          projectName: project.projectData.projectName,
          format: isOnline ? 'ออนไลน์' : 'อบรมในที่ตั้ง',
          totalAttendees: paidCount,
          income,
          expense,
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
        const [rawProjRes, financeRes] = await Promise.all([
          api.get('/projects'),
          api.get('/finances'),
          projectStore.fetchProjects(),
          registrantStore.fetchAll(),
          masterCourseStore.fetchCourses(),
          lecturerStore.fetchLecturers(),
        ]);
        this.rawProjects = rawProjRes.data;
        this.allFinanceRecords = financeRes.data;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
