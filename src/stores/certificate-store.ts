import { acceptHMRUpdate, defineStore } from 'pinia';
import type { CertificateIssuance, ProjectCertificateSummary } from 'src/models/certificate';
import { api } from 'src/boot/axios';

export const useCertificateStore = defineStore('certificate', {
  state: () => ({
    summaries: [] as ProjectCertificateSummary[],
    isLoading: false,
    selectedIssuance: null as CertificateIssuance | null,
  }),

  getters: {
    getSummaryByProjectId: (state) => (projectId: number) => {
      return state.summaries.find((s) => s.projectId === projectId);
    },
  },

  actions: {
    async fetchSummaries() {
      this.isLoading = true;
      try {
        const response = await api.get('/certificates/projects-summary');
        this.summaries = response.data;
      } catch (error) {
        console.error('Error fetching certificate summaries:', error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchProjectIssuance(projectId: number): Promise<CertificateIssuance> {
      const response = await api.get(`/certificates/project-issuance/${projectId}`);
      const data = response.data as CertificateIssuance;
      this.selectedIssuance = data;
      return data;
    },

    async saveProjectIssuance(
      projectId: number,
      data: {
        createFile: boolean;
        templateImage?: string | null;
        managedBy?: string;
        participants: Array<{
          registrantId: number;
          passStatus: 'passed' | 'not-passed' | 'pending';
          remarks?: string;
        }>;
      },
    ) {
      this.isLoading = true;
      try {
        const response = await api.post(`/certificates/project-issuance/${projectId}`, data);
        await this.fetchSummaries();
        return response.data;
      } catch (error) {
        console.error('Error saving project issuance:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async verifyCertificate(code: string) {
      const response = await api.get(`/certificates/verify/${code}`);
      return response.data;
    },

    setSelectedIssuance(issuance: CertificateIssuance) {
      this.selectedIssuance = issuance;
    },

    clearSelectedIssuance() {
      this.selectedIssuance = null;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCertificateStore, import.meta.hot));
}
