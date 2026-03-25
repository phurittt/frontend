import type { User, UserRole } from './user';

/** Register DTO: ข้อมูลที่ส่งไป backend เพื่อสมัครสมาชิก */
export interface RegisterDto {
  // --- ข้อมูลที่ส่งไป backend ---
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  department?: string;
  role?: UserRole;
  address?: string;
  province?: string;
  zipcode?: string;
  phone?: string;
  email?: string;
  profilePicture?: string;
  isActive?: boolean;

  // --- ข้อมูลเพิ่มเติมที่ใช้เฉพาะ UI (ยังไม่ส่ง backend) ---
  verifyPassword?: string;
  profilePic?: File | null;
  title?: string;
  rankTh?: string;
  firstNameEn?: string;
  lastNameEn?: string;
  rankEn?: string;
  position?: string;
}

/** Auth Response: รูปแบบข้อมูลที่ได้รับกลับมาหลังล็อกอิน */
export interface AuthResponse {
  access_token: string;
  user: User;
}
