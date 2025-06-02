import { useState, useCallback } from 'react';
import { Subject, ClassSchedule, ScheduleConflict } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useSubjects = () => {
  const { toast } = useToast();
  
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: '1',
      name: 'Anatomia Humana I',
      period: '1',
      professor: 'Dr. João Silva',
      location: 'Laboratório de Anatomia',
      totalWorkload: 120,
      theoreticalClasses: [
        {
          id: '1-t-1',
          subjectId: '1',
          type: 'theoretical',
          dayOfWeek: 'monday',
          startTime: '08:00',
          endTime: '10:00',
          location: 'Sala 101',
          workload: 2
        }
      ],
      practicalClasses: [
        {
          id: '1-p-1',
          subjectId: '1',
          type: 'practical',
          dayOfWeek: 'wednesday',
          startTime: '14:00',
          endTime: '17:00',
          location: 'Lab. Anatomia',
          workload: 3
        }
      ],
      color: '#3B82F6'
    },
    {
      id: '2',
      name: 'Fisiologia I',
      period: '2',
      professor: 'Dra. Maria Santos',
      location: 'Laboratório de Fisiologia',
      totalWorkload: 100,
      theoreticalClasses: [
        {
          id: '2-t-1',
          subjectId: '2',
          type: 'theoretical',
          dayOfWeek: 'tuesday',
          startTime: '08:00',
          endTime: '10:00',
          location: 'Sala 102',
          workload: 2
        }
      ],
      practicalClasses: [
        {
          id: '2-p-1',
          subjectId: '2',
          type: 'practical',
          dayOfWeek: 'thursday',
          startTime: '14:00',
          endTime: '16:00',
          location: 'Lab. Fisiologia',
          workload: 2
        }
      ],
      color: '#10B981'
    }
  ]);

  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['1', '2']);

  const addSubject = useCallback((subject: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subject,
      id: Date.now().toString(),
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      theoreticalClasses: subject.theoreticalClasses.map((cls, index) => ({
        ...cls,
        id: `${Date.now()}-t-${index}`,
        subjectId: Date.now().toString()
      })),
      practicalClasses: subject.practicalClasses.map((cls, index) => ({
        ...cls,
        id: `${Date.now()}-p-${index}`,
        subjectId: Date.now().toString()
      }))
    };
    setSubjects(prev => [...prev, newSubject]);
    toast({
      title: "Disciplina adicionada",
      description: `${subject.name} foi adicionada com sucesso.`,
    });
  }, [toast]);

  const updateSubject = useCallback((id: string, updates: Partial<Omit<Subject, 'id'>>) => {
    setSubjects(prev => prev.map(subject => {
      if (subject.id === id) {
        const updated = { ...subject, ...updates };
        if (updates.theoreticalClasses) {
          updated.theoreticalClasses = updates.theoreticalClasses.map((cls, index) => ({
            ...cls,
            id: cls.id || `${id}-t-${index}`,
            subjectId: id
          }));
        }
        if (updates.practicalClasses) {
          updated.practicalClasses = updates.practicalClasses.map((cls, index) => ({
            ...cls,
            id: cls.id || `${id}-p-${index}`,
            subjectId: id
          }));
        }
        return updated;
      }
      return subject;
    }));
    toast({
      title: "Disciplina atualizada",
      description: "As alterações foram salvas com sucesso.",
    });
  }, [toast]);

  const deleteSubject = useCallback((id: string) => {
    const subject = subjects.find(s => s.id === id);
    setSubjects(prev => prev.filter(subject => subject.id !== id));
    setSelectedSubjects(prev => prev.filter(subjectId => subjectId !== id));
    toast({
      title: "Disciplina removida",
      description: `${subject?.name} foi removida com sucesso.`,
    });
  }, [subjects, toast]);

  const detectConflictsForClasses = useCallback((classSubjects: string[]): ScheduleConflict[] => {
    const conflicts: ScheduleConflict[] = [];
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
  }, [subjects]);

  const detectConflicts = useCallback((): ScheduleConflict[] => {
    return detectConflictsForClasses(selectedSubjects);
  }, [selectedSubjects, detectConflictsForClasses]);

  const toggleSubjectSelection = useCallback((subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  }, []);

  return {
    subjects,
    selectedSubjects,
    addSubject,
    updateSubject,
    deleteSubject,
    detectConflicts,
    detectConflictsForClasses,
    toggleSubjectSelection
  };
};
