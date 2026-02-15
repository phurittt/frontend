import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    // สถานะล็อกอิน (เริ่มต้นเป็น false)
    isLoggedIn: false,
    // ข้อมูลผู้ใช้จำลอง
    user: {
      username: '',
      avatar: 'https://cdn.quasar.dev/img/cat.jpg',
    },
  }),

  actions: {
    login(username: string) {
      // จำลองการล็อกอินสำเร็จ
      this.isLoggedIn = true;
      this.user.username = username;
    },
    logout() {
      this.isLoggedIn = false;
      this.user.username = '';
    },
  },
});
