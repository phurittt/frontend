import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      username: null as string | null,
      avatar: 'https://cdn.quasar.dev/img/cat.jpg',
    },
    isLoggedIn: false,
  }),

  actions: {
    async login(username: string) {
      try {
        // จำลองการทำงานของ Network
        await new Promise((resolve) => setTimeout(resolve, 500));

        this.user.username = username;
        this.isLoggedIn = true;

        return Promise.resolve(true);
      } catch (error) {
        this.isLoggedIn = false;
        throw error;
      }
    },
    logout() {
      this.user.username = null;
      this.isLoggedIn = false;

      // (Optional) ล้างค่าใน LocalStorage/SessionStorage หากมีการเก็บไว้
      // localStorage.removeItem('token');

      console.log('User logged out');
    },
  },
});
