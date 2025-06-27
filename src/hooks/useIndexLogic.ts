
import { useFilters } from '@/hooks/useFilters';
import { useAppState } from '@/hooks/useAppState';
import { useSupabaseIntegration } from '@/hooks/useSupabaseIntegration';
import { useSubjectOperations } from '@/hooks/subject/useSubjectOperations';
import { useConflictDetection } from '@/hooks/conflict/useConflictDetection';
import { useExportOperations } from '@/hooks/export/useExportOperations';
import { useScheduleOperations } from '@/hooks/schedule/useScheduleOperations';

export const useIndexLogic = () => {
  console.log('useIndexLogic: Initializing...');
  
  const {
    subjects,
    classes,
    selectedClass,
    setSelectedClass,
    loading,
    loadSubjectsForClass
  } = useSupabaseIntegration();

  console.log('useIndexLogic: Data loaded', { 
    subjects: subjects?.length || 0, 
    classes: classes?.length || 0,
    loading 
  });

  const currentClass = classes?.find(cls => cls.id === selectedClass);
  const currentClassSubjects = currentClass ? currentClass.subjects : [];
  
  const { detectConflictsForClasses } = useConflictDetection();
  const conflicts = detectConflictsForClasses(subjects || [], currentClassSubjects);
  
  const { filters, setFilters, filteredSubjects } = useFilters(subjects || [], conflicts);
  const appState = useAppState();
  const selectedSubjectsList = filteredSubjects?.filter(s => currentClassSubjects.includes(s.id)) || [];

  const {
    handleAddSubject,
    handleUpdateSubject,
    handleUpdateSchedule,
    handleDeleteSubject,
    handleToggleSubjectInClass
  } = useSubjectOperations();

  const {
    handleExportPDF,
    handleExportCSV,
    handleSaveAdvancedSchedule
  } = useExportOperations();

  const {
    handleLoadSubjectSchedule,
    copyScheduleBetweenClasses,
    updateSubjectScheduleForClass,
    getSubjectScheduleForClass
  } = useScheduleOperations();

  // Wrapper functions to maintain the same interface
  const wrappedHandleToggleSubjectInClass = async (subjectId: string) => {
    await handleToggleSubjectInClass(selectedClass, subjectId, currentClassSubjects);
  };

  const wrappedHandleLoadSubjectSchedule = async (subjectId: string) => {
    await handleLoadSubjectSchedule(selectedClass, subjectId, subjects || []);
  };

  const wrappedHandleExportPDF = () => {
    handleExportPDF(subjects || [], currentClassSubjects);
  };

  const wrappedHandleExportCSV = () => {
    handleExportCSV(subjects || [], currentClassSubjects);
  };

  console.log('useIndexLogic: Returning data', {
    subjects: subjects?.length || 0,
    classes: classes?.length || 0,
    loading,
    activeView: appState.activeView
  });

  return {
    // Data
    subjects: subjects || [],
    classes: classes || [],
    selectedClass,
    setSelectedClass,
    currentClass,
    currentClassSubjects,
    conflicts,
    filters,
    setFilters,
    filteredSubjects: filteredSubjects || [],
    selectedSubjectsList,
    loading,
    copyScheduleBetweenClasses,
    updateSubjectScheduleForClass,
    getSubjectScheduleForClass,
    
    // App State
    ...appState,
    
    // Handlers
    handleAddSubject,
    handleUpdateSubject,
    handleUpdateSchedule,
    handleDeleteSubject,
    handleExportPDF: wrappedHandleExportPDF,
    handleExportCSV: wrappedHandleExportCSV,
    handleSaveAdvancedSchedule,
    handleToggleSubjectInClass: wrappedHandleToggleSubjectInClass,
    handleLoadSubjectSchedule: wrappedHandleLoadSubjectSchedule,
  };
};
