import { acceptHMRUpdate, defineStore } from 'pinia';

export interface Course {
  id: number;
  title: string; // ชื่อหลักสูตร
  description: string; // คำอธิบายย่อ (สำหรับหน้าการ์ด)
  image?: string; // รูปปกหลักสูตร

  // --- ข้อมูลเวลาและสถานที่ ---
  date: string; // วันที่อบรม (เช่น 24 ก.พ. 69)
  time: string; // เวลา (เช่น 08:30 - 16:30 น.)
  duration: string; // ระยะเวลา (เช่น 6 ชั่วโมง)
  location: string; // สถานที่จัด

  // --- ข้อมูลการลงทะเบียน ---
  price: number; // ราคา (0 = FREE)
  totalSeats: number; // จำนวนที่เปิดรับ
  registeredSeats: number; // จำนวนที่ลงทะเบียนแล้ว

  // --- เนื้อหาละเอียด (Array เพราะต้องวน Loop แสดงเป็นข้อๆ) ---
  courseOutline: string[]; // เนื้อหาของหลักสูตร
  objectives: string[]; // วัตถุประสงค์
  prerequisite: string[]; // พื้นฐานความรู้ของผู้เข้าอบรม
}

export const useCourseStore = defineStore('course', {
  state: () => ({
    courses: [] as Course[],
    isLoading: false,
  }),

  getters: {
    // Getter สำหรับคำนวณที่นั่งว่าง (เผื่อใช้)
    availableSeats: (state) => (courseId: number) => {
      const course = state.courses.find((c) => c.id === courseId);
      return course ? course.totalSeats - course.registeredSeats : 0;
    },
    featuredCourse: (state) => state.courses[0],
  },

  actions: {
    async fetchCourses() {
      this.isLoading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock Data ตามรูปภาพ AI Marketing เป๊ะๆ
        this.courses = [
          {
            id: 1,
            title:
              'AI Marketing: stepping into the Professional Digital Marketing ยกระดับสู่มืออาชีพการตลาดดิจิทัล',
            description:
              'รู้จักเทรนด์ AI เครื่องมือการตลาดดิจิทัลยุคใหม่ และการใช้ AI ในการวิเคราะห์ข้อมูลแม่นยำ โดนเป้าหมาย',
            image: 'https://cdn.quasar.dev/img/parallax2.jpg', // ใส่ URL รูปจริงที่นี่

            date: '24 ก.พ. 2569',
            time: '08:30 - 16:30 น.',
            duration: '6 ชั่วโมง',
            location: 'ห้องประชุม 201 ชั้น 2 อาคารสำนักหอสมุด มหาวิทยาลัยบูรพา',

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
          // เพิ่มคอร์สอื่นๆ (Mock) ให้ครบตามต้องการ...
          {
            id: 2,
            title: 'การพัฒนาเว็บไซต์ด้วย Vue.js',
            description: 'เรียนรู้การสร้างเว็บแอปพลิเคชันสมัยใหม่ด้วย Vue.js และ Quasar Framework',
            image: 'https://cdn.quasar.dev/img/parallax1.jpg',
            date: '23 ธ.ค. 2567',
            time: '09:00-16:00',
            duration: '6 ชั่วโมง',
            location: 'ห้องปฏิบัติการคอมพิวเตอร์ A',
            price: 0,
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
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCourseStore, import.meta.hot));
}
