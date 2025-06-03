
import React from 'react';
import { AdvancedScheduleBuilder } from '@/components/AdvancedScheduleBuilder';
import { Subject } from '@/types';
import { ClassGroup } from '@/types/class';

interface AdvancedScheduleInterfaceProps {
  subjects: Subject[];
  classes: ClassGroup[];
  onSaveSchedule: (schedule: {
    name: string;
    academicPeriodId: string;
    assignments: any[];
  }) => void;
}

export const AdvancedScheduleInterface: React.FC<AdvancedScheduleInterfaceProps> = ({
  subjects,
  classes,
  onSaveSchedule
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Criador Avançado de Grades</h2>
      </div>
      <AdvancedScheduleBuilder 
        subjects={subjects}
        classes={classes}
        onSaveSchedule={onSaveSchedule}
      />
    </div>
  );
};
