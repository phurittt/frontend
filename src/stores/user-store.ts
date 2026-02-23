import { acceptHMRUpdate, defineStore } from 'pinia';
import type { UserProfile } from 'src/models/user';

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null as UserProfile | null,
  }),

  actions: {
    $reset() {
      this.profile = null;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUserStore, import.meta.hot));
}
