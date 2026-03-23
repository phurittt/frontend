// src/models/certificate.ts

export interface CertificateIssuanceStatus {
  status: 'create' | 'no-create';
  issuedAt?: string;
  issuedTime?: string;
  issuedBy?: string;
}

export interface CertificateImage {
  data: string; // Base64 encoded image
  fileName: string;
}

export interface CertificateParticipant {
  id: number;
  registrantId: number;
  participantName: string;
  department: string;
  phone: string;
  email: string;
  registrationDate: string;
  registrationType: string;
  passStatus: 'passed' | 'not-passed';
  remarks?: string;
  issuedCount: number;
}

export interface CertificateIssuance {
  id?: number;
  courseId: number;
  courseName: string;
  project?: string;
  year: string;
  duration: string;
  regisOpenDate: string;
  regisCloseDate: string;
  trainingDate?: string;
  manager: string;
  registrationFee: number;
  totalSeats: number;
  seatReserve: number;
  participants: CertificateParticipant[];
  participantSummary: {
    attended: number;
    notAttended: number;
    cancelled: number;
  };
  certificateStatus: CertificateIssuanceStatus;
  certificateImage?: CertificateImage;
  managedAt?: string;
  managedTime?: string;
  managedBy?: string;
}

export type CreateCertificateIssuanceDto = Omit<CertificateIssuance, 'id'>;
