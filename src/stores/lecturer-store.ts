import { defineStore } from 'pinia';
import type { Lecturer, CreateLecturerDto } from '../models/lecturer';

export const useLecturerStore = defineStore('lecturer', {
  state: () => ({
    lecturers: [] as Lecturer[],
    loading: false,
  }),

  actions: {
    fetchLecturers() {
      this.loading = true;
      try {
        if (this.lecturers.length === 0) {
          // ข้อมูลจำลองอิงตามรูปภาพของคุณ
          this.lecturers = [
            { id: 1, fullName: 'มหินทร แซ่เจิน', organization: 'สำนักคอมพิวเตอร์', nationalId: '', address: '', expertise: { microsoftOffice: [], webDesign: [], programming: ['Python'], dataAnalysis: [], network: [] }, otherExpertise: '' },
            { id: 2, fullName: 'ร่ำรวย มารวย', organization: 'สำนักคอมพิวเตอร์', nationalId: '', address: '', expertise: { microsoftOffice: [], webDesign: [], programming: ['Java'], dataAnalysis: [], network: [] }, otherExpertise: '' },
            { id: 3, fullName: 'คริส ทิน', organization: 'บริษัทไมโครซอฟท์', nationalId: '', address: '', expertise: { microsoftOffice: [], webDesign: [], programming: ['C++'], dataAnalysis: [], network: [] }, otherExpertise: '' },
            { id: 4, fullName: 'บ็อบ โมเดน', organization: 'สำนักคอมพิวเตอร์', nationalId: '', address: '', expertise: { microsoftOffice: [], webDesign: [], programming: [], dataAnalysis: [], network: ['Network'] }, otherExpertise: '' },
            { id: 5, fullName: 'เกรท ดิน', organization: 'มหาวิทยาลัยศรีปทุม', nationalId: '', address: '', expertise: { microsoftOffice: [], webDesign: [], programming: [], dataAnalysis: [], network: [] }, otherExpertise: 'Canva' },
            { id: 6, fullName: 'สมปอง ลิม', organization: 'สำนักคอมพิวเตอร์', nationalId: '', address: '', expertise: { microsoftOffice: [], webDesign: [], programming: [], dataAnalysis: [], network: [] }, otherExpertise: 'AI' },
          ];
        }
      } finally {
        this.loading = false;
      }
    },

    createLecturer(data: CreateLecturerDto) {
      this.loading = true;
      try {
        const newId = Date.now();
        this.lecturers.unshift({ ...data, id: newId });
      } finally {
        this.loading = false;
      }
    },

    updateLecturer(id: number, data: CreateLecturerDto) {
      this.loading = true;
      try {
        const index = this.lecturers.findIndex(l => l.id === id);
        if (index !== -1) {
          this.lecturers[index] = { ...this.lecturers[index], ...data } as Lecturer;
        }
      } finally {
        this.loading = false;
      }
    },

    deleteLecturer(id: number) {
      this.loading = true;
      try {
        this.lecturers = this.lecturers.filter(l => l.id !== id);
      } finally {
        this.loading = false;
      }
    }
  }
});
