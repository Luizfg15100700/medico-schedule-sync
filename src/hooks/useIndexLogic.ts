import { useSubjects } from '@/hooks/useSubjects';
import { useClasses } from '@/hooks/useClasses';
import { useFilters } from '@/hooks/useFilters';
import { useAcademicCalendar } from '@/hooks/useAcademicCalendar';
import { useAppState } from '@/hooks/useAppState';
import { useToast } from '@/hooks/use-toast';
import { exportToPDF, exportToCSV } from '@/utils/exportUtils';
import { Subject } from '@/types';

export const useIndexLogic = () => {
  const { toast } = useToast();
  
  const {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject
  } = useSubjects();

  const {
    classes,
    selectedClass,
    setSelectedClass,
    addSubjectToClass,
    removeSubjectFromClass,
    addSubjectToAllClassesInPeriod,
    removeSubjectFromAllClassesInPeriod,
    updateSubjectScheduleForClass,
    getSubjectScheduleForClass,
    copyScheduleBetweenClasses,
    loadSubjectsForClass,
    loadScheduleForClassSubject
  } = useClasses();

  const { saveScheduleTemplate } = useAcademicCalendar();

  const currentClass = classes.find(cls => cls.id === selectedClass);
  const currentClassSubjects = currentClass ? currentClass.subjects : [];
  const conflicts = useSubjects().detectConflictsForClasses(currentClassSubjects);
  const { filters, setFilters, filteredSubjects } = useFilters(subjects, conflicts);
  
  const appState = useAppState();
  const selectedSubjectsList = filteredSubjects.filter(s => currentClassSubjects.includes(s.id));

  const handleAddSubject = (subject: {
    name: string;
    period: Subject['period'];
    professor: string;
    location: string;
    totalWorkload: number;
    theoreticalClasses: any[];
    practicalClasses: any[];
  }) => {
    const newSubject = addSubject(subject);
    // Adicionar automaticamente a todas as turmas do período
    addSubjectToAllClassesInPeriod(subject.period, newSubject.id);
    appState.closeAddModal();
  };

  const handleUpdateSubject = (subjectData: any) => {
    if (appState.editingSubject) {
      updateSubject(appState.editingSubject.id, subjectData);
      appState.closeAddModal();
    }
  };

  const handleUpdateSchedule = (updatedSubject: Subject) => {
    console.log('Atualizando horários padrão da disciplina:', updatedSubject.name);
    updateSubject(updatedSubject.id, updatedSubject);
    appState.closeScheduleEditor();
    
    toast({
      title: "Horários padrão atualizados",
      description: "Os horários padrão da disciplina foram atualizados. Turmas com horários customizados não foram afetadas.",
    });
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (confirm('Tem certeza que deseja excluir esta disciplina?')) {
      const subject = subjects.find(s => s.id === subjectId);
      if (subject) {
        // Remover de todas as turmas do período
        removeSubjectFromAllClassesInPeriod(subject.period, subjectId);
      }
      deleteSubject(subjectId);
    }
  };

  const handleExportPDF = () => {
    exportToPDF(subjects, currentClassSubjects);
    toast({
      title: "Exportação realizada",
      description: "Grade exportada como HTML com sucesso!",
    });
  };

  const handleExportCSV = () => {
    exportToCSV(subjects, currentClassSubjects);
    toast({
      title: "Exportação realizada",
      description: "Grade exportada como CSV com sucesso!",
    });
  };

  const handleSaveAdvancedSchedule = (schedule: {
    name: string;
    academicPeriodId: string;
    assignments: any[];
  }) => {
    saveScheduleTemplate({
      name: schedule.name,
      academicPeriodId: schedule.academicPeriodId,
      subjects: schedule.assignments
    });
  };

  const handleToggleSubjectInClass = async (subjectId: string) => {
    if (currentClassSubjects.includes(subjectId)) {
      await removeSubjectFromClass(selectedClass, subjectId);
    } else {
      await addSubjectToClass(selectedClass, subjectId);
    }
    // Recarregar as disciplinas da turma após a alteração
    await loadSubjectsForClass(selectedClass);
  };

  const handleLoadSubjectSchedule = async (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    if (subject && selectedClass) {
      await loadScheduleForClassSubject(selectedClass, subjectId, subject);
    }
  };

  return {
    // Data
    subjects,
    classes,
    selectedClass,
    setSelectedClass,
    currentClass,
    currentClassSubjects,
    conflicts,
    filters,
    setFilters,
    filteredSubjects,
    selectedSubjectsList,
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
    handleExportPDF,
    handleExportCSV,
    handleSaveAdvancedSchedule,
    handleToggleSubjectInClass,
    handleLoadSubjectSchedule,
  };
};
