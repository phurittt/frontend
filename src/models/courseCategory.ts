export interface CourseCategory {
  id: number;
  code: string; // รหัสประเภท
  name: string; // ชื่อประเภทหลักสูตร
  description?: string; // คำอธิบาย
  courseCount?: number; // จำนวนหลักสูตรที่อยู่ในหมวดนี้ (ไว้แสดงในตาราง)
  created_at?: string;
}

export interface CreateCourseCategoryDto {
  code: string;
  name: string;
  description?: string;
}
