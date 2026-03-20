import { defineStore } from 'pinia';
import type { Registrant, CreateRegistrantDto, RegistrantStatus } from '../models/registrant';

export const useRegistrantStore = defineStore('registrant', {
  state: () => ({
    registrants: [] as Registrant[],
    loading: false,
  }),

  actions: {
    fetchRegistrants() {
      this.loading = true;
      try {
        if (this.registrants.length === 0) {
          // จำลองข้อมูลว่า courseId: 1 คือ Excel, courseId: 2 คือ Word
          this.registrants = [
            {
              id: 1,
              courseId: 1,
              fullName: 'นธี กว้างใหญ่',
              department: 'สำนักคอมพิวเตอร์',
              phone: '080-000-0000',
              type: 'บุคลากรภายใน',
              registerDate: '15/05/2569',
              status: 'ชำระเงินเรียบร้อย',
            },
            {
              id: 2,
              courseId: 1,
              fullName: 'กิเลน กลิ่นดิน',
              department: 'สำนักคอมพิวเตอร์',
              phone: '080-000-0000',
              type: 'บุคลากรภายใน',
              registerDate: '15/05/2569',
              status: 'รอตรวจสอบ',
            },
            {
              id: 3,
              courseId: 1,
              fullName: 'เจม วาน',
              department: 'คณะวิศวกรรมศาสตร์',
              phone: '080-000-0000',
              type: 'นิสิต',
              registerDate: '15/05/2569',
              status: 'รอชำระเงิน',
            },
            {
              id: 4,
              courseId: 2,
              fullName: 'ดิถ แดเนียล',
              department: 'บริษัท เอบีซี จำกัด',
              phone: '080-000-0000',
              type: 'บุคคลทั่วไป',
              registerDate: '15/05/2569',
              status: 'ยกเลิก',
            },
            {
              id: 5,
              courseId: 2,
              fullName: 'แดน ทอร์น',
              department: 'สำนักคอมพิวเตอร์',
              phone: '080-000-0000',
              type: 'บุคลากรภายใน',
              registerDate: '16/05/2569',
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
        courseId: data.courseId, // ผูกกับหลักสูตรที่กำลังเปิดอยู่
        fullName: `${data.title}${data.firstName} ${data.lastName}`,
        department: data.department,
        phone: data.phone,
        type: data.type,
        registerDate: new Date().toLocaleDateString('th-TH'),
        status: 'รอชำระเงิน',
        email: data.email,
      };
      this.registrants.unshift(newRegistrant);
    },

    updateStatus(id: number, newStatus: RegistrantStatus) {
      const registrant = this.registrants.find((r) => r.id === id);
      if (registrant) {
        registrant.status = newStatus;
      }
    },

    deleteRegistrant(id: number) {
      this.registrants = this.registrants.filter((r) => r.id !== id);
    },
  },
});
