import { acceptHMRUpdate, defineStore } from 'pinia';
import type { Course } from 'src/models/course';
import { api } from 'src/boot/axios';
import { useUserStore } from './user-store';

export interface EnrolledCourse {
  id: number;
  courseId: number;
  title: string;
  date: string;
  time: string;
  status: string;
  statusCode: 'registered' | 'waiting' | 'confirmed' | 'cancelled';
  image: string;
  canCancel: boolean;
  canConfirm: boolean;
  isWaitingList: boolean;
  isOnline: boolean;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function formatTrainingDate(start: string | null, end: string | null): string {
  if (!start) return '-';
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  };
  const startStr = new Date(start).toLocaleDateString('th-TH', opts);
  if (!end) return startStr;
  // Compare calendar day in UTC (matches the stored value as entered)
  const dayFmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  if (dayFmt.format(new Date(start)) === dayFmt.format(new Date(end))) return startStr;
  return `${startStr} – ${new Date(end).toLocaleDateString('th-TH', opts)}`;
}

function formatTrainingTime(start: string | null, end: string | null): string {
  if (!start) return '-';
  const opts: Intl.DateTimeFormatOptions = {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  const s = new Date(start).toLocaleTimeString('th-TH', opts);
  if (!end) return `${s} น.`;
  const e = new Date(end).toLocaleTimeString('th-TH', opts);
  return `${s} - ${e} น.`;
}

function splitLines(text: string | null | undefined): string[] {
  return text
    ? text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
    : [];
}

function mapProject(p: any, registeredSeats: number, waitingListCount = 0): Course {
  const loc: string = p.location || '';
  const isOnline =
    loc.includes('ออนไลน์') ||
    loc.toLowerCase().includes('zoom') ||
    loc.toLowerCase().includes('online');

  const lec = p.lecturers?.[0];
  const instructorName = lec
    ? `${lec.firstName} ${lec.lastName}`
    : p.manager
      ? `${p.manager.firstName} ${p.manager.lastName}`
      : '-';

  return {
    id: p.id,
    title: p.course?.title || p.name || 'ไม่ระบุชื่อ',
    description: p.course?.objective || loc || '-',
    image: p.coverImage || undefined,
    date: formatTrainingDate(p.trainingStartDate, p.trainingEndDate),
    time: formatTrainingTime(p.trainingStartDate, p.trainingEndDate),
    duration: p.course?.duration_hours ? `${p.course.duration_hours} ชั่วโมง` : '-',
    location: loc || '-',
    format: isOnline ? 'ออนไลน์ (Zoom)' : 'ออฟไลน์ (On-site)',
    price: Number(p.registrationFee) || 0,
    totalSeats: p.capacity || 0,
    registeredSeats,
    waitingListCount,
    reserveCapacity: p.reserveCapacity || 0,
    registrationStartDate: p.registrationStartDate || undefined,
    registrationEndDate: p.registrationEndDate || undefined,
    isOpen: !!p.status && !!p.isVisible,
    instructor: {
      name: instructorName,
      role: 'วิทยากร',
      avatar: 'https://cdn.quasar.dev/img/avatar5.jpg',
    },
    objectives: splitLines(p.course?.objective),
    courseOutline: splitLines(p.course?.content),
    prerequisite: splitLines(p.course?.required_knowledge),
  };
}

// ─── store ───────────────────────────────────────────────────────────────────

export const useCourseStore = defineStore('course', {
  state: () => ({
    courses: [] as Course[],
    isLoading: false,

    cart: [] as Course[],
    favoriteIds: [] as number[],

    enrolledCourses: [] as EnrolledCourse[],
  }),

  getters: {
    availableSeats: (state) => (courseId: number) => {
      const course = state.courses.find((c) => c.id === courseId);
      return course ? course.totalSeats - course.registeredSeats : 0;
    },
    featuredCourse: (state) => state.courses[0],

    // หลักสูตรที่เปิดรับสมัครและยังมีที่นั่งว่าง
    openCourses: (state) =>
      state.courses.filter((c) => c.isOpen && c.totalSeats > c.registeredSeats),
    freeCourses: (state) => state.courses.filter((c) => c.price === 0),

    isFavorite: (state) => (courseId: number) => state.favoriteIds.includes(courseId),
    cartTotal: (state) => state.cart.reduce((total, course) => total + course.price, 0),
  },

  actions: {
    async fetchCourses() {
      this.isLoading = true;
      try {
        const [projectsRes, regRes] = await Promise.all([
          api.get('/projects'),
          api.get('/registrations'),
        ]);
        const projects: any[] = projectsRes.data || [];
        const registrations: any[] = regRes.data || [];

        // นับจำนวนผู้ลงทะเบียน: confirmed (ไม่ใช่คิวสำรอง) และ waitingList แยกกัน
        const regCounts: Record<number, number> = {};
        const waitingCounts: Record<number, number> = {};
        registrations.forEach((r: any) => {
          if (r.attendanceStatus !== 'cancelled') {
            if (r.isWaitingList) {
              waitingCounts[r.projectId] = (waitingCounts[r.projectId] || 0) + 1;
            } else {
              regCounts[r.projectId] = (regCounts[r.projectId] || 0) + 1;
            }
          }
        });

        // แสดงเฉพาะโครงการที่ isVisible = true
        this.courses = projects
          .filter((p) => p.isVisible)
          .map((p) => mapProject(p, regCounts[p.id] ?? 0, waitingCounts[p.id] ?? 0));
      } catch (error) {
        console.error('Failed to fetch courses/projects:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchCourseById(id: number) {
      const existing = this.courses.find((c) => c.id === id);
      if (existing) return existing;

      this.isLoading = true;
      try {
        const [projectRes, regRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/registrations/project/${id}`),
        ]);
        const p = projectRes.data;
        if (!p) throw new Error('Not found');

        const regs = regRes.data as any[];
        const registeredSeats = regs.filter(
          (r) => r.attendanceStatus !== 'cancelled' && !r.isWaitingList,
        ).length;
        const waitingListCount = regs.filter(
          (r) => r.attendanceStatus !== 'cancelled' && r.isWaitingList,
        ).length;

        const course = mapProject(p, registeredSeats, waitingListCount);
        this.courses.push(course);
        return course;
      } catch (error) {
        console.error('Failed to fetch course detail:', error);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchEnrolledCourses() {
      const userStore = useUserStore();
      const userId = userStore.profile?.id;
      if (!userId) return;

      try {
        const response = await api.get(`/registrations/user/${userId}`);
        this.enrolledCourses = response.data.map((r: any) => {
          const p = r.project;
          const price = Number(p?.registrationFee) || 0;

          let statusText = 'รอยืนยันการเข้าร่วม';
          let statusCode: 'registered' | 'waiting' | 'confirmed' | 'cancelled' = 'registered';

          if (r.attendanceStatus === 'cancelled') {
            statusText = 'ยกเลิกแล้ว';
            statusCode = 'cancelled';
          } else if (r.attendanceStatus === 'attended') {
            statusText = 'ยืนยันการเข้าร่วมแล้ว';
            statusCode = 'confirmed';
          } else if (r.isWaitingList) {
            statusText = 'อยู่ในคิวสำรอง';
            statusCode = 'waiting';
          } else if (r.paymentStatus === 'unpaid' && price > 0) {
            statusText = 'รอการชำระเงิน';
            statusCode = 'registered';
          }

          const isPending = r.attendanceStatus === 'pending' && !r.isWaitingList;

          return {
            id: r.id,
            courseId: p?.id || 0,
            title: p?.name || 'ไม่ระบุชื่อ',
            date: formatTrainingDate(p?.trainingStartDate, p?.trainingEndDate),
            time: formatTrainingTime(p?.trainingStartDate, p?.trainingEndDate),
            status: statusText,
            statusCode: statusCode,
            image: p?.coverImage || 'https://cdn.quasar.dev/img/parallax2.jpg',
            canCancel: isPending,
            canConfirm: isPending,
            isWaitingList: !!r.isWaitingList,
            isOnline: (p?.location || '').includes('ออนไลน์'),
          };
        });
      } catch (error) {
        console.error('Failed to fetch enrolled courses:', error);
      }
    },

    async registerCourse(courseId: number, _isWaitingList: boolean) {
      const userStore = useUserStore();
      const userId = userStore.profile?.id;

      if (!userId) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนลงทะเบียน');
      }

      const payload = {
        userId: userId,
        projectId: courseId,
        participantType: 'บุคคลทั่วไป',
      };

      await api.post('/registrations', payload);
      await this.fetchEnrolledCourses();
    },

    async cancelEnrollment(enrollmentId: number) {
      await api.post(`/registrations/${enrollmentId}/cancel`);
      await this.fetchEnrolledCourses();
    },

    async confirmEnrollmentAttendance(enrollmentId: number) {
      await api.post(`/registrations/${enrollmentId}/confirm`);
      await this.fetchEnrolledCourses();
    },

    toggleFavorite(courseId: number) {
      const index = this.favoriteIds.indexOf(courseId);
      if (index === -1) {
        this.favoriteIds.push(courseId);
      } else {
        this.favoriteIds.splice(index, 1);
      }
    },

    addToCart(course: Course) {
      if (!this.cart.find((c) => c.id === course.id)) {
        this.cart.push(course);
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCourseStore, import.meta.hot));
}
