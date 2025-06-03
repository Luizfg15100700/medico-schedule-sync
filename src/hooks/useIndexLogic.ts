
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
    copyScheduleBetweenClasses
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
    addSubject(subject);
    appState.closeAddModal();
  };

  const handleUpdateSubject = (subjectData: any) => {
    if (appState.editingSubject) {
      updateSubject(appState.editingSubject.id, subjectData);
      appState.closeAddModal();
    }
  };

  const handleUpdateSchedule = (updatedSubject: Subject) => {
    updateSubject(updatedSubject.id, updatedSubject);
    appState.closeScheduleEditor();
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (confirm('Tem certeza que deseja excluir esta disciplina?')) {
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

  const handleCreateSchedule = (schedule: {
    name: string;
    periods: string[];
    selectedSubjects: { subjectId: string; classId: string }[];
  }) => {
    console.log('Creating schedule:', schedule);
    toast({
      title: "Grade criada",
      description: `Grade "${schedule.name}" criada com ${schedule.selectedSubjects.length} disciplinas/turmas.`,
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

  const handleToggleSubjectInClass = (subjectId: string) => {
    if (currentClassSubjects.includes(subjectId)) {
      removeSubjectFromClass(selectedClass, subjectId);
    } else {
      addSubjectToClass(selectedClass, subjectId);
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
    
    // App State
    ...appState,
    
    // Handlers
    handleAddSubject,
    handleUpdateSubject,
    handleUpdateSchedule,
    handleDeleteSubject,
    handleExportPDF,
    handleExportCSV,
    handleCreateSchedule,
    handleSaveAdvancedSchedule,
    handleToggleSubjectInClass,
  };
};
