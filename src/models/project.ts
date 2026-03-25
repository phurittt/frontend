// src/models/project.ts

export interface OptionItem {
  label: string;
  value: string | number;
}

// =========================================
// Kept for ProjectManagementPage compatibility
// =========================================

export interface ProjectForm {
  year: string;
  projectType: OptionItem | null;
  projectName: string;
  dateFrom: string;
  dateTo: string;
  manager: OptionItem | null;
  location: string;
  regisOpenDate: string;
  regisCloseDate: string;
  timeFrom: string;
  timeTo: string;
  cancelDays: string;
  askFood: boolean;
  isOpen: boolean; // maps to entity.status
  isVisible: boolean; // maps to entity.isVisible
}

export interface ProjectCourse {
  course: OptionItem | null;
  targetGroups: string[];
  targetAmount: string;
  isOpen: boolean;
}

export interface ProjectLecturer {
  course: OptionItem | null;
  lecturerName: OptionItem | null;
  assistantName: OptionItem | null;
}

export interface Project {
  id?: number;
  projectData: ProjectForm;
  courses: ProjectCourse[];
  lecturers: ProjectLecturer[];
}

// =========================================
// API Response shape (from GET /projects/:id)
// =========================================

export interface ProjectApi {
  id: number;
  name: string;
  projectYear: string;
  projectTypeId?: number;
  managerId?: number;
  location?: string;
  cancelDaysBefore?: number;
  requireFoodSurvey: boolean;
  status: boolean;
  isVisible: boolean;
  projectDurationStart?: string;
  projectDurationEnd?: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  courseId?: number;
  generationNumber?: string;
  targetAudience?: string[];
  trainingStartDate?: string;
  trainingEndDate?: string;
  capacity?: number;
  reserveCapacity: number;
  registrationFee: number;
  coverImage?: string;
  lecturerRemuneration: number;
  createdAt: string;
  updatedAt: string;
  projectType?: { id: number; name: string };
  course?: { id: number; title: string };
  manager?: { id: number; firstName: string; lastName: string };
  lecturers?: { id: number; firstName: string; lastName: string }[];
}

// =========================================
// Payload for POST/PATCH
// =========================================

export interface CreateProjectPayload {
  name: string;
  projectYear: string;
  projectTypeId?: number;
  managerId?: number;
  location?: string;
  cancelDaysBefore?: number;
  requireFoodSurvey: boolean;
  status: boolean;
  isVisible: boolean;
  projectDurationStart?: string;
  projectDurationEnd?: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  courseId?: number;
  generationNumber?: string;
  targetAudience?: string[];
  trainingStartDate?: string;
  trainingEndDate?: string;
  capacity?: number;
  reserveCapacity?: number;
  registrationFee?: number;
  coverImage?: string;
  lecturerIds?: number[];
  lecturerRemuneration?: number;
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>;
