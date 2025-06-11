
export interface ClassGroup {
  id: string;
  name: string;
  period: string;
  subjects: string[]; // IDs das disciplinas
  subjectSchedules: { [subjectId: string]: SubjectScheduleOverride }; // Horários específicos por disciplina
}

export interface SubjectScheduleOverride {
  subjectId: string;
  classId: string;
  theoreticalClasses: ClassScheduleOverride[];
  practicalClasses: ClassScheduleOverride[];
  hasCustomSchedule: boolean; // Se true, usa os horários customizados; se false, usa os horários padrão da disciplina
}

export interface ClassScheduleOverride {
  id: string;
  subjectId: string;
  classId: string;
  type: 'theoretical' | 'practical';
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  startTime: string;
  endTime: string;
  location: string;
  workload: number;
}

export interface SubjectWithClass {
  subjectId: string;
  classId: string;
}
