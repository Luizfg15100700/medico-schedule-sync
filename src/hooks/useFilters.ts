
import { useState, useMemo } from 'react';
import { Subject, ScheduleConflict } from '@/types';
import { FilterOptions } from '@/components/FilterModal';

export const useFilters = (subjects: Subject[], conflicts: ScheduleConflict[]) => {
  const [filters, setFilters] = useState<FilterOptions>({
    periods: [],
    daysOfWeek: [],
    classType: 'all',
    hasConflicts: null
  });

  const filteredSubjects = useMemo(() => {
    return subjects.filter(subject => {
      // Filter by periods
      if (filters.periods.length > 0 && !filters.periods.includes(subject.period)) {
        return false;
      }

      // Filter by days of week
      if (filters.daysOfWeek.length > 0) {
        const subjectDays = [
          ...subject.theoreticalClasses.map(c => c.dayOfWeek),
          ...subject.practicalClasses.map(c => c.dayOfWeek)
        ];
        if (!filters.daysOfWeek.some(day => subjectDays.includes(day as any))) {
          return false;
        }
      }

      // Filter by class type
      if (filters.classType === 'theoretical' && subject.theoreticalClasses.length === 0) {
        return false;
      }
      if (filters.classType === 'practical' && subject.practicalClasses.length === 0) {
        return false;
      }

      // Filter by conflicts
      if (filters.hasConflicts !== null) {
        const hasConflict = conflicts.some(conflict => 
          conflict.subject1.id === subject.id || conflict.subject2.id === subject.id
        );
        if (filters.hasConflicts && !hasConflict) {
          return false;
        }
        if (!filters.hasConflicts && hasConflict) {
          return false;
        }
      }

      return true;
    });
  }, [subjects, filters, conflicts]);

  return {
    filters,
    setFilters,
    filteredSubjects
  };
};
