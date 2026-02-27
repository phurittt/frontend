import type { UserProfile, UserBase } from './user';

/** Register DTO: ใช้สำหรับส่งข้อมูลสมัครสมาชิกจากฟอร์มไปหา Backend */
export interface RegisterDto extends UserBase {
  password?: string;
  verifyPassword?: string; // ใช้เช็คความถูกต้องใน UI เท่านั้น
  profilePic?: File | null; // รับมาเป็นไฟล์เพื่อเตรียมอัปโหลด
}

/** Auth Response: รูปแบบข้อมูลที่ได้รับกลับมาหลังสมัครหรือล็อกอิน */
export interface AuthResponse {
  token: string;
  user: UserProfile;
}
