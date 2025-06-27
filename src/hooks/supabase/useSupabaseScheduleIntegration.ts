
import { Subject } from '@/types';
import { SubjectScheduleOverride } from '@/types/class';

export const useSupabaseScheduleIntegration = () => {
  // Obter horário de disciplina para uma turma específica
  const getSubjectScheduleForClass = (
    classSchedules: Record<string, Record<string, SubjectScheduleOverride>>,
    classId: string, 
    subjectId: string, 
    defaultSubject?: Subject
  ): SubjectScheduleOverride | null => {
    const existingSchedule = classSchedules[classId]?.[subjectId];
    if (existingSchedule) {
      return existingSchedule;
    }

    // Se não há horário customizado e temos a disciplina padrão, criar um baseado nela
    if (defaultSubject) {
      return {
        subjectId,
        classId,
        theoreticalClasses: defaultSubject.theoreticalClasses.map(tc => ({
          ...tc,
          classId,
          id: `${tc.id}-${classId}`
        })),
        practicalClasses: defaultSubject.practicalClasses.map(pc => ({
          ...pc,
          classId,
          id: `${pc.id}-${classId}`
        })),
        hasCustomSchedule: false
      };
    }

    return null;
  };

  // Carregar disciplinas da turma selecionada quando ela mudar
  const loadScheduleForClassSubject = async (
    classId: string, 
    subjectId: string, 
    defaultSubject: Subject | undefined,
    loadClassCustomSchedules: (classId: string, subjectId: string) => Promise<any[]>,
    setClassSchedules: React.Dispatch<React.SetStateAction<Record<string, Record<string, SubjectScheduleOverride>>>>
  ) => {
    const customSchedules = await loadClassCustomSchedules(classId, subjectId);
    
    if (customSchedules.length > 0) {
      const scheduleOverride: SubjectScheduleOverride = {
        subjectId,
        classId,
        theoreticalClasses: customSchedules
          .filter(s => s.type === 'theoretical')
          .map(s => ({
            id: s.id,
            subjectId: s.subject_id,
            classId: s.class_id,
            type: s.type,
            dayOfWeek: s.day_of_week as any,
            startTime: s.start_time,
            endTime: s.end_time,
            location: s.location || '',
            workload: s.workload
          })),
        practicalClasses: customSchedules
          .filter(s => s.type === 'practical')
          .map(s => ({
            id: s.id,
            subjectId: s.subject_id,
            classId: s.class_id,
            type: s.type,
            dayOfWeek: s.day_of_week as any,
            startTime: s.start_time,
            endTime: s.end_time,
            location: s.location || '',
            workload: s.workload
          })),
        hasCustomSchedule: true
      };

      setClassSchedules(prev => ({
        ...prev,
        [classId]: {
          ...prev[classId],
          [subjectId]: scheduleOverride
        }
      }));
    }
  };

  return {
    getSubjectScheduleForClass,
    loadScheduleForClassSubject
  };
};
