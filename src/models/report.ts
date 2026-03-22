// 1. Model สำหรับตัวกรองค้นหา
export interface ReportFilter {
  year: string;
  type: string;
  search: string;
}

// 2. Model สำหรับรายงานสรุปภาพรวม
export interface SummaryReportItem {
  id: number;
  index: number;
  projectName: string;
  date: string;
  format: string;
  registered: number;
  attended: number;
}

// 3. Model สำหรับรายงานประวัติวิทยากร
export interface LecturerReportItem {
  id: string; // สร้าง ID เฉพาะ
  index: number;
  lecturerName: string;
  lecturerType: string; // วิทยากรภายใน / ภายนอก
  projectName: string;
  courseName: string;
  teachingDate: string;
}

// 4. Model สำหรับรายงานสรุปรายรับ-รายจ่าย
export interface FinanceReportItem {
  id: number;
  index: number;
  projectName: string;
  format: string;
  totalAttendees: number;
  income: number;
  expense: number;
  profit: number;
}
