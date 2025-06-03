
import React from 'react';
import { ScheduleGrid } from '@/components/ScheduleGrid';
import { Subject } from '@/types';
import { ConflictResult } from '@/types';

interface ScheduleInterfaceProps {
  subjects: Subject[];
  selectedSubjects: string[];
  conflicts: ConflictResult[];
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
        <h2 className="text-xl font-semibold">Grade Horária Semanal</h2>
        <div className="text-sm text-gray-600">
          {currentClassName} - {selectedSubjects.length} disciplinas selecionadas
        </div>
      </div>
      <ScheduleGrid 
        subjects={selectedSubjectsList} 
        conflicts={conflicts} 
      />
    </div>
  );
};
