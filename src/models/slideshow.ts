export interface SlideShow {
  id: number;
  projectId: number; // เก็บแค่ ID โครงการ
  courseId: number; // เก็บแค่ ID หลักสูตร
  imageUrl: string;
  isActive: boolean;
}

// ใช้สำหรับแสดงผลหน้าจอ (ดึงข้อมูลมาประกอบร่างแล้ว)
export interface SlideShowDisplay extends SlideShow {
  courseName: string;
  projectName: string;
  trainingDate: string;
  trainingTime: string;
}

export interface CreateSlideShowDto {
  projectId: number | null;
  courseId: number | null;
  imageUrl: string;
  isActive: boolean;
}
