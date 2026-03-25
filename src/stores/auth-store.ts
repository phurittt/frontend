import { defineStore, acceptHMRUpdate } from 'pinia';
import { useUserStore } from './user-store';
import type { User } from 'src/models/user';
import type { RegisterDto, AuthResponse } from 'src/models/auth';
import { api } from 'src/boot/axios';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isLoggedIn: !!localStorage.getItem('token'),
    token: localStorage.getItem('token'),
  }),

  actions: {
    async register(dto: RegisterDto) {
      try {
        console.log('[Auth] Registering with DTO...', dto);

        // แปลงไฟล์รูปโปรไฟล์เป็น base64 string (ถ้ามี)
        let profilePictureStr: string | undefined = undefined;
        if (dto.profilePic) {
          profilePictureStr = await this.fileToBase64(dto.profilePic);
        }

        const payload = {
          username: dto.username,
          password: dto.password,
          firstName: dto.firstName,
          lastName: dto.lastName,
          department: dto.department || undefined,
          role: 'participant',
          address: dto.address || undefined,
          province: dto.province || undefined,
          zipcode: dto.zipcode || undefined,
          phone: dto.phone || undefined,
          email: dto.email || undefined,
          profilePicture: profilePictureStr,
          isActive: true,
        };

        const response = await api.post('/auth/register', payload);
        console.log(`[Auth] Registered successfully:`, response.data);

        return true;
      } catch (error) {
        console.error('[Auth] Registration Error:', error);
        throw error;
      }
    },

    fileToBase64(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    },

    async login(username: string, password?: string) {
      try {
        const payload = { username, password: password || '123456' };
        const response = await api.post<AuthResponse>('/auth/login', payload);

        this.isLoggedIn = true;
        this.token = (response.data as any).access_token || (response.data as any).token;
        localStorage.setItem('token', this.token as string);

        const beUser: any = (response.data as any).user;

        const userData: User = {
          id: beUser.id,
          username: beUser.username,
          firstName: beUser.firstName || '',
          lastName: beUser.lastName || '',
          department: beUser.department,
          role: beUser.role || 'participant',
          address: beUser.address,
          province: beUser.province,
          zipcode: beUser.zipcode,
          phone: beUser.phone,
          email: beUser.email,
          profilePicture: beUser.profilePicture,
          isActive: beUser.isActive ?? true,
          createdAt: beUser.createdAt || '',
          updatedAt: beUser.updatedAt || '',
        };

        const userStore = useUserStore();
        userStore.profile = userData;

        return true;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    async initSession() {
      if (this.token) {
        try {
          const response = await api.get('/auth/profile');
          const beUser = response.data;

          const userData: User = {
            id: beUser.id ?? beUser.sub,
            username: beUser.username || beUser.email || '',
            firstName: beUser.firstName || '',
            lastName: beUser.lastName || '',
            department: beUser.department,
            role: beUser.role || 'participant',
            address: beUser.address,
            province: beUser.province,
            zipcode: beUser.zipcode,
            phone: beUser.phone,
            email: beUser.email,
            profilePicture: beUser.profilePicture,
            isActive: beUser.isActive ?? true,
            createdAt: beUser.createdAt || '',
            updatedAt: beUser.updatedAt || '',
          };

          const userStore = useUserStore();
          userStore.profile = userData;
          this.isLoggedIn = true;
        } catch (e) {
          this.logout();
        }
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

        const userData: User = {
          id: googleUser.sub,
          username: googleUser.email || googleUser.name,
          firstName: googleUser.given_name || '',
          lastName: googleUser.family_name || '',
          role: 'participant',
          email: googleUser.email,
          profilePicture: googleUser.picture,
          isActive: true,
          createdAt: '',
          updatedAt: '',
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
      localStorage.removeItem('token');

      const userStore = useUserStore();
      userStore.$reset();

      console.log('[Auth] Logged out');
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAuthStore, import.meta.hot));
}
