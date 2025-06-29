
export interface AcademicPeriod {
  id: string;
  name: string;
  semester: string;
  year: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  status: 'future' | 'active' | 'finished';
  type: 'regular' | 'intensive' | 'special';
  enrollmentStart?: string;
  enrollmentEnd?: string;
  examWeekStart?: string;
  examWeekEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  academicPeriodId: string;
  subjects: ScheduleSubjectAssignment[];
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleSubjectAssignment {
  subjectId: string;
  classId: string;
  period: string;
  conflictPercentage?: number;
  isConflictAccepted?: boolean;
}

export interface ConflictAnalysisResult {
  conflictingSubjects: string[];
  overlapPercentage: number;
  isWithinThreshold: boolean;
  conflictDetails: {
    subject1: string;
    subject2: string;
    overlapHours: number;
    totalHours1: number;
    totalHours2: number;
    percentage: number;
  }[];
}

export interface AcademicCalendarValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
