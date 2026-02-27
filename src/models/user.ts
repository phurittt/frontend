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

/** User Entity: ข้อมูลโปรไฟล์ที่เก็บใน Store (ไม่มี Password) */
export interface UserProfile extends UserBase {
  id: string;
  avatar: string;
  role: 'student' | 'admin' | 'staff';
}
