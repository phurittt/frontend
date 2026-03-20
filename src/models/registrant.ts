export type RegistrantStatus = 'ชำระเงินเรียบร้อย' | 'รอตรวจสอบ' | 'รอชำระเงิน' | 'ยกเลิก';
export type RegistrantType = 'บุคคลทั่วไป' | 'บุคลากรภายใน' | 'นิสิต';

export interface Registrant {
  id: number;
  projectId: number;
  courseId: number;
  userId: string | null; // เชื่อมกับรหัส User

  // ให้ข้อมูลพวกนี้เป็น Optional (เผื่อกรณีแอดมินคีย์มือให้คนนอกระบบที่ไม่มี userId)
  fullName?: string;
  department?: string;
  phone?: string;
  email?: string;

  type: RegistrantType;
  registerDate: string;
  status: RegistrantStatus;
}

export interface CreateRegistrantDto {
  projectId: number;
  courseId: number;
  userId?: string | null;
  type: RegistrantType;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
}
