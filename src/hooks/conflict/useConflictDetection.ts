
import { Subject } from '@/types';

export const useConflictDetection = () => {
  const detectConflictsForClasses = (subjects: Subject[], classSubjects: string[]) => {
    if (!subjects || subjects.length === 0) return [];
    
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
            const allClasses1 = [...(subject1.theoreticalClasses || []), ...(subject1.practicalClasses || [])];
            const allClasses2 = [...(subject2.theoreticalClasses || []), ...(subject2.practicalClasses || [])];
            
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

  return {
    detectConflictsForClasses
  };
};
