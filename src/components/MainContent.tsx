
import React from 'react';
import { ConflictAlert } from '@/components/ConflictAlert';
import { WorkloadSummary } from '@/components/WorkloadSummary';
import { ClassSelector } from '@/components/ClassSelector';
import { PageHeader } from '@/components/PageHeader';
import { ContentRenderer } from '@/components/ContentRenderer';
import { Subject } from '@/types';
import { ClassGroup } from '@/types/class';
import { ScheduleConflict } from '@/types';
import { FilterOptions } from '@/components/FilterModal';

interface MainContentProps {
  subjects: Subject[];
  classes: ClassGroup[];
  selectedClass: string;
  currentClass?: ClassGroup;
  currentClassSubjects: string[];
  conflicts: ScheduleConflict[];
  selectedSubjectsList: Subject[];
  filteredSubjects: Subject[];
  activeView: string;
  onClassChange: (classId: string) => void;
  onCopySchedule: (fromClassId: string, toClassId: string) => void;
  onOpenFilter: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  onAddSubject: () => void;
  onToggleSubjectInClass: (subjectId: string) => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onEditSchedule: (subject: Subject) => void;
  onCreateSchedule: (schedule: any) => void;
  onSaveAdvancedSchedule: (schedule: any) => void;
}

export const MainContent: React.FC<MainContentProps> = ({
  subjects,
  classes,
  selectedClass,
  currentClass,
  currentClassSubjects,
  conflicts,
  selectedSubjectsList,
  filteredSubjects,
  activeView,
  onClassChange,
  onCopySchedule,
  onOpenFilter,
  onExportPDF,
  onExportCSV,
  onAddSubject,
  onToggleSubjectInClass,
  onEditSubject,
  onDeleteSubject,
  onEditSchedule,
  onCreateSchedule,
  onSaveAdvancedSchedule
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        onOpenFilter={onOpenFilter}
        onExportPDF={onExportPDF}
        onExportCSV={onExportCSV}
        onAddSubject={onAddSubject}
      />

      <ClassSelector
        classes={classes}
        selectedClass={selectedClass}
        onClassChange={onClassChange}
        onCopySchedule={onCopySchedule}
      />

      <WorkloadSummary 
        subjects={subjects} 
        selectedSubjects={currentClassSubjects} 
      />

      <ConflictAlert conflicts={conflicts} />

      <ContentRenderer
        activeView={activeView}
        selectedSubjectsList={selectedSubjectsList}
        currentClassSubjects={currentClassSubjects}
        conflicts={conflicts}
        currentClassName={currentClass?.name}
        filteredSubjects={filteredSubjects}
        subjects={subjects}
        classes={classes}
        onToggleSubjectInClass={onToggleSubjectInClass}
        onEditSubject={onEditSubject}
        onDeleteSubject={onDeleteSubject}
        onEditSchedule={onEditSchedule}
        onAddNew={onAddSubject}
        onExportPDF={onExportPDF}
        onExportCSV={onExportCSV}
        onCreateSchedule={onCreateSchedule}
        onSaveAdvancedSchedule={onSaveAdvancedSchedule}
      />
    </div>
  );
};
