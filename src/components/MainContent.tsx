
import React from 'react';
import { ConflictAlert } from '@/components/ConflictAlert';
import { WorkloadSummary } from '@/components/WorkloadSummary';
import { PageHeader } from '@/components/PageHeader';
import { ContentRenderer } from '@/components/ContentRenderer';
import { Subject } from '@/types';
import { ClassGroup } from '@/types/class';
import { ScheduleConflict } from '@/types';

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

      {/* Mostrar informações da turma atual apenas se não estivermos na aba de disciplinas */}
      {activeView !== 'subjects' && (
        <>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="font-medium text-gray-900 mb-2">
              Turma Atual: {currentClass?.name} - {currentClass?.period}º Período
            </h3>
            <p className="text-sm text-gray-600">
              {currentClassSubjects.length} disciplinas ativas
            </p>
          </div>

          <WorkloadSummary 
            subjects={subjects} 
            selectedSubjects={currentClassSubjects} 
          />

          <ConflictAlert conflicts={conflicts} />
        </>
      )}

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
        onSaveAdvancedSchedule={onSaveAdvancedSchedule}
        selectedClass={selectedClass}
        onClassChange={onClassChange}
        onCopySchedule={onCopySchedule}
      />
    </div>
  );
};
