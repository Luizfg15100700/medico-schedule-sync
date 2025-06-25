
import React from 'react';
import { Layout } from '@/components/Layout';
import { MainContent } from '@/components/MainContent';
import { AppModals } from '@/components/AppModals';
import { useIndexLogic } from '@/hooks/useIndexLogic';
import { useMenuHandlers } from '@/hooks/useMenuHandlers';

const Index = () => {
  console.log('Index component rendering...');
  
  try {
    const {
      // Data
      subjects = [],
      classes = [],
      selectedClass = '',
      setSelectedClass,
      currentClass,
      currentClassSubjects = [],
      conflicts = [],
      filters,
      setFilters,
      filteredSubjects = [],
      selectedSubjectsList = [],
      copyScheduleBetweenClasses,
      updateSubjectScheduleForClass,
      getSubjectScheduleForClass,
      
      // App State
      isAddModalOpen = false,
      isFilterModalOpen = false,
      isScheduleEditorOpen = false,
      editingSubject,
      editingScheduleSubject,
      activeView = 'schedule',
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
      handleSaveAdvancedSchedule,
      handleToggleSubjectInClass,
    } = useIndexLogic();

    console.log('Index data loaded:', { 
      subjects: subjects?.length || 0, 
      classes: classes?.length || 0,
      activeView 
    });

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
          onSaveAdvancedSchedule={handleSaveAdvancedSchedule}
          updateSubjectScheduleForClass={updateSubjectScheduleForClass}
          getSubjectScheduleForClass={getSubjectScheduleForClass}
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
  } catch (error) {
    console.error('Error in Index component:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro na aplicação</h1>
          <p className="text-gray-600 mb-4">Ocorreu um erro ao carregar a página.</p>
          <p className="text-sm text-gray-500">Verifique o console para mais detalhes.</p>
        </div>
      </div>
    );
  }
};

export default Index;
