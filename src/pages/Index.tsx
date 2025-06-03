
import React from 'react';
import { Layout } from '@/components/Layout';
import { ConflictAlert } from '@/components/ConflictAlert';
import { WorkloadSummary } from '@/components/WorkloadSummary';
import { ClassSelector } from '@/components/ClassSelector';
import { PageHeader } from '@/components/PageHeader';
import { ContentRenderer } from '@/components/ContentRenderer';
import { AppModals } from '@/components/AppModals';

import { useSubjects } from '@/hooks/useSubjects';
import { useClasses } from '@/hooks/useClasses';
import { useFilters } from '@/hooks/useFilters';
import { useAcademicCalendar } from '@/hooks/useAcademicCalendar';
import { useAppState } from '@/hooks/useAppState';
import { useMenuHandlers } from '@/hooks/useMenuHandlers';
import { exportToPDF, exportToCSV } from '@/utils/exportUtils';
import { Subject } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject
  } = useSubjects();

  const {
    classes,
    selectedClass,
    setSelectedClass,
    addSubjectToClass,
    removeSubjectFromClass,
    copyScheduleBetweenClasses
  } = useClasses();

  const { saveScheduleTemplate } = useAcademicCalendar();

  const currentClass = classes.find(cls => cls.id === selectedClass);
  const currentClassSubjects = currentClass ? currentClass.subjects : [];
  const conflicts = useSubjects().detectConflictsForClasses(currentClassSubjects);
  const { filters, setFilters, filteredSubjects } = useFilters(subjects, conflicts);
  
  const {
    isAddModalOpen,
    isFilterModalOpen,
    isScheduleEditorOpen,
    editingSubject,
    editingScheduleSubject,
    activeView,
    setIsFilterModalOpen,
    setActiveView,
    openAddModal,
    closeAddModal,
    openEditModal,
    openScheduleEditor,
    closeScheduleEditor,
  } = useAppState();

  const selectedSubjectsList = filteredSubjects.filter(s => currentClassSubjects.includes(s.id));

  const handleAddSubject = (subject: {
    name: string;
    period: Subject['period'];
    professor: string;
    location: string;
    totalWorkload: number;
    theoreticalClasses: any[];
    practicalClasses: any[];
  }) => {
    addSubject(subject);
    closeAddModal();
  };

  const handleUpdateSubject = (subjectData: any) => {
    if (editingSubject) {
      updateSubject(editingSubject.id, subjectData);
      closeAddModal();
    }
  };

  const handleUpdateSchedule = (updatedSubject: Subject) => {
    updateSubject(updatedSubject.id, updatedSubject);
    closeScheduleEditor();
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (confirm('Tem certeza que deseja excluir esta disciplina?')) {
      deleteSubject(subjectId);
    }
  };

  const handleExportPDF = () => {
    exportToPDF(subjects, currentClassSubjects);
    toast({
      title: "Exportação realizada",
      description: "Grade exportada como HTML com sucesso!",
    });
  };

  const handleExportCSV = () => {
    exportToCSV(subjects, currentClassSubjects);
    toast({
      title: "Exportação realizada",
      description: "Grade exportada como CSV com sucesso!",
    });
  };

  const handleCreateSchedule = (schedule: {
    name: string;
    periods: string[];
    selectedSubjects: { subjectId: string; classId: string }[];
  }) => {
    console.log('Creating schedule:', schedule);
    toast({
      title: "Grade criada",
      description: `Grade "${schedule.name}" criada com ${schedule.selectedSubjects.length} disciplinas/turmas.`,
    });
  };

  const handleSaveAdvancedSchedule = (schedule: {
    name: string;
    academicPeriodId: string;
    assignments: any[];
  }) => {
    saveScheduleTemplate({
      name: schedule.name,
      academicPeriodId: schedule.academicPeriodId,
      subjects: schedule.assignments
    });
  };

  const handleToggleSubjectInClass = (subjectId: string) => {
    if (currentClassSubjects.includes(subjectId)) {
      removeSubjectFromClass(selectedClass, subjectId);
    } else {
      addSubjectToClass(selectedClass, subjectId);
    }
  };

  const { handleMenuClick } = useMenuHandlers(setActiveView, openAddModal, handleExportPDF);

  return (
    <Layout onMenuClick={handleMenuClick}>
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          onOpenFilter={() => setIsFilterModalOpen(true)}
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
          onAddSubject={openAddModal}
        />

        <ClassSelector
          classes={classes}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          onCopySchedule={copyScheduleBetweenClasses}
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
          onToggleSubjectInClass={handleToggleSubjectInClass}
          onEditSubject={openEditModal}
          onDeleteSubject={handleDeleteSubject}
          onEditSchedule={openScheduleEditor}
          onAddNew={openAddModal}
          onExportPDF={handleExportPDF}
          onExportCSV={handleExportCSV}
          onCreateSchedule={handleCreateSchedule}
          onSaveAdvancedSchedule={handleSaveAdvancedSchedule}
        />

        <AppModals
          isAddModalOpen={isAddModalOpen}
          isFilterModalOpen={isFilterModalOpen}
          isScheduleEditorOpen={isScheduleEditorOpen}
          editingSubject={editingSubject}
          editingScheduleSubject={editingScheduleSubject}
          filters={filters}
          onCloseAddModal={closeAddModal}
          onCloseFilterModal={() => setIsFilterModalOpen(false)}
          onCloseScheduleEditor={closeScheduleEditor}
          onSaveSubject={handleAddSubject}
          onUpdateSubject={handleUpdateSubject}
          onUpdateSchedule={handleUpdateSchedule}
          onApplyFilters={setFilters}
        />
      </div>
    </Layout>
  );
};

export default Index;
