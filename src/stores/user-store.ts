import { acceptHMRUpdate, defineStore } from 'pinia';
import type { User, CreateUserRequest, UpdateUserRequest } from 'src/models/user'; //import form models/user.ts
import { api } from 'src/boot/axios';

export const useUserStore = defineStore('user', {
  //สร้าง store ชื่อ user
  state: () => ({
    profile: null as User | null,
    usersList: [] as User[],
  }),

  actions: {
    $reset() {
      this.profile = null;
      this.usersList = [];
    }, //reset store  ล้างข้อมูลทั้งหมดของ ใน store เช่น ตอน logout

    async fetchUsers(force = false) {
      if (!force && this.usersList.length > 0) return;
      try {
        const response = await api.get('/users');
        this.usersList = response.data as User[];
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    },
    //ถ้า force = false และมีข้อมูลอยู่แล้ว → ไม่โหลดซ้ำ
    //ถ้า force = true → โหลดใหม่เสมอ
    //โหลดครั้งแรก
    //refresh data

    async addUser(data: CreateUserRequest) {
      //ชนิดข้อมูลแบบ CreateUserRequest
      await api.post('/users', data);
      await this.fetchUsers(true);
    },

    async updateUser(id: number, data: UpdateUserRequest) {
      await api.patch(`/users/${id}`, data);
      await this.fetchUsers(true);
    },

    async updateUserRole(id: number, role: string) {
      //ส่งแค่ { role }
      //ใช้เฉพาะเปลี่ยนสิทธิ์ เช่น admin/user
      await api.patch(`/users/${id}`, { role });
      await this.fetchUsers(true);
    },

    async deleteUser(userId: number) {
      //ใช้เฉพาะลบ user
      await api.delete(`/users/${userId}`);
      await this.fetchUsers(true);
    },

    async updateProfile(data: UpdateUserRequest) {
      if (!this.profile?.id) throw new Error('ไม่พบข้อมูลผู้ใช้');
      await api.patch(`/users/${this.profile.id}`, data);
      Object.assign(this.profile, data);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
