export interface CertificateIssuanceStatus {
  status: 'create' | 'no-create';
  issuedAt?: string;
  issuedTime?: string;
  issuedBy?: string;
}

export interface CertificateImage {
  data: string; // Base64 encoded
  fileName: string;
}

export interface CertificateParticipant {
  id: number | null;
  registrantId: number;
  participantName: string;
  department: string;
  phone: string;
  email: string;
  registrationDate: string;
  registrationType: string;
  attendanceStatus?: string;
  passStatus: 'passed' | 'not-passed' | 'pending';
  remarks?: string;
  issuedCount: number;
  certificateCode?: string | null;
}

export interface CertificateIssuance {
  projectId: number;
  courseId: number;
  courseName: string;
  projectName?: string;
  year: string;
  duration: string;
  regisOpenDate: string | Date | null;
  regisCloseDate: string | Date | null;
  trainingStartDate?: string | Date | null;
  trainingEndDate?: string | Date | null;
  manager: string;
  registrationFee: number;
  totalSeats: number;
  seatReserve: number;
  totalRegistrations?: number;
  participants: CertificateParticipant[];
  participantSummary: {
    attended: number;
    notAttended: number;
    cancelled: number;
  };
  createFile: boolean;
  templateImage?: string | null; // Base64 template
  managedAt?: string | Date | null;
  managedBy?: string | null;
  hasTemplate?: boolean;
}

export interface ProjectCertificateSummary {
  projectId: number;
  courseId: number;
  courseName: string;
  projectName: string;
  year: string;
  duration: string;
  regisOpenDate: Date | null;
  regisCloseDate: Date | null;
  trainingStartDate: Date | null;
  trainingEndDate: Date | null;
  manager: string;
  registrationFee: number;
  totalSeats: number;
  seatReserve: number;
  totalRegistrations: number;
  participantSummary: { attended: number; notAttended: number; cancelled: number };
  managedAt: Date | null;
  managedBy: string | null;
  createFile: boolean;
  hasTemplate: boolean;
}
