export interface ProjectType {
  id?: number;
  name: string;
  regis_fee: number; // 0 หรือ 1
  description?: string;
  created_at?: string;
}

// สำหรับตอนส่งข้อมูลไปสร้างใหม่
export interface CreateProjectTypeDto {
  name: string;
  regis_fee: number;
  description?: string;
}
