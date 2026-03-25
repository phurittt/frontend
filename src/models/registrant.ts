// Mirrors backend enums exactly
export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  FREE = 'free',
}

export enum AttendanceStatus {
  ATTENDED = 'attended',
  MISSED = 'missed',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

export enum ParticipantType {
  STUDENT = 'นิสิต',
  TEACHER = 'อาจารย์',
  STAFF = 'เจ้าหน้าที่',
  GENERAL = 'บุคคลทั่วไป',
}

// Mirrors backend Registration entity (with loaded relations)
export interface Registration {
  id: number;
  userId: number;
  projectId: number;
  registrationDate: string;
  participantType: ParticipantType;
  paymentStatus: PaymentStatus;
  attendanceStatus: AttendanceStatus;
  foodRequirement?: string;
  isWaitingList: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    department?: string;
    phone?: string;
    email?: string;
  };
  project?: {
    id: number;
    name: string;
    course?: { id: number; title: string };
  };
}

// Mirrors backend CreateRegistrationDto
export interface CreateRegistrationDto {
  userId: number;
  projectId: number;
  participantType: ParticipantType;
  paymentStatus?: PaymentStatus;
  attendanceStatus?: AttendanceStatus;
  foodRequirement?: string;
}

// Mirrors backend UpdateRegistrationDto (partial)
export interface UpdateRegistrationDto {
  paymentStatus?: PaymentStatus;
  attendanceStatus?: AttendanceStatus;
  foodRequirement?: string;
}

// =========================================
// Display helpers
// =========================================

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: 'รอชำระเงิน',
  [PaymentStatus.PAID]: 'ชำระเงินแล้ว',
  [PaymentStatus.FREE]: 'ฟรี',
};

export const ATTENDANCE_STATUS_LABEL: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PENDING]: 'รอยืนยัน',
  [AttendanceStatus.ATTENDED]: 'เข้าร่วมแล้ว',
  [AttendanceStatus.MISSED]: 'ขาด',
  [AttendanceStatus.CANCELLED]: 'ยกเลิก',
};

export const PAYMENT_STATUS_COLOR: Record<PaymentStatus, { bg: string; text: string }> = {
  [PaymentStatus.UNPAID]: { bg: 'grey-3', text: 'grey-8' },
  [PaymentStatus.PAID]: { bg: 'light-green-2', text: 'green-9' },
  [PaymentStatus.FREE]: { bg: 'light-blue-2', text: 'blue-9' },
};

export const ATTENDANCE_STATUS_COLOR: Record<AttendanceStatus, { bg: string; text: string }> = {
  [AttendanceStatus.PENDING]: { bg: 'orange-2', text: 'orange-9' },
  [AttendanceStatus.ATTENDED]: { bg: 'light-green-2', text: 'green-9' },
  [AttendanceStatus.MISSED]: { bg: 'red-2', text: 'red-9' },
  [AttendanceStatus.CANCELLED]: { bg: 'grey-3', text: 'grey-8' },
};
