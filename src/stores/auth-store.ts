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

        // จำลองการยิง API (ในอนาคตเปลี่ยนเป็น axios.post('/auth/register', dto))
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // จัดการรูปภาพ (ถ้าเป็นไฟล์ดิบ ให้ทำเป็น Mock URL สำหรับแสดงผลใน App)
        let avatarUrl = 'https://cdn.quasar.dev/img/boy-avatar.png';
        if (dto.profilePic instanceof File) {
          avatarUrl = URL.createObjectURL(dto.profilePic);
        }

        // จำลอง Response ที่ได้รับกลับจาก Backend หลังสมัครสำเร็จ
        // ปกติ Backend จะส่ง Token และ Profile ข้อมูลที่บันทึกแล้วกลับมา
        const mockResponse: AuthResponse = {
          token: 'mock-jwt-token-after-register',
          user: {
            ...dto, // กระจายข้อมูลที่ส่งไป
            id: 'USR-' + Math.floor(Math.random() * 1000), // backend จะ gen id ให้
            avatar: avatarUrl,
            role: 'student', // กำหนด role เริ่มต้น
          },
        };

        // บันทึกข้อมูลลง State ของ Auth และ User Store
        this.token = mockResponse.token;
        this.isLoggedIn = true;

        const userStore = useUserStore();
        // ลบ password และ verifyPassword ออกก่อนเก็บลง Store เพื่อความปลอดภัย
        const { password, verifyPassword, profilePic, ...safeProfile } = mockResponse.user as any;
        userStore.profile = safeProfile as UserProfile;

        console.log(`[Auth] Registered as: ${dto.username}`);
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
