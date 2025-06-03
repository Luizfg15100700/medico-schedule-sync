
import React from 'react';
import { Layout } from '@/components/Layout';
import { MainContent } from '@/components/MainContent';
import { AppModals } from '@/components/AppModals';
import { useIndexLogic } from '@/hooks/useIndexLogic';
import { useMenuHandlers } from '@/hooks/useMenuHandlers';

const Index = () => {
  const {
    // Data
    subjects,
    classes,
    selectedClass,
    setSelectedClass,
    currentClass,
    currentClassSubjects,
    conflicts,
    filters,
    setFilters,
    filteredSubjects,
    selectedSubjectsList,
    copyScheduleBetweenClasses,
    
    // App State
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
    
    // Handlers
    handleAddSubject,
    handleUpdateSubject,
    handleUpdateSchedule,
    handleDeleteSubject,
    handleExportPDF,
    handleExportCSV,
    handleCreateSchedule,
    handleSaveAdvancedSchedule,
    handleToggleSubjectInClass,
  } = useIndexLogic();

  const { handleMenuClick } = useMenuHandlers(setActiveView, openAddModal, handleExportPDF);

  return (
    <Layout onMenuClick={handleMenuClick}>
      <MainContent
        subjects={subjects}
        classes={classes}
        selectedClass={selectedClass}
        currentClass={currentClass}
        currentClassSubjects={currentClassSubjects}
        conflicts={conflicts}
        selectedSubjectsList={selectedSubjectsList}
        filteredSubjects={filteredSubjects}
        activeView={activeView}
        onClassChange={setSelectedClass}
        onCopySchedule={copyScheduleBetweenClasses}
        onOpenFilter={() => setIsFilterModalOpen(true)}
        onExportPDF={handleExportPDF}
        onExportCSV={handleExportCSV}
        onAddSubject={openAddModal}
        onToggleSubjectInClass={handleToggleSubjectInClass}
        onEditSubject={openEditModal}
        onDeleteSubject={handleDeleteSubject}
        onEditSchedule={openScheduleEditor}
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
    </Layout>
  );
};

export default Index;
