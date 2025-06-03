
import { useState, useCallback } from 'react';
import { Subject } from '@/types';
import { ConflictAnalysisResult, ScheduleSubjectAssignment } from '@/types/academic';
import { ClassGroup } from '@/types/class';

const CONFLICT_THRESHOLD = 0.25; // 25%

export const useAdvancedScheduleBuilder = () => {
  const [selectedSubjects, setSelectedSubjects] = useState<ScheduleSubjectAssignment[]>([]);

  const calculateConflicts = useCallback((
    subjects: Subject[], 
    assignments: ScheduleSubjectAssignment[]
  ): ConflictAnalysisResult[] => {
    const results: ConflictAnalysisResult[] = [];
    
    // Agrupar por horários
    const timeSlots: { [key: string]: ScheduleSubjectAssignment[] } = {};
    
    assignments.forEach(assignment => {
      const subject = subjects.find(s => s.id === assignment.subjectId);
      if (!subject) return;

      [...subject.theoreticalClasses, ...subject.practicalClasses].forEach(classItem => {
        const timeKey = `${classItem.dayOfWeek}-${classItem.startTime}-${classItem.endTime}`;
        if (!timeSlots[timeKey]) {
          timeSlots[timeKey] = [];
        }
        timeSlots[timeKey].push(assignment);
      });
    });

    // Analisar conflitos
    Object.values(timeSlots).forEach(conflictingAssignments => {
      if (conflictingAssignments.length > 1) {
        const conflictDetails = [];
        
        for (let i = 0; i < conflictingAssignments.length; i++) {
          for (let j = i + 1; j < conflictingAssignments.length; j++) {
            const assignment1 = conflictingAssignments[i];
            const assignment2 = conflictingAssignments[j];
            
            const subject1 = subjects.find(s => s.id === assignment1.subjectId);
            const subject2 = subjects.find(s => s.id === assignment2.subjectId);
            
            if (subject1 && subject2) {
              const overlapHours = 2; // Simplificado - calcular sobreposição real
              const percentage1 = overlapHours / subject1.totalWorkload;
              const percentage2 = overlapHours / subject2.totalWorkload;
              const maxPercentage = Math.max(percentage1, percentage2);
              
              conflictDetails.push({
                subject1: subject1.name,
                subject2: subject2.name,
                overlapHours,
                totalHours1: subject1.totalWorkload,
                totalHours2: subject2.totalWorkload,
                percentage: maxPercentage
              });
            }
          }
        }

        const maxConflictPercentage = Math.max(...conflictDetails.map(d => d.percentage));
        
        results.push({
          conflictingSubjects: conflictingAssignments.map(a => a.subjectId),
          overlapPercentage: maxConflictPercentage,
          isWithinThreshold: maxConflictPercentage <= CONFLICT_THRESHOLD,
          conflictDetails
        });
      }
    });

    return results;
  }, []);

  const addSubjectToSchedule = useCallback((assignment: ScheduleSubjectAssignment) => {
    setSelectedSubjects(prev => [...prev, assignment]);
  }, []);

  const removeSubjectFromSchedule = useCallback((subjectId: string, classId: string) => {
    setSelectedSubjects(prev => 
      prev.filter(a => !(a.subjectId === subjectId && a.classId === classId))
    );
  }, []);

  const acceptConflict = useCallback((subjectId: string, classId: string) => {
    setSelectedSubjects(prev => prev.map(assignment => 
      assignment.subjectId === subjectId && assignment.classId === classId
        ? { ...assignment, isConflictAccepted: true }
        : assignment
    ));
  }, []);

  const clearSchedule = useCallback(() => {
    setSelectedSubjects([]);
  }, []);

  return {
    selectedSubjects,
    addSubjectToSchedule,
    removeSubjectFromSchedule,
    acceptConflict,
    clearSchedule,
    calculateConflicts,
    CONFLICT_THRESHOLD
  };
};
