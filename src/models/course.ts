export interface Instructor {
  name: string;
  role: string;
  avatar: string;
}

export interface Course {
  id: number;
  title: string; // ชื่อหลักสูตร
  description: string; // คำอธิบายย่อ (สำหรับหน้าการ์ด)
  image?: string; // รูปปกหลักสูตร

  // --- ข้อมูลเวลาและสถานที่ ---
  date: string; // วันที่อบรม (เช่น 24 ก.พ. 69)
  time: string; // เวลา (เช่น 08:30 - 16:30 น.)
  duration: string; // ระยะเวลา (เช่น 6 ชั่วโมง)
  location: string; // สถานที่จัด
  format: string; // รูปแบบการเรียน (เช่น ออฟไลน์ (On-site), ออนไลน์ (Zoom))

  // --- ข้อมูลการลงทะเบียน ---
  price: number; // ราคา (0 = FREE)
  totalSeats: number; // จำนวนที่เปิดรับ
  registeredSeats: number; // จำนวนที่ลงทะเบียนแล้ว

  // --- ข้อมูลวิทยากร ---
  instructor: Instructor; // โครงสร้างข้อมูลวิทยากร

  // --- เนื้อหาละเอียด (Array เพราะต้องวน Loop แสดงเป็นข้อๆ) ---
  courseOutline: string[]; // เนื้อหาของหลักสูตร
  objectives: string[]; // วัตถุประสงค์
  prerequisite: string[]; // พื้นฐานความรู้ของผู้เข้าอบรม
}
