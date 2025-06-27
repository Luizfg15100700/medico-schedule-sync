
import { useSupabaseIntegration } from '@/hooks/useSupabaseIntegration';
import { Subject } from '@/types';

export const useScheduleOperations = () => {
  const {
    loadScheduleForClassSubject,
    copyScheduleBetweenClasses,
    updateSubjectScheduleForClass,
    getSubjectScheduleForClass
  } = useSupabaseIntegration();

  const handleLoadSubjectSchedule = async (selectedClass: string, subjectId: string, subjects: Subject[]) => {
    const subject = subjects?.find(s => s.id === subjectId);
    if (subject && selectedClass) {
      await loadScheduleForClassSubject(selectedClass, subjectId, subject);
    }
  };

  return {
    handleLoadSubjectSchedule,
    copyScheduleBetweenClasses,
    updateSubjectScheduleForClass,
    getSubjectScheduleForClass
  };
};
