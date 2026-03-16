export interface UserBase {
  username: string;
  email: string;
  title: string;
  firstNameTh: string;
  lastNameTh: string;
  rankTh?: string;
  firstNameEn?: string;
  lastNameEn?: string;
  rankEn?: string;
  phone: string;
  organization?: string;
  position?: string;
  billingAddress?: string;
  province: string;
  postalCode?: string;
}

// แยก Type ของ Role ออกมาเพื่อให้เรียกใช้ซ้ำได้ง่าย
export type UserRole = 'student' | 'admin' | 'staff';

/** User Entity: ข้อมูลโปรไฟล์ที่เก็บใน Store */
export interface UserProfile extends UserBase {
  id: string;
  avatar: string;
  role: UserRole;
}

export const USER_ROLE_OPTIONS = [
  { label: 'ผู้ดูแลระบบ (Admin)', value: 'admin' },
  { label: 'เจ้าหน้าที่จัดฝึกอบรม (Staff)', value: 'staff' },
  { label: 'ผู้เข้าอบรม (Student)', value: 'student' },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'ผู้ดูแลระบบ',
  staff: 'เจ้าหน้าที่จัดฝึกอบรม',
  student: 'ผู้เข้าอบรม',
};

export const TITLE_OPTIONS = ['นาย', 'นาง', 'นางสาว'];
