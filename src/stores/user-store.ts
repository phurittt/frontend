import { defineStore } from 'pinia';
import axios from 'axios';

// กำหนด Type ของข้อมูล User ให้ตรงกับ Backend
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[],
  }),
  actions: {
    // 1. Read (ดึงข้อมูลทั้งหมด)
    async fetchUsers() {
      const response = await axios.get('http://localhost:3000/users');
      this.users = response.data;
    },

    // 2. Create (สร้างใหม่)
    async createUser(form: { firstName: string; lastName: string }) {
      await axios.post('http://localhost:3000/users', form);
      await this.fetchUsers(); // โหลดข้อมูลใหม่หลังบันทึก
    },

    // 3. Update (แก้ไข)
    async updateUser(id: number, form: { firstName: string; lastName: string }) {
      await axios.patch(`http://localhost:3000/users/${id}`, form);
      await this.fetchUsers();
    },

    // 4. Delete (ลบ)
    async deleteUser(id: number) {
      await axios.delete(`http://localhost:3000/users/${id}`);
      await this.fetchUsers();
    },
  },
});
