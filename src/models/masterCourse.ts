export interface MasterCourse {
  id: number;
  name: string; // ชื่อหลักสูตร
  category: string; // ประเภทหลักสูตร
  objectives: string; // วัตถุประสงค์
  content: string; // เนื้อหา
  prerequisites: string; // ความรู้พื้นฐานผู้เข้าอบรม
  duration: string; // ระยะเวลาที่ใช้
  show_on_web: boolean; // สถานะการแสดงผล
}

export type CreateMasterCourseDto = Omit<MasterCourse, 'id'>;
