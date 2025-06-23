
import { useFilters } from '@/hooks/useFilters';
import { useAcademicCalendar } from '@/hooks/useAcademicCalendar';
import { useAppState } from '@/hooks/useAppState';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseIntegration } from '@/hooks/useSupabaseIntegration';
import { exportToPDF, exportToCSV } from '@/utils/exportUtils';
import { Subject } from '@/types';

export const useIndexLogic = () => {
  const { toast } = useToast();
  
  const {
    subjects,
    classes,
    selectedClass,
    setSelectedClass,
    loading,
    addSubject,
    updateSubject,
    deleteSubject,
    addSubjectToClass,
    removeSubjectFromClass,
    addSubjectToAllClassesInPeriod,
    removeSubjectFromAllClassesInPeriod,
    updateSubjectScheduleForClass,
    getSubjectScheduleForClass,
    copyScheduleBetweenClasses,
    loadSubjectsForClass,
    loadScheduleForClassSubject
  } = useSupabaseIntegration();

  const { saveScheduleTemplate } = useAcademicCalendar();

  const currentClass = classes.find(cls => cls.id === selectedClass);
  const currentClassSubjects = currentClass ? currentClass.subjects : [];
  
  // Detectar conflitos usando disciplinas da turma atual
  const detectConflictsForClasses = (classSubjects: string[]) => {
    const conflicts = [];
    const selected = subjects.filter(s => classSubjects.includes(s.id));
    
    // Agrupar disciplinas por período
    const subjectsByPeriod = selected.reduce((acc, subject) => {
      if (!acc[subject.period]) {
        acc[subject.period] = [];
      }
      acc[subject.period].push(subject);
      return acc;
    }, {} as Record<string, Subject[]>);

    // Verificar conflitos apenas entre períodos diferentes
    const periods = Object.keys(subjectsByPeriod);
    for (let i = 0; i < periods.length; i++) {
      for (let j = i + 1; j < periods.length; j++) {
        const period1Subjects = subjectsByPeriod[periods[i]];
        const period2Subjects = subjectsByPeriod[periods[j]];
        
        period1Subjects.forEach(subject1 => {
          period2Subjects.forEach(subject2 => {
            const allClasses1 = [...subject1.theoreticalClasses, ...subject1.practicalClasses];
            const allClasses2 = [...subject2.theoreticalClasses, ...subject2.practicalClasses];
            
            allClasses1.forEach(class1 => {
              allClasses2.forEach(class2 => {
                if (class1.dayOfWeek === class2.dayOfWeek) {
                  const start1 = new Date(`2000-01-01 ${class1.startTime}`);
                  const end1 = new Date(`2000-01-01 ${class1.endTime}`);
                  const start2 = new Date(`2000-01-01 ${class2.startTime}`);
                  const end2 = new Date(`2000-01-01 ${class2.endTime}`);
                  
                  if (start1 < end2 && start2 < end1) {
                    const overlapStart = new Date(Math.max(start1.getTime(), start2.getTime()));
                    const overlapEnd = new Date(Math.min(end1.getTime(), end2.getTime()));
                    const overlapMinutes = (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60);
                    
                    conflicts.push({
                      id: `${class1.id}-${class2.id}`,
                      subject1,
                      subject2,
                      conflictingClass1: class1,
                      conflictingClass2: class2,
                      overlapMinutes
                    });
                  }
                }
              });
            });
          });
        });
      }
    }
    
    return conflicts;
  };

  const conflicts = detectConflictsForClasses(currentClassSubjects);
  const { filters, setFilters, filteredSubjects } = useFilters(subjects, conflicts);
  
  const appState = useAppState();
  const selectedSubjectsList = filteredSubjects.filter(s => currentClassSubjects.includes(s.id));

  const handleAddSubject = async (subject: {
    name: string;
    period: Subject['period'];
    professor: string;
    location: string;
    totalWorkload: number;
    theoreticalClasses: any[];
    practicalClasses: any[];
  }) => {
    try {
      await addSubject(subject);
      appState.closeAddModal();
      toast({
        title: "Sucesso",
        description: "Disciplina adicionada e salva no banco de dados.",
      });
    } catch (error) {
      console.error('Erro ao adicionar disciplina:', error);
    }
  };

  const handleUpdateSubject = async (subjectData: any) => {
    if (appState.editingSubject) {
      try {
        await updateSubject(appState.editingSubject.id, subjectData);
        appState.closeAddModal();
        toast({
          title: "Sucesso",
          description: "Disciplina atualizada no banco de dados.",
        });
      } catch (error) {
        console.error('Erro ao atualizar disciplina:', error);
      }
    }
  };

  const handleUpdateSchedule = async (updatedSubject: Subject) => {
    console.log('Atualizando horários padrão da disciplina:', updatedSubject.name);
    try {
      await updateSubject(updatedSubject.id, updatedSubject);
      appState.closeScheduleEditor();
      
      toast({
        title: "Horários padrão atualizados",
        description: "Os horários padrão da disciplina foram atualizados e salvos no banco de dados.",
      });
    } catch (error) {
      console.error('Erro ao atualizar horários:', error);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (confirm('Tem certeza que deseja excluir esta disciplina? Ela será removida do banco de dados.')) {
      try {
        await deleteSubject(subjectId);
        toast({
          title: "Sucesso",
          description: "Disciplina removida do banco de dados.",
        });
      } catch (error) {
        console.error('Erro ao deletar disciplina:', error);
      }
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
    try {
      if (currentClassSubjects.includes(subjectId)) {
        await removeSubjectFromClass(selectedClass, subjectId);
        toast({
          title: "Disciplina removida",
          description: "Disciplina removida da turma no banco de dados.",
        });
      } else {
        await addSubjectToClass(selectedClass, subjectId);
        toast({
          title: "Disciplina adicionada",
          description: "Disciplina adicionada à turma no banco de dados.",
        });
      }
    } catch (error) {
      console.error('Erro ao alterar disciplina da turma:', error);
    }
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
    handleExportPDF,
    handleExportCSV,
    handleSaveAdvancedSchedule,
    handleToggleSubjectInClass,
    handleLoadSubjectSchedule,
  };
};
