export interface Instructor {
  name: string;
  role: string;
  avatar: string;
}

export interface Course {
  id: number;
  title: string; // ชื่อหลักสูตร (จาก course.title หรือ project.name)
  description: string; // คำอธิบายย่อ (จาก course.objective)
  image?: string; // รูปปกโครงการ (จาก project.coverImage)

  // --- ข้อมูลเวลาและสถานที่ ---
  date: string; // วันที่อบรม (จาก trainingStartDate)
  time: string; // เวลา (จาก trainingStartDate - trainingEndDate)
  duration: string; // ระยะเวลา (จาก course.duration_hours)
  location: string; // สถานที่จัด (จาก project.location)
  format: string; // รูปแบบการเรียน (ออฟไลน์ / ออนไลน์)

  // --- ข้อมูลการลงทะเบียน ---
  price: number; // ราคา (จาก registrationFee, 0 = FREE)
  totalSeats: number; // จำนวนที่เปิดรับ (จาก capacity)
  registeredSeats: number; // จำนวนที่ลงทะเบียนแล้ว (ไม่รวมคิวสำรอง ไม่รวมที่ยกเลิก)
  waitingListCount: number; // จำนวนคนในคิวสำรองปัจจุบัน
  reserveCapacity: number; // จำนวนที่นั่งสำรองสูงสุด (จาก project.reserveCapacity)

  // --- ช่วงเวลารับลงทะเบียน ---
  registrationStartDate?: string; // วันเวลาเปิดรับลงทะเบียน
  registrationEndDate?: string; // วันเวลาปิดรับลงทะเบียน

  // --- สถานะ ---
  isOpen: boolean; // true = status && isVisible (เปิดรับสมัครและแสดงบนเว็บ)

  // --- ข้อมูลวิทยากร ---
  instructor: Instructor;

  // --- เนื้อหาละเอียด ---
  courseOutline: string[]; // เนื้อหา (จาก course.content แยก newline)
  objectives: string[]; // วัตถุประสงค์ (จาก course.objective แยก newline)
  prerequisite: string[]; // พื้นฐานความรู้ (จาก course.required_knowledge แยก newline)
}
