export interface Subject {
  id: string;
  name: string;
  period: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | 'especial';
  professor: string;
  location: string;
  totalWorkload: number;
  theoreticalClasses: ClassSchedule[];
  practicalClasses: ClassSchedule[];
  color?: string;
}

export interface ClassSchedule {
  id: string;
  subjectId: string;
  type: 'theoretical' | 'practical';
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  startTime: string;
  endTime: string;
  location: string;
  workload: number;
}

export interface ScheduleConflict {
  id: string;
  subject1: Subject;
  subject2: Subject;
  conflictingClass1: ClassSchedule;
  conflictingClass2: ClassSchedule;
  overlapMinutes: number;
}

export interface WorkloadReport {
  subjectId: string;
  totalWorkload: number;
  scheduledWorkload: number;
  conflictedWorkload: number;
  availableWorkload: number;
  utilizationPercentage: number;
}

export const DAYS_OF_WEEK = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira',
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado'
} as const;

export const PERIODS = {
  '1': '1º Período',
  '2': '2º Período', 
  '3': '3º Período',
  '4': '4º Período',  
  '5': '5º Período',
  '6': '6º Período',
  '7': '7º Período',
  '8': '8º Período',
  'especial': 'Turma Especial'
} as const;

export type Period = keyof typeof PERIODS;

export const TIME_SLOTS = [
  '07:00', '07:30', '08:00', '08:30', '09:00', '09:30',
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
];
