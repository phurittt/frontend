import { acceptHMRUpdate, defineStore } from 'pinia';
import type { Course } from 'src/models/course';

export const useCourseStore = defineStore('course', {
  state: () => ({
    courses: [] as Course[],
    isLoading: false,

    // เพิ่ม State สำหรับตะกร้าและรายการโปรด
    cart: [] as Course[],
    favoriteIds: [] as number[], // เก็บแค่ ID
  }),

  getters: {
    availableSeats: (state) => (courseId: number) => {
      const course = state.courses.find((c) => c.id === courseId);
      return course ? course.totalSeats - course.registeredSeats : 0;
    },
    featuredCourse: (state) => state.courses[0],

    // Getters สำหรับหน้า List ย่อยต่างๆ
    openCourses: (state) => state.courses.filter((c) => c.totalSeats > c.registeredSeats),
    freeCourses: (state) => state.courses.filter((c) => c.price === 0),

    // ตรวจสอบว่าคอร์สนี้อยู่ใน Favorite หรือไม่
    isFavorite: (state) => (courseId: number) => state.favoriteIds.includes(courseId),

    // สรุปยอดเงินในตะกร้า
    cartTotal: (state) => state.cart.reduce((total, course) => total + course.price, 0),
  },

  actions: {
    async fetchCourses() {
      this.isLoading = true;
      try {
        // จำลองการรอ API โหลดข้อมูล 0.5 วินาที
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock Data ตาม Model เป๊ะๆ
        this.courses = [
          {
            id: 1,
            title:
              'AI Marketing: stepping into the Professional Digital Marketing ยกระดับสู่มืออาชีพการตลาดดิจิทัล',
            description:
              'รู้จักเทรนด์ AI เครื่องมือการตลาดดิจิทัลยุคใหม่ และการใช้ AI ในการวิเคราะห์ข้อมูลแม่นยำ โดนเป้าหมาย',
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
            registeredSeats: 70, // ในรูปคือเต็มแล้ว (70/70)

            courseOutline: [
              'รู้จักเทรนด์ AI เครื่องมือการตลาดดิจิทัลยุคใหม่',
              'AI ในการวิเคราะห์ข้อมูล แม่นยำ โดนเป้าหมาย ด้วย Google Analytics',
              'การใช้ AI ปั้นคอนเทนต์เหนือชั้น สร้างประสิทธิภาพสูงสุด',
              'กลยุทธ์ AI ขับเคลื่อนแคมเปญ สู่ความสำเร็จ',
              'การประเมินผลประกอบการ ศีลธรรม และจริยธรรมในการวางกลยุทธ์โดย AI',
            ],
            objectives: [
              'เพื่อให้ผู้เข้าอบรมมีความรู้และความเข้าใจ เกี่ยวกับบทบาทและเครื่องมือ AI ต่างๆ ที่สำคัญในงานการตลาดดิจิทัลยุคใหม่',
              'เพื่อให้ผู้เรียนมีทักษะในการใช้เครื่องมือ AI ในการวางแผนกลยุทธ์ สร้างคอนเทนต์ และวิเคราะห์ข้อมูลได้อย่างมืออาชีพ',
              'เพื่อยกระดับกระบวนการทำงาน (Workflow Optimization) โดยการนำ AI มาช่วยลดเวลาการทำงานที่ซ้ำซ้อน',
              'เพื่อเตรียมความพร้อมให้องค์กรและบุคลากรปรับตัวเข้ากับเทคโนโลยีใหม่ๆ',
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

    // ดึงข้อมูลแค่คอร์สเดียว
    async fetchCourseById(id: number) {
      const existingCourse = this.courses.find((c) => c.id === id);
      if (existingCourse) return existingCourse;

      this.isLoading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        // จำลองการดึง API แบบระบุ ID
        // const response = await api.get(`/courses/${id}`);
        // return response.data;
      } finally {
        this.isLoading = false;
      }
    },

    // Action สลับสถานะหัวใจ
    toggleFavorite(courseId: number) {
      const index = this.favoriteIds.indexOf(courseId);
      if (index === -1) {
        this.favoriteIds.push(courseId); // เพิ่มเข้า
      } else {
        this.favoriteIds.splice(index, 1); // เอาออก
      }
    },

    // Action จัดการตะกร้า
    addToCart(course: Course) {
      // เช็คว่าเคยหยิบใส่ตะกร้าไปแล้วหรือยัง
      if (!this.cart.find((c) => c.id === course.id)) {
        this.cart.push(course);
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCourseStore, import.meta.hot));
}
