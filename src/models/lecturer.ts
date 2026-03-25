export interface Lecturer {
  id: number;
  firstName: string;
  lastName: string;
  department: string;
  expertise: string; // ความเชี่ยวชาญ (เป็น string จาก backend)
  additionalInfo?: string; // ข้อมูลเพิ่มเติม/ตำแหน่ง
  createdAt?: string;
  updatedAt?: string;
}

export type CreateLecturerDto = Omit<Lecturer, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateLecturerDto = Partial<CreateLecturerDto>;
