
import React from 'react';
import { ScheduleBuilder } from '@/components/ScheduleBuilder';
import { Subject } from '@/types';
import { ClassGroup } from '@/types/class';

interface ScheduleBuilderInterfaceProps {
  subjects: Subject[];
  classes: ClassGroup[];
  onCreateSchedule: (schedule: {
    name: string;
    periods: string[];
    selectedSubjects: { subjectId: string; classId: string }[];
  }) => void;
}

export const ScheduleBuilderInterface: React.FC<ScheduleBuilderInterfaceProps> = ({
  subjects,
  classes,
  onCreateSchedule
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Criar Grade de Horários</h2>
      </div>
      <ScheduleBuilder 
        subjects={subjects}
        classes={classes}
        onCreateSchedule={onCreateSchedule}
      />
    </div>
  );
};
