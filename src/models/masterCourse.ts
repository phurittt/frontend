export interface MasterCourse {
  id: number;
  title: string; // ชื่อหลักสูตร
  objective: string; // วัตถุประสงค์
  content: string; // เนื้อหา
  required_knowledge: string; // ความรู้พื้นฐานผู้เข้าอบรม
  duration_hours: number; // ระยะเวลาที่ใช้ (ชั่วโมง)
  is_visible: number | boolean; // สถานะการแสดงผล (Backend ส่ง 1/0)
  course_type_id: number; // ID ของประเภทหลักสูตร
  courseType?: {
    id: number;
    name: string;
    code: string;
    description: string;
  };
}

export type CreateMasterCourseDto = Omit<MasterCourse, 'id' | 'courseType'>;
export type UpdateMasterCourseDto = Partial<CreateMasterCourseDto>;
