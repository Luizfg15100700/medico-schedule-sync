
import React from 'react';
import { ScheduleInterface } from '@/components/interfaces/ScheduleInterface';
import { SubjectsInterface } from '@/components/interfaces/SubjectsInterface';
import { WorkloadInterface } from '@/components/interfaces/WorkloadInterface';
import { ConflictsInterface } from '@/components/interfaces/ConflictsInterface';
import { ReportsInterface } from '@/components/interfaces/ReportsInterface';
import { AdvancedScheduleInterface } from '@/components/interfaces/AdvancedScheduleInterface';
import { AcademicCalendarInterface } from '@/components/interfaces/AcademicCalendarInterface';
import { Subject } from '@/types';
import { ClassGroup, SubjectScheduleOverride } from '@/types/class';

interface ContentRendererProps {
  activeView: string;
  selectedSubjectsList: Subject[];
  currentClassSubjects: string[];
  conflicts: any[];
  currentClassName?: string;
  filteredSubjects: Subject[];
  subjects: Subject[];
  classes: ClassGroup[];
  onToggleSubjectInClass: (subjectId: string) => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  onEditSchedule: (subject: Subject) => void;
  onAddNew: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  onSaveAdvancedSchedule: (schedule: any) => void;
  // Props para o ClassSelector
  selectedClass: string;
  onClassChange: (classId: string) => void;
  onCopySchedule: (fromClassId: string, toClassId: string) => void;
  updateSubjectScheduleForClass: (classId: string, subjectId: string, scheduleOverride: SubjectScheduleOverride) => void;
  getSubjectScheduleForClass: (classId: string, subjectId: string, defaultSubject?: Subject) => SubjectScheduleOverride | null;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({
  activeView,
  selectedSubjectsList,
  currentClassSubjects,
  conflicts,
  currentClassName,
  filteredSubjects,
  subjects,
  classes,
  onToggleSubjectInClass,
  onEditSubject,
  onDeleteSubject,
  onEditSchedule,
  onAddNew,
  onExportPDF,
  onExportCSV,
  onSaveAdvancedSchedule,
  selectedClass,
  onClassChange,
  onCopySchedule,
  updateSubjectScheduleForClass,
  getSubjectScheduleForClass
}) => {
  const currentClass = classes.find(cls => cls.id === selectedClass);

  switch (activeView) {
    case 'academic-calendar':
      return <AcademicCalendarInterface />;

    case 'advanced-schedule':
      return (
        <AdvancedScheduleInterface
          subjects={subjects}
          classes={classes}
          onSaveSchedule={onSaveAdvancedSchedule}
        />
      );

    case 'subjects':
      return (
        <SubjectsInterface
          subjects={filteredSubjects}
          selectedSubjects={currentClassSubjects}
          onToggleSelection={onToggleSubjectInClass}
          onEdit={onEditSubject}
          onDelete={onDeleteSubject}
          onEditSchedule={onEditSchedule}
          onAddNew={onAddNew}
          classes={classes}
          selectedClass={selectedClass}
          onClassChange={onClassChange}
          onCopySchedule={onCopySchedule}
          updateSubjectScheduleForClass={updateSubjectScheduleForClass}
          getSubjectScheduleForClass={getSubjectScheduleForClass}
        />
      );

    case 'workload':
      return (
        <WorkloadInterface
          subjects={subjects}
          selectedSubjects={currentClassSubjects}
          classes={classes}
        />
      );

    case 'conflicts':
      return <ConflictsInterface conflicts={conflicts} />;

    case 'reports':
      return (
        <ReportsInterface
          onExportPDF={onExportPDF}
          onExportCSV={onExportCSV}
        />
      );

    default: // schedule
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Sistemas de Grades Horárias</h2>
            <div className="text-sm text-gray-600">
              {currentClassName} - {currentClassSubjects.length} disciplinas selecionadas
            </div>
          </div>
          <ScheduleInterface
            subjects={selectedSubjectsList}
            selectedSubjects={currentClassSubjects}
            conflicts={conflicts}
            currentClassName={currentClassName}
            selectedClass={currentClass}
            getSubjectScheduleForClass={getSubjectScheduleForClass}
          />
        </div>
      );
  }
};
