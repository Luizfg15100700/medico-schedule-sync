
import { useState, useCallback } from 'react';
import { Subject, ClassSchedule, ScheduleConflict } from '@/types';

export const useSubjects = () => {
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
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    };
    setSubjects(prev => [...prev, newSubject]);
  }, []);

  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(subject => 
      subject.id === id ? { ...subject, ...updates } : subject
    ));
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setSubjects(prev => prev.filter(subject => subject.id !== id));
    setSelectedSubjects(prev => prev.filter(subjectId => subjectId !== id));
  }, []);

  const detectConflicts = useCallback((): ScheduleConflict[] => {
    const conflicts: ScheduleConflict[] = [];
    const selected = subjects.filter(s => selectedSubjects.includes(s.id));
    
    for (let i = 0; i < selected.length; i++) {
      for (let j = i + 1; j < selected.length; j++) {
        const subject1 = selected[i];
        const subject2 = selected[j];
        
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
      }
    }
    
    return conflicts;
  }, [subjects, selectedSubjects]);

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
    toggleSubjectSelection
  };
};
