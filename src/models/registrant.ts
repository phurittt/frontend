export type RegistrantStatus = 'ชำระเงินเรียบร้อย' | 'รอตรวจสอบ' | 'รอชำระเงิน' | 'ยกเลิก';
export type RegistrantType = 'บุคคลทั่วไป' | 'บุคลากรภายใน' | 'นิสิต';

export interface Registrant {
  id: number;
  courseId: number; // เพิ่มฟิลด์นี้เพื่อเชื่อมกับหลักสูตร
  fullName: string;
  department: string;
  phone: string;
  type: RegistrantType;
  registerDate: string;
  status: RegistrantStatus;
  email?: string;
}

export interface CreateRegistrantDto {
  courseId: number; // เพิ่มฟิลด์นี้
  type: RegistrantType;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
}
