import { defineStore, acceptHMRUpdate } from 'pinia';
import { useUserStore } from './user-store';
import type { UserProfile } from 'src/models/user';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    token: null as string | null,
  }),

  actions: {
    async login(username: string) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        this.isLoggedIn = true;
        this.token = 'mock-jwt-token';

        const userData: UserProfile = {
          username: username,
          avatar: 'https://cdn.quasar.dev/img/cat.jpg',
          role: 'student',
          email: 'student@mail.com',
        };

        const userStore = useUserStore();
        userStore.profile = userData;

        console.log(`[Auth] Login successful: ${username}`);
        return true;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    async loginWithGoogle(accessToken: string) {
      try {
        // นำ Access Token ไปขอข้อมูลโปรไฟล์จาก Google
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const googleUser = response.data;

        // ตั้งค่าสถานะการเข้าสู่ระบบ
        this.isLoggedIn = true;
        this.token = accessToken; // หรือจะใช้ JWT จาก Backend จริง

        // เตรียมข้อมูล UserProfile ให้ตรงกับ Model
        const userData: UserProfile = {
          username: googleUser.name, // ใช้ชื่อจาก Google
          avatar: googleUser.picture, // ใช้รูปโปรไฟล์จาก Google
          role: 'student', // กำหนด Role เริ่มต้น
          email: googleUser.email,
        };

        // อัปเดตข้อมูลใน User Store
        const userStore = useUserStore();
        userStore.profile = userData;

        console.log(`[Auth] Google Login successful: ${googleUser.name}`);
        return true;
      } catch (error) {
        console.error('[Auth] Google Login failed:', error);
        this.logout();
        throw error;
      }
    },

    logout() {
      this.isLoggedIn = false;
      this.token = null;

      const userStore = useUserStore();
      userStore.$reset();

      console.log('[Auth] Logged out');
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
