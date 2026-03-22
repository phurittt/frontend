import { acceptHMRUpdate, defineStore } from 'pinia';
import type { Course } from 'src/models/course';

// เพิ่ม Interface สำหรับเก็บประวัติการลงทะเบียน
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
  isOnline: boolean;
}

export const useCourseStore = defineStore('course', {
  state: () => ({
    courses: [] as Course[],
    isLoading: false,

    cart: [] as Course[],
    favoriteIds: [] as number[],

    // ตัวแปรใหม่ที่ Error หาไม่เจอ: สำหรับเก็บประวัติที่ลงทะเบียนแล้ว
    enrolledCourses: [] as EnrolledCourse[],
  }),

  getters: {
    availableSeats: (state) => (courseId: number) => {
      const course = state.courses.find((c) => c.id === courseId);
      return course ? course.totalSeats - course.registeredSeats : 0;
    },
    featuredCourse: (state) => state.courses[0],

    openCourses: (state) => state.courses.filter((c) => c.totalSeats > c.registeredSeats),
    freeCourses: (state) => state.courses.filter((c) => c.price === 0),

    isFavorite: (state) => (courseId: number) => state.favoriteIds.includes(courseId),
    cartTotal: (state) => state.cart.reduce((total, course) => total + course.price, 0),
  },

  actions: {
    async fetchCourses() {
      this.isLoading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        this.courses = [
          {
            id: 1,
            title: 'AI Marketing: stepping into the Professional Digital Marketing ยกระดับสู่มืออาชีพการตลาดดิจิทัล',
            description: 'รู้จักเทรนด์ AI เครื่องมือการตลาดดิจิทัลยุคใหม่ และการใช้ AI ในการวิเคราะห์ข้อมูลแม่นยำ โดนเป้าหมาย',
            image: 'https://cdn.quasar.dev/img/parallax2.jpg',
            date: '24 ก.พ. 2569',
            time: '08:30-16:30 น.',
            duration: '6 ชั่วโมง',
            location: 'ห้องประชุม 201 ชั้น 2 อาคารสำนักหอสมุด',
            format: 'ออฟไลน์ (On-site)',
            instructor: {
              name: 'ดร. สมชาย ใจดี',
              role: 'วิทยากรหลัก',
              avatar: 'https://cdn.quasar.dev/img/avatar5.jpg',
            },
            price: 0,
            totalSeats: 70,
            registeredSeats: 70,
            courseOutline: [
              'รู้จักเทรนด์ AI เครื่องมือการตลาดดิจิทัลยุคใหม่',
              'AI ในการวิเคราะห์ข้อมูล แม่นยำ โดนเป้าหมาย ด้วย Google Analytics',
            ],
            objectives: [
              'เพื่อให้ผู้เข้าอบรมมีความรู้และความเข้าใจ เกี่ยวกับบทบาทและเครื่องมือ AI',
            ],
            prerequisite: ['มีความรู้ด้านการใช้คอมพิวเตอร์เบื้องต้น'],
          },
          {
            id: 2,
            title: 'การพัฒนาเว็บไซต์ด้วย Vue.js',
            description: 'เรียนรู้การสร้างเว็บแอปพลิเคชันสมัยใหม่ด้วย Vue.js และ Quasar Framework',
            image: 'https://cdn.quasar.dev/img/parallax1.jpg',
            date: '23 ธ.ค. 2567',
            time: '09:00-16:00 น.',
            duration: '6 ชั่วโมง',
            location: 'ออนไลน์ผ่าน Zoom',
            format: 'ออนไลน์ (Online)',
            instructor: {
              name: 'อ. สมหญิง พัฒนา',
              role: 'Senior Developer',
              avatar: 'https://cdn.quasar.dev/img/avatar2.jpg',
            },
            price: 1500,
            totalSeats: 30,
            registeredSeats: 15,
            courseOutline: ['Vue 3 Basics', 'Composition API', 'Quasar Components'],
            objectives: ['สร้างเว็บได้', 'เข้าใจ Component'],
            prerequisite: ['HTML/CSS/JS พื้นฐาน'],
          },
        ];
      } finally {
        this.isLoading = false;
      }
    },

    async fetchCourseById(id: number) {
      const existingCourse = this.courses.find((c) => c.id === id);
      if (existingCourse) return existingCourse;

      this.isLoading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
      } finally {
        this.isLoading = false;
      }
    },

    // =====================================
    // ฟังก์ชันใหม่: ระบบประมวลผลการลงทะเบียน
    // =====================================
    async registerCourse(courseId: number, isWaitingList: boolean) {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const course = this.courses.find((c) => c.id === courseId);
      if (!course) throw new Error('ไม่พบข้อมูลหลักสูตร');

      const alreadyEnrolled = this.enrolledCourses.find(c => c.courseId === courseId);
      if (alreadyEnrolled) throw new Error('ท่านลงทะเบียนหลักสูตรนี้ไปแล้ว');

      const newEnrollment: EnrolledCourse = {
        id: Date.now(),
        courseId: course.id,
        title: course.title,
        date: course.date,
        time: course.time,
        status: isWaitingList ? 'รอคิวสำรอง' : 'รอเข้าอบรม',
        statusCode: isWaitingList ? 'waiting' : 'registered',
        image: course.image || '',
        canCancel: true,
        canConfirm: !isWaitingList,
        isOnline: course.format.includes('ออนไลน์')
      };

      this.enrolledCourses.push(newEnrollment);

      if (!isWaitingList) {
        course.registeredSeats += 1;
      }
    },
    // =====================================
    // ฟังก์ชันใหม่: ยกเลิกการลงทะเบียน
    // =====================================
    async cancelEnrollment(enrollmentId: number) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const idx = this.enrolledCourses.findIndex((e) => e.id === enrollmentId);

      if (idx !== -1) {
        // แก้ไข: ดึงออบเจ็กต์ออกมาก่อนเพื่อหลีกเลี่ยง Error 'undefined'
        const enrollment = this.enrolledCourses[idx];
        if (enrollment) {
          enrollment.statusCode = 'cancelled';
          enrollment.status = 'ยกเลิกการลงทะเบียนแล้ว';
          enrollment.canCancel = false;
          enrollment.canConfirm = false;

          // คืนที่นั่งให้คอร์สหลัก
          const course = this.courses.find((c) => c.id === enrollment.courseId);
          if (course && course.registeredSeats > 0) course.registeredSeats -= 1;
        }
      }
    },

    // =====================================
    // ฟังก์ชันใหม่: ยืนยันการเข้าร่วม
    // =====================================
    async confirmEnrollmentAttendance(enrollmentId: number) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const idx = this.enrolledCourses.findIndex((e) => e.id === enrollmentId);

      if (idx !== -1) {
        // แก้ไข: ดึงออบเจ็กต์ออกมาก่อนเพื่อหลีกเลี่ยง Error 'undefined'
        const enrollment = this.enrolledCourses[idx];
        if (enrollment) {
          enrollment.statusCode = 'confirmed';
          enrollment.status = 'ยืนยันเข้าร่วมแล้ว';
          enrollment.canCancel = false;
          enrollment.canConfirm = false;
        }
      }
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