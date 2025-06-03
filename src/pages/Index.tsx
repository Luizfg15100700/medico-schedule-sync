import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ConflictAlert } from '@/components/ConflictAlert';
import { WorkloadSummary } from '@/components/WorkloadSummary';
import { AddSubjectModal } from '@/components/AddSubjectModal';
import { ClassSelector } from '@/components/ClassSelector';
import { ClassScheduleEditor } from '@/components/ClassScheduleEditor';
import { FilterModal, FilterOptions } from '@/components/FilterModal';

// Importar todas as interfaces
import { ScheduleInterface } from '@/components/interfaces/ScheduleInterface';
import { SubjectsInterface } from '@/components/interfaces/SubjectsInterface';
import { WorkloadInterface } from '@/components/interfaces/WorkloadInterface';
import { ConflictsInterface } from '@/components/interfaces/ConflictsInterface';
import { ReportsInterface } from '@/components/interfaces/ReportsInterface';
import { ScheduleBuilderInterface } from '@/components/interfaces/ScheduleBuilderInterface';
import { AdvancedScheduleInterface } from '@/components/interfaces/AdvancedScheduleInterface';
import { AcademicCalendarInterface } from '@/components/interfaces/AcademicCalendarInterface';

import { useSubjects } from '@/hooks/useSubjects';
import { useClasses } from '@/hooks/useClasses';
import { useFilters } from '@/hooks/useFilters';
import { useAcademicCalendar } from '@/hooks/useAcademicCalendar';
import { exportToPDF, exportToCSV } from '@/utils/exportUtils';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Filter, Download, ChevronDown } from 'lucide-react';
import { Subject } from '@/types';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const {
    subjects,
    selectedSubjects,
    detectConflicts,
    detectConflictsForClasses,
    toggleSubjectSelection,
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
  const conflicts = detectConflictsForClasses(currentClassSubjects);
  const { filters, setFilters, filteredSubjects } = useFilters(subjects, conflicts);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isScheduleEditorOpen, setIsScheduleEditorOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | undefined>();
  const [editingScheduleSubject, setEditingScheduleSubject] = useState<Subject | undefined>();
  const [activeView, setActiveView] = useState('schedule');

  const selectedSubjectsList = filteredSubjects.filter(s => currentClassSubjects.includes(s.id));

  const handleMenuClick = (menuId: string) => {
    console.log('Menu clicked:', menuId);
    
    switch (menuId) {
      case 'schedule':
        setActiveView('schedule');
        break;
      case 'create-schedule':
        setActiveView('create-schedule');
        break;
      case 'advanced-schedule':
        setActiveView('advanced-schedule');
        break;
      case 'academic-calendar':
        setActiveView('academic-calendar');
        break;
      case 'subjects':
        setActiveView('subjects');
        break;
      case 'new-subject':
        openAddModal();
        break;
      case 'workload':
        setActiveView('workload');
        break;
      case 'conflicts':
        setActiveView('conflicts');
        break;
      case 'reports':
        setActiveView('reports');
        break;
      case 'export':
        handleExportPDF();
        break;
      case 'settings':
        toast({
          title: "Configurações",
          description: "Funcionalidade em desenvolvimento",
        });
        break;
      default:
        break;
    }
  };

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
    setIsAddModalOpen(false);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setIsAddModalOpen(true);
  };

  const handleEditSchedule = (subject: Subject) => {
    setEditingScheduleSubject(subject);
    setIsScheduleEditorOpen(true);
  };

  const handleUpdateSubject = (subjectData: any) => {
    if (editingSubject) {
      updateSubject(editingSubject.id, subjectData);
      setEditingSubject(undefined);
      setIsAddModalOpen(false);
    }
  };

  const handleUpdateSchedule = (updatedSubject: Subject) => {
    updateSubject(updatedSubject.id, updatedSubject);
    setEditingScheduleSubject(undefined);
    setIsScheduleEditorOpen(false);
  };

  const handleDeleteSubject = (subjectId: string) => {
    if (confirm('Tem certeza que deseja excluir esta disciplina?')) {
      deleteSubject(subjectId);
    }
  };

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
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

  const openAddModal = () => {
    setEditingSubject(undefined);
    setIsAddModalOpen(true);
  };

  const handleToggleSubjectInClass = (subjectId: string) => {
    if (currentClassSubjects.includes(subjectId)) {
      removeSubjectFromClass(selectedClass, subjectId);
    } else {
      addSubjectToClass(selectedClass, subjectId);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'academic-calendar':
        return <AcademicCalendarInterface />;

      case 'advanced-schedule':
        return (
          <AdvancedScheduleInterface
            subjects={subjects}
            classes={classes}
            onSaveSchedule={handleSaveAdvancedSchedule}
          />
        );

      case 'create-schedule':
        return (
          <ScheduleBuilderInterface
            subjects={subjects}
            classes={classes}
            onCreateSchedule={handleCreateSchedule}
          />
        );

      case 'subjects':
        return (
          <SubjectsInterface
            subjects={filteredSubjects}
            selectedSubjects={currentClassSubjects}
            onToggleSelection={handleToggleSubjectInClass}
            onEdit={handleEditSubject}
            onDelete={handleDeleteSubject}
            onEditSchedule={handleEditSchedule}
            onAddNew={openAddModal}
          />
        );

      case 'workload':
        return (
          <WorkloadInterface
            subjects={subjects}
            selectedSubjects={currentClassSubjects}
          />
        );

      case 'conflicts':
        return <ConflictsInterface conflicts={conflicts} />;

      case 'reports':
        return (
          <ReportsInterface
            onExportPDF={handleExportPDF}
            onExportCSV={handleExportCSV}
          />
        );

      default: // schedule
        return (
          <ScheduleInterface
            subjects={selectedSubjectsList}
            selectedSubjects={currentClassSubjects}
            conflicts={conflicts}
            currentClassName={currentClass?.name}
          />
        );
    }
  };

  return (
    <Layout onMenuClick={handleMenuClick}>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Sistema de Grades Horárias
            </h1>
            <p className="text-gray-600 mt-1">
              Gerencie suas disciplinas e horários do curso de Medicina por turmas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setIsFilterModalOpen(true)}>
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportPDF}>
                  Exportar como HTML
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportCSV}>
                  Exportar como CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="medical-gradient" onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Disciplina
            </Button>
          </div>
        </div>

        {/* Class Selector */}
        <ClassSelector
          classes={classes}
          selectedClass={selectedClass}
          onClassChange={setSelectedClass}
          onCopySchedule={copyScheduleBetweenClasses}
        />

        {/* Workload Summary - always visible */}
        <WorkloadSummary 
          subjects={subjects} 
          selectedSubjects={currentClassSubjects} 
        />

        {/* Conflict Alerts - always visible */}
        <ConflictAlert conflicts={conflicts} />

        {/* Main Content */}
        {renderContent()}

        {/* Modals */}
        <AddSubjectModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingSubject(undefined);
          }}
          onSave={editingSubject ? handleUpdateSubject : handleAddSubject}
          subject={editingSubject}
        />

        {editingScheduleSubject && (
          <ClassScheduleEditor
            isOpen={isScheduleEditorOpen}
            onClose={() => {
              setIsScheduleEditorOpen(false);
              setEditingScheduleSubject(undefined);
            }}
            subject={editingScheduleSubject}
            onSave={handleUpdateSchedule}
          />
        )}

        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          onApplyFilters={handleApplyFilters}
          currentFilters={filters}
        />
      </div>
    </Layout>
  );
};

export default Index;
