
import React from 'react';
import { ScheduleGrid } from '@/components/ScheduleGrid';
import { Subject, ScheduleConflict } from '@/types';
import { ClassGroup, SubjectScheduleOverride } from '@/types/class';

interface ScheduleInterfaceProps {
  subjects: Subject[];
  selectedSubjects: string[];
  conflicts: ScheduleConflict[];
  currentClassName?: string;
  selectedClass?: ClassGroup;
  getSubjectScheduleForClass?: (classId: string, subjectId: string, defaultSubject?: Subject) => SubjectScheduleOverride | null;
}

export const ScheduleInterface: React.FC<ScheduleInterfaceProps> = ({
  subjects,
  selectedSubjects,
  conflicts,
  currentClassName,
  selectedClass,
  getSubjectScheduleForClass
}) => {
  const selectedSubjectsList = subjects.filter(s => selectedSubjects.includes(s.id));

  const customScheduleCount = selectedClass && getSubjectScheduleForClass
    ? selectedSubjectsList.filter(subject => 
        getSubjectScheduleForClass(selectedClass.id, subject.id, subject)?.hasCustomSchedule
      ).length
    : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Grade Horária Semanal</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>{currentClassName} - {selectedSubjects.length} disciplinas ativas</div>
          {customScheduleCount > 0 && (
            <div className="text-green-600 font-medium">
              {customScheduleCount} disciplina(s) com horário customizado
            </div>
          )}
        </div>
      </div>
      <ScheduleGrid 
        subjects={selectedSubjectsList} 
        conflicts={conflicts}
        selectedClass={selectedClass}
        getSubjectScheduleForClass={getSubjectScheduleForClass}
      />
    </div>
  );
};
