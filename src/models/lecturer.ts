export interface LecturerExpertise {
  microsoftOffice: string[];
  webDesign: string[];
  programming: string[];
  dataAnalysis: string[];
  network: string[];
}

export interface Lecturer {
  id: number;
  fullName: string;           // ชื่อ - นามสกุล
  organization: string;       // หน่วยงาน
  nationalId: string;         // เลขประจำตัวประชาชน
  address: string;            // ที่อยู่
  expertise: LecturerExpertise; // ความเชี่ยวชาญ (แยกตามหมวดหมู่)
  otherExpertise: string;     // ความเชี่ยวชาญเพิ่มเติม
}

export type CreateLecturerDto = Omit<Lecturer, 'id'>;
