
import { useState } from 'react';
import { Subject, PERIODS } from '@/types';
import { ClassGroup } from '@/types/class';

interface SelectedSubject {
  subjectId: string;
  period: string;
}

export const useWordExportLogic = (subjects: Subject[], classes: ClassGroup[]) => {
  const [scheduleName, setScheduleName] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubjects, setSelectedSubjects] = useState<SelectedSubject[]>([]);

  console.log('WordScheduleBuilder - subjects:', subjects?.length || 0);
  console.log('WordScheduleBuilder - classes:', classes?.length || 0);
  console.log('WordScheduleBuilder - selectedSubjects:', selectedSubjects);

  const currentClass = selectedClass !== 'all' ? classes.find(cls => cls.id === selectedClass) : undefined;

  const handleToggleSubject = (subjectId: string, period: string) => {
    console.log('Toggling subject:', subjectId, 'period:', period);
    
    setSelectedSubjects(prev => {
      const exists = prev.some(s => s.subjectId === subjectId);
      if (exists) {
        const newSelected = prev.filter(s => s.subjectId !== subjectId);
        console.log('Removing subject, new selectedSubjects:', newSelected);
        return newSelected;
      } else {
        const newSelected = [...prev, { subjectId, period }];
        console.log('Adding subject, new selectedSubjects:', newSelected);
        return newSelected;
      }
    });
  };

  // Organizar disciplinas por período, considerando turma selecionada
  const getOrganizedSubjects = () => {
    console.log('Getting organized subjects...');
    console.log('All subjects:', subjects.map(s => ({ id: s.id, name: s.name, period: s.period })));
    console.log('Current class:', currentClass);
    console.log('Current class subjects:', currentClass?.subjects);
    
    let filteredSubjects = subjects;
    
    // Se uma turma específica foi selecionada, filtrar apenas disciplinas dessa turma
    if (currentClass) {
      console.log('Filtering subjects for class:', currentClass.name);
      filteredSubjects = subjects.filter(subject => {
        const isInClass = currentClass.subjects.includes(subject.id);
        console.log(`Subject ${subject.name} (${subject.period}) is in class:`, isInClass);
        return isInClass;
      });
    }
    
    console.log('Filtered subjects:', filteredSubjects.map(s => ({ id: s.id, name: s.name, period: s.period })));
    
    // Agrupar por período
    const organized = filteredSubjects.reduce((acc, subject) => {
      // Converter período para string se necessário
      const periodKey = subject.period.toString();
      
      if (!acc[periodKey]) {
        acc[periodKey] = {
          periodLabel: PERIODS[subject.period],
          subjects: []
        };
      }
      acc[periodKey].subjects.push(subject);
      return acc;
    }, {} as Record<string, { periodLabel: string; subjects: Subject[] }>);
    
    console.log('Organized subjects:', organized);
    return organized;
  };

  const organizedSubjects = getOrganizedSubjects();

  // Debug: verificar se o botão deve estar habilitado
  const isButtonEnabled = scheduleName.trim() !== '' && selectedSubjects.length > 0;
  console.log('Button enabled check:', { 
    scheduleName: scheduleName.trim(), 
    selectedSubjectsCount: selectedSubjects.length, 
    isEnabled: isButtonEnabled 
  });

  return {
    scheduleName,
    setScheduleName,
    selectedClass,
    setSelectedClass,
    selectedSubjects,
    currentClass,
    organizedSubjects,
    isButtonEnabled,
    handleToggleSubject
  };
};
