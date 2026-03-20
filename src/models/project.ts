// src/models/project.ts

export interface OptionItem {
  label: string;
  value: string | number;
}

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
  isOpen: boolean;
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
