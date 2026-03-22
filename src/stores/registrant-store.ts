import { defineStore } from 'pinia';
import { useUserStore } from './user-store'; // ดึง Store กลางมาใช้
import type { Registrant, CreateRegistrantDto, RegistrantStatus } from '../models/registrant';

export const useRegistrantStore = defineStore('registrant', {
  state: () => ({
    rawRegistrants: [] as Registrant[], // เปลี่ยนชื่อเป็น raw เพื่อเก็บข้อมูลดิบ
    loading: false,
  }),

  getters: {
    // Getter ตัวนี้จะถูกหน้าเว็บดึงไปใช้แทน มันจะทำหน้าที่ Join ข้อมูลให้แบบ Real-time
    registrants: (state): Registrant[] => {
      const userStore = useUserStore();

      return state.rawRegistrants.map((reg) => {
        // ถ้ามี userId ให้ไปดึงข้อมูลจากระบบมาทับ
        if (reg.userId) {
          const user = userStore.usersList.find((u) => u.id === reg.userId);
          if (user) {
            return {
              ...reg,
              fullName: `${user.title}${user.firstNameTh} ${user.lastNameTh}`,
              department: user.organization || '-',
              phone: user.phone,
              email: user.email,
            };
          }
        }
        // ถ้าไม่มี userId (คีย์มือ) หรือหาไม่เจอ ก็คืนค่าเดิมที่เคยคีย์ไว้
        return reg;
      });
    },
  },

  actions: {
    async fetchRegistrants() {
      this.loading = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (this.rawRegistrants.length === 0) {
          this.rawRegistrants = [
            // สังเกตว่าคนที่มี userId เราไม่ต้องเก็บชื่อ, เมล, เบอร์โทร ไว้ในนี้เลยครับ!
            {
              id: 1001,
              projectId: 1,
              courseId: 1,
              userId: '1',
              type: 'บุคลากรภายใน',
              registerDate: '15/01/2569',
              status: 'ชำระเงินเรียบร้อย',
            },
            {
              id: 1002,
              projectId: 1,
              courseId: 1,
              userId: '2',
              type: 'บุคลากรภายใน',
              registerDate: '16/01/2569',
              status: 'รอตรวจสอบ',
            },

            // ส่วนคนที่แอดมินคีย์มือ (ไม่มี userId) เรายังต้องเก็บข้อมูลไว้เหมือนเดิม
            {
              id: 1003,
              projectId: 1,
              courseId: 1,
              userId: null,
              fullName: 'นายสมเกียรติ ขยันดี',
              department: 'กองคลัง',
              phone: '0898888888',
              email: 'somkiat@test.com',
              type: 'บุคลากรภายใน',
              registerDate: '17/01/2569',
              status: 'รอชำระเงิน',
            },

            {
              id: 1004,
              projectId: 2,
              courseId: 2,
              userId: '3',
              type: 'นิสิต',
              registerDate: '02/02/2569',
              status: 'ชำระเงินเรียบร้อย',
            },
            {
              id: 1005,
              projectId: 2,
              courseId: 2,
              userId: '4',
              type: 'บุคคลทั่วไป',
              registerDate: '03/02/2569',
              status: 'ชำระเงินเรียบร้อย',
            },
          ];
        }
      } finally {
        this.loading = false;
      }
    },

    addRegistrant(data: CreateRegistrantDto) {
      const newRegistrant: Registrant = {
        id: Date.now(),
        projectId: data.projectId,
        courseId: data.courseId,
        userId: data.userId || null,
        type: data.type,
        registerDate: new Date().toLocaleDateString('th-TH'),
        status: 'รอชำระเงิน',

        // เซฟข้อมูลส่วนตัวลงไป "เฉพาะ" กรณีที่ไม่มี userId เท่านั้น
        ...(!data.userId && {
          fullName: `${data.title}${data.firstName} ${data.lastName}`,
          department: data.department,
          phone: data.phone,
          email: data.email,
        }),
      };

      this.rawRegistrants.unshift(newRegistrant);
    },

    updateStatus(id: number, newStatus: RegistrantStatus) {
      const registrant = this.rawRegistrants.find((r) => r.id === id);
      if (registrant) {
        registrant.status = newStatus;
      }
    },

    deleteRegistrant(id: number) {
      this.rawRegistrants = this.rawRegistrants.filter((r) => r.id !== id);
    },
  },
});
