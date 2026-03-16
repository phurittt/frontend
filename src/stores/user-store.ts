import { acceptHMRUpdate, defineStore } from 'pinia';
import type { UserProfile } from 'src/models/user';

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null as UserProfile | null,
    usersList: [] as UserProfile[],
  }),

  actions: {
    $reset() {
      this.profile = null;
      this.usersList = [];
    },

    fetchUsers() {
      // โหลดข้อมูลจำลองแค่ครั้งแรกเท่านั้น
      if (this.usersList.length > 0) return;
      this.usersList = [
        {
          id: '1',
          username: 'natty',
          email: 'natty@example.com',
          title: 'นาย',
          firstNameTh: 'นธี',
          lastNameTh: 'กว้างใหญ่',
          phone: '0800000001',
          province: 'กรุงเทพมหานคร',
          organization: 'สำนักคอมพิวเตอร์',
          avatar: '',
          role: 'staff',
        },
        {
          id: '2',
          username: 'kilen',
          email: 'kilen@example.com',
          title: 'นาย',
          firstNameTh: 'กิเลน',
          lastNameTh: 'กลิ่นดิน',
          phone: '0800000002',
          province: 'กรุงเทพมหานคร',
          organization: 'สำนักคอมพิวเตอร์',
          avatar: '',
          role: 'admin',
        },
        {
          id: '3',
          username: 'james',
          email: 'james@example.com',
          title: 'นาย',
          firstNameTh: 'เจม',
          lastNameTh: 'วาน',
          phone: '0800000003',
          province: 'กรุงเทพมหานคร',
          organization: 'สำนักคอมพิวเตอร์',
          avatar: '',
          role: 'admin',
        },
      ];
    },

    // --- เพิ่มฟังก์ชันจัดการข้อมูลตรงนี้ ---
    addUser(user: Omit<UserProfile, 'id'>) {
      const newId = String(this.usersList.length + 1 + Math.floor(Math.random() * 100));
      this.usersList.push({ ...user, id: newId });
    },

    updateUser(updatedUser: UserProfile) {
      const index = this.usersList.findIndex((u) => u.id === updatedUser.id);
      if (index !== -1) {
        this.usersList[index] = { ...updatedUser };
      }
    },

    deleteUser(userId: string) {
      this.usersList = this.usersList.filter((u) => u.id !== userId);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
