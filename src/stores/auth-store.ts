import { defineStore, acceptHMRUpdate } from 'pinia';
import { useUserStore } from './user-store';
import type { UserProfile } from 'src/models/user';

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
