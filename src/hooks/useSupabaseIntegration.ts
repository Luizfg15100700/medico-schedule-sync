
import { useState, useEffect } from 'react';
import { useSupabaseSubjectIntegration } from '@/hooks/supabase/useSupabaseSubjectIntegration';
import { useSupabaseClassIntegration } from '@/hooks/supabase/useSupabaseClassIntegration';
import { useSupabaseScheduleIntegration } from '@/hooks/supabase/useSupabaseScheduleIntegration';

export const useSupabaseIntegration = () => {
  const [selectedClass, setSelectedClass] = useState<string>('1-1'); // Mantém a turma padrão válida
  
  // Hooks dos diferentes módulos
  const {
    subjects,
    subjectsLoading,
    addSubject: addSubjectBase,
    updateSubject,
    deleteSubject: deleteSubjectBase,
    addSubjectToAllClassesInPeriod,
    removeSubjectFromAllClassesInPeriod
  } = useSupabaseSubjectIntegration();

  const {
    classes,
    classSubjects,
    classSchedules,
    setClassSchedules,
    loadSubjectsForClass,
    addSubjectToClass,
    removeSubjectFromClass,
    copyScheduleBetweenClasses,
    updateSubjectScheduleForClass,
    loadClassCustomSchedules,
    saveClassCustomSchedules
  } = useSupabaseClassIntegration();

  const {
    getSubjectScheduleForClass: getSubjectScheduleForClassBase,
    loadScheduleForClassSubject: loadScheduleForClassSubjectBase
  } = useSupabaseScheduleIntegration();

  // Wrapper functions para manter a mesma interface
  const addSubject = async (subjectData: Parameters<typeof addSubjectBase>[0]) => {
    return await addSubjectBase(subjectData, classes, addSubjectToClass);
  };

  const deleteSubject = async (id: string) => {
    await deleteSubjectBase(id, classes, removeSubjectFromClass);
  };

  const getSubjectScheduleForClass = (classId: string, subjectId: string, defaultSubject?: Parameters<typeof getSubjectScheduleForClassBase>[3]) => {
    return getSubjectScheduleForClassBase(classSchedules, classId, subjectId, defaultSubject);
  };

  const loadScheduleForClassSubject = async (classId: string, subjectId: string, defaultSubject?: Parameters<typeof loadScheduleForClassSubjectBase>[2]) => {
    await loadScheduleForClassSubjectBase(
      classId, 
      subjectId, 
      defaultSubject, 
      loadClassCustomSchedules, 
      setClassSchedules
    );
  };

  // Carregar disciplinas da turma selecionada quando ela mudar
  useEffect(() => {
    if (selectedClass) {
      loadSubjectsForClass(selectedClass);
    }
  }, [selectedClass, loadSubjectsForClass]);

  return {
    // Data
    subjects,
    classes,
    selectedClass,
    setSelectedClass,
    loading: subjectsLoading,
    
    // Subject operations
    addSubject,
    updateSubject,
    deleteSubject,
    
    // Class operations
    addSubjectToClass,
    removeSubjectFromClass,
    addSubjectToAllClassesInPeriod,
    removeSubjectFromAllClassesInPeriod,
    loadSubjectsForClass,
    
    // Schedule operations
    updateSubjectScheduleForClass,
    getSubjectScheduleForClass,
    loadScheduleForClassSubject,
    copyScheduleBetweenClasses
  };
};
