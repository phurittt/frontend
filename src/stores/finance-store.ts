import { acceptHMRUpdate, defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export interface FinanceRecord {
  id: number;
  projectId: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
}

export const useFinanceStore = defineStore('finance', {
  state: () => ({
    records: [] as FinanceRecord[],
    isLoading: false,
  }),

  getters: {
    incomeRecords: (state) => state.records.filter((r) => r.type === 'income'),
    expenseRecords: (state) => state.records.filter((r) => r.type === 'expense'),
  },

  actions: {
    async fetchByProject(projectId: number) {
      this.isLoading = true;
      try {
        const res = await api.get(`/finances/project/${projectId}`);
        this.records = (res.data as any[]).map((r) => ({
          id: r.id,
          projectId: r.projectId,
          type: r.type,
          amount: Number(r.amount),
          description: r.description,
          date: r.date,
        }));
      } catch (err) {
        console.error('Failed to fetch finance records:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async addRecord(dto: {
      projectId: number;
      type: 'income' | 'expense';
      amount: number;
      description: string;
      date: string;
    }) {
      const res = await api.post<FinanceRecord>('/finances', dto);
      const r = res.data;
      this.records.push({
        id: r.id,
        projectId: r.projectId,
        type: r.type,
        amount: Number(r.amount),
        description: r.description,
        date: r.date,
      });
    },

    async removeRecord(id: number) {
      await api.delete(`/finances/${id}`);
      this.records = this.records.filter((r) => r.id !== id);
    },

    clearRecords() {
      this.records = [];
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useFinanceStore, import.meta.hot));
}
