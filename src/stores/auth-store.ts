import { defineStore, acceptHMRUpdate } from 'pinia';
import { useUserStore } from './user-store';
import type { UserProfile } from 'src/models/user';
import type { RegisterDto, AuthResponse } from 'src/models/auth';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: false,
    token: null as string | null,
  }),

  actions: {
    async register(dto: RegisterDto) {
      try {
        console.log('[Auth] Registering with DTO...', dto);

        // จำลองการยิง API
        await new Promise((resolve) => setTimeout(resolve, 1500));

        console.log(`[Auth] Registered successfully: ${dto.username}`);

        return true;
      } catch (error) {
        console.error('[Auth] Registration Error:', error);
        throw error;
      }
    },

    async login(username: string) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500));

        this.isLoggedIn = true;
        this.token = 'mock-jwt-token';

        const userData: UserProfile = {
          id: 'USR-001',
          username: username,
          avatar: 'https://cdn.quasar.dev/img/cat.jpg',
          role: 'student',
          email: 'student@mail.com',
          title: 'นาย',
          firstNameTh: 'สมคิด',
          lastNameTh: 'ปิ๊ดปี้ปิ๊ด',
          phone: '0987654321',
          province: 'ชลบุรี',
        };

        const userStore = useUserStore();
        userStore.profile = userData;

        return true;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    async loginWithGoogle(accessToken: string) {
      try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const googleUser = response.data;

        this.isLoggedIn = true;
        this.token = accessToken;

        const userData: UserProfile = {
          id: googleUser.sub,
          username: googleUser.name,
          avatar: googleUser.picture,
          role: 'student',
          email: googleUser.email,
          title: '', // ข้อมูลจาก Google อาจจะไม่ครบ ต้องใส่ค่าเริ่มต้นไว้
          firstNameTh: googleUser.given_name,
          lastNameTh: googleUser.family_name,
          phone: '',
          province: '',
        };

        const userStore = useUserStore();
        userStore.profile = userData;

        console.log(`[Auth] Google Login successful: ${googleUser.name}`);

        return true;
      } catch (error) {
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
