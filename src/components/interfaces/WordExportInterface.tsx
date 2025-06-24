
import React from 'react';
import { WordScheduleBuilder } from '@/components/WordScheduleBuilder';
import { Subject } from '@/types';
import { ClassGroup, SubjectScheduleOverride } from '@/types/class';

interface WordExportInterfaceProps {
  subjects: Subject[];
  classes: ClassGroup[];
  getSubjectScheduleForClass?: (classId: string, subjectId: string, defaultSubject?: Subject) => SubjectScheduleOverride | null;
}

export const WordExportInterface: React.FC<WordExportInterfaceProps> = ({
  subjects,
  classes,
  getSubjectScheduleForClass
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Exportar Grade para Word</h2>
          <p className="text-sm text-gray-600 mt-1">
            Crie e exporte grades horárias em formato Word (.docx) com formatação profissional
          </p>
        </div>
      </div>
      <WordScheduleBuilder 
        subjects={subjects}
        classes={classes}
        getSubjectScheduleForClass={getSubjectScheduleForClass}
      />
    </div>
  );
};
