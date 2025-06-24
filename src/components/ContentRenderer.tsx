import React from 'react';
import { ScheduleGrid } from '@/components/ScheduleGrid';
import { SubjectList } from '@/components/SubjectList';
import { ConflictList } from '@/components/ConflictList';
import { WorkloadReportList } from '@/components/WorkloadReportList';
import { ScheduleBuilderInterface } from '@/components/interfaces/ScheduleBuilderInterface';
import { AdvancedScheduleInterface } from '@/components/interfaces/AdvancedScheduleInterface';
import { Subject } from '@/types';
import { ClassGroup, SubjectScheduleOverride } from '@/types/class';
import { ScheduleConflict } from '@/types';
import { WordExportInterface } from '@/components/interfaces/WordExportInterface';

interface ContentRendererProps {
  activeView: string;
  selectedSubjectsList: Subject[];
  currentClassSubjects: string[];
  conflicts: ScheduleConflict[];
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
  selectedClass?: string;
  onClassChange: (classId: string) => void;
  onCopySchedule: (fromClassId: string, toClassId: string) => void;
  updateSubjectScheduleForClass: (classId: string, subjectId: string, scheduleOverride: SubjectScheduleOverride) => void;
  getSubjectScheduleForClass: (classId: string, subjectId: string, defaultSubject?: Subject) => SubjectScheduleOverride | null;
}

export const ContentRenderer: React.FC<ContentRendererProps> = (props) => {
  const {
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
  } = props;

  switch (activeView) {
    case 'schedule':
      return (
        <ScheduleGrid 
          subjects={subjects} 
          conflicts={conflicts} 
          selectedClass={classes.find(cls => cls.id === selectedClass)}
          getSubjectScheduleForClass={getSubjectScheduleForClass}
        />
      );

    case 'subjects':
      return (
        <SubjectList
          subjects={filteredSubjects}
          currentClassSubjects={currentClassSubjects}
          onToggleSubject={onToggleSubjectInClass}
          onEdit={onEditSubject}
          onDelete={onDeleteSubject}
          onEditSchedule={onEditSchedule}
          onAddNew={onAddNew}
          onExportPDF={onExportPDF}
          onExportCSV={onExportCSV}
        />
      );

    case 'conflicts':
      return <ConflictList conflicts={conflicts} />;

    case 'reports':
      const workloadReports = subjects.map(subject => {
        const totalWorkload = subject.totalWorkload;
        const scheduledWorkload = [...subject.theoreticalClasses, ...subject.practicalClasses]
          .reduce((sum, cls) => sum + cls.workload, 0);
        const conflictedWorkload = conflicts
          .filter(conflict => conflict.subject1.id === subject.id || conflict.subject2.id === subject.id)
          .reduce((sum, conflict) => sum + conflict.overlapMinutes / 60, 0);
        const availableWorkload = totalWorkload - scheduledWorkload;
        const utilizationPercentage = (scheduledWorkload / totalWorkload) * 100;

        return {
          subjectId: subject.id,
          totalWorkload,
          scheduledWorkload,
          conflictedWorkload,
          availableWorkload,
          utilizationPercentage
        };
      });
      return <WorkloadReportList reports={workloadReports} />;

    case 'workload':
      return (
        <div>
          <h2>Visão Geral da Carga Horária</h2>
          <p>
            Aqui você pode ver um resumo da carga horária total, agendada e disponível para cada disciplina.
          </p>
        </div>
      );

    case 'schedule-builder':
      return (
        <ScheduleBuilderInterface
          subjects={subjects}
          classes={classes}
          onCreateSchedule={(schedule) => {
            console.log('Criar grade:', schedule);
            alert(`Grade "${schedule.name}" criada com sucesso!`);
          }}
        />
      );

    case 'advanced-schedule':
      return (
        <AdvancedScheduleInterface
          subjects={subjects}
          classes={classes}
          onSaveSchedule={onSaveAdvancedSchedule}
        />
      );

    case 'word-export':
      return (
        <WordExportInterface
          subjects={subjects}
          classes={classes}
          getSubjectScheduleForClass={getSubjectScheduleForClass}
        />
      );

    case 'calendar':
      return (
        <div>
          <h2>Calendário Acadêmico</h2>
          <p>
            Visualize o calendário acadêmico com feriados e eventos importantes.
          </p>
        </div>
      );

    default:
      return (
        <div>
          <h2>Bem-vindo(a)!</h2>
          <p>
            Selecione uma opção no menu para começar.
          </p>
        </div>
      );
  }
};
