
import React from 'react';
import { ScheduleGrid } from '@/components/ScheduleGrid';
import { Subject, ScheduleConflict } from '@/types';

interface ScheduleInterfaceProps {
  subjects: Subject[];
  selectedSubjects: string[];
  conflicts: ScheduleConflict[];
  currentClassName?: string;
}

export const ScheduleInterface: React.FC<ScheduleInterfaceProps> = ({
  subjects,
  selectedSubjects,
  conflicts,
  currentClassName
}) => {
  const selectedSubjectsList = subjects.filter(s => selectedSubjects.includes(s.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Grade Horária Semanal</h3>
        <div className="text-sm text-gray-600">
          {currentClassName} - {selectedSubjects.length} disciplinas ativas
        </div>
      </div>
      <ScheduleGrid 
        subjects={selectedSubjectsList} 
        conflicts={conflicts} 
      />
    </div>
  );
};
