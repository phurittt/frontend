import { acceptHMRUpdate, defineStore } from 'pinia';
import type { CertificateIssuance, CreateCertificateIssuanceDto } from 'src/models/certificate';

export const useCertificateStore = defineStore('certificate', {
  state: () => ({
    certificates: [] as CertificateIssuance[],
    isLoading: false,
    selectedCertificate: null as CertificateIssuance | null,
  }),

  getters: {
    getCertificateByCourseId: (state) => (courseId: number) => {
      return state.certificates.find((c) => c.courseId === courseId);
    },
  },

  actions: {
    async fetchCertificates() {
      this.isLoading = true;
      try {
        // จำลองการรอ API โหลดข้อมูล 0.5 วินาที
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock Data - ข้อมูลตัวอย่าง
        this.certificates = [
          {
            id: 1,
            courseId: 1,
            courseName: 'AI Marketing: Stepping into the Professional Digital Marketing',
            year: '2569',
            duration: '24 ก.พ. 2569 ถึง 25 ก.พ. 2569',
            regisOpenDate: '10 ก.พ. 2569',
            regisCloseDate: '20 ก.พ. 2569',
            manager: 'นายอนุสูร ธรรมนิตย์',
            registrationFee: 1500,
            totalSeats: 50,
            seatReserve: 10,
            participants: [
              {
                id: 1,
                registrantId: 101,
                participantName: 'นายสมชาย ใจดี',
                department: 'แผนกวิศวกรรมซอฟต์แวร์',
                phone: '081-234-5678',
                email: 'somchai@example.com',
                registrationDate: '15/02/2569',
                registrationType: 'บุคลากรภายใน',
                passStatus: 'passed',
                remarks: '',
                issuedCount: 0,
              },
              {
                id: 2,
                registrantId: 102,
                participantName: 'นางสาวจรา สมเด็จ',
                department: 'แผนกการตลาด',
                phone: '081-987-6543',
                email: 'jarasomdet@example.com',
                registrationDate: '16/02/2569',
                registrationType: 'บุคลากรภายนอก',
                passStatus: 'passed',
                remarks: '',
                issuedCount: 0,
              },
            ],
            participantSummary: {
              attended: 73,
              notAttended: 0,
              cancelled: 0,
            },
            certificateStatus: {
              status: 'no-create',
            },
          },
        ];
      } catch (error) {
        console.error('Error fetching certificates:', error);
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async saveCertificateIssuance(certificate: CertificateIssuance) {
      try {
        // จำลองการ save ข้อมูล
        await new Promise((resolve) => setTimeout(resolve, 500));

        const now = new Date();
        const dateStr = now.toLocaleDateString('th-TH', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
        const timeStr = now.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        if (certificate.id) {
          // Update existing certificate
          const index = this.certificates.findIndex((c) => c.id === certificate.id);
          if (index !== -1) {
            this.certificates[index] = {
              ...certificate,
              managedAt: dateStr,
              managedTime: timeStr,
              managedBy: 'เหนือภพ อวกาศ', // TODO: ดึงจากผู้ใช้ปัจจุบัน
            };
          }
        } else {
          // Create new certificate
          certificate.id = Math.max(...this.certificates.map((c) => c.id || 0), 0) + 1;
          this.certificates.push({
            ...certificate,
            managedAt: dateStr,
            managedTime: timeStr,
            managedBy: 'เหนือภพ อวกาศ',
          });
        }
      } catch (error) {
        console.error('Error saving certificate:', error);
        throw error;
      }
    },

    setCertificateData(certificate: CertificateIssuance) {
      this.selectedCertificate = certificate;
    },

    resetSelectedCertificate() {
      this.selectedCertificate = null;
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCertificateStore, import.meta.hot));
}
