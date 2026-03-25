// export interface UserBase {
//   username: string;
//   email: string;
//   title: string;
//   firstNameTh: string;
//   lastNameTh: string;
//   rankTh?: string;
//   firstNameEn?: string;
//   lastNameEn?: string;
//   rankEn?: string;
//   phone: string;
//   organization?: string;
//   position?: string;
//   billingAddress?: string;
//   province: string;
//   postalCode?: string;
// }

// // แยก Type ของ Role ออกมาเพื่อให้เรียกใช้ซ้ำได้ง่าย
// export type UserRole = 'student' | 'admin' | 'staff';

// /** User Entity: ข้อมูลโปรไฟล์ที่เก็บใน Store */
// export interface UserProfile extends UserBase {
//   id: string;
//   avatar: string;
//   role: UserRole;
//   createdAt?: string;
// }

// export const MEMBER_ROLE_OPTIONS = [{ label: 'ผู้เข้าอบรม (Student)', value: 'student' }];

// export const USER_ROLE_OPTIONS = [
//   { label: 'ผู้ดูแลระบบ (Admin)', value: 'admin' },
//   { label: 'เจ้าหน้าที่จัดฝึกอบรม (Staff)', value: 'staff' },
// ];

// export const ROLE_LABELS: Record<UserRole, string> = {
//   admin: 'ผู้ดูแลระบบ',
//   staff: 'เจ้าหน้าที่จัดฝึกอบรม',
//   student: 'ผู้เข้าอบรม',
// };

// export const TITLE_OPTIONS = ['นาย', 'นาง', 'นางสาว'];

// export interface CreateUserRequest {
//   username: string;
//   password: string;
//   firstName: string;
//   lastName: string;
//   department?: string;
//   role?: 'admin' | 'staff' | 'student';
//   address?: string;
//   province?: string;
//   zipcode?: string;
//   phone?: string;
//   email?: string;
//   profilePicture?: string;
//   isActive?: boolean;
// }

// export interface User {
//   id: number;
//   username: string;
//   firstName: string;
//   lastName: string;
//   department?: string;
//   role: 'admin' | 'staff' | 'student';
//   address?: string;
//   province?: string;
//   zipcode?: string;
//   phone?: string;
//   email?: string;
//   profilePicture?: string;
//   isActive: boolean;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface UpdateUserRequest {
//   firstName?: string;
//   lastName?: string;
//   department?: string;
//   address?: string;
//   province?: string;
//   zipcode?: string;
//   phone?: string;
//   email?: string;
//   profilePicture?: string;
//   isActive?: boolean;
// }

export type UserRole = 'admin' | 'staff' | 'participant';

interface BaseUser {
  firstName: string;
  lastName: string;
  department?: string;
  address?: string;
  province?: string;
  zipcode?: string;
  phone?: string;
  email?: string;
  profilePicture?: string;
}

export interface CreateUserRequest extends BaseUser {
  username: string;
  password: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UpdateUserRequest extends Partial<BaseUser> {
  isActive?: boolean;
}

export interface User extends BaseUser {
  id: number;
  username: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
