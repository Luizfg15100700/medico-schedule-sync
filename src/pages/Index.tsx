
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ScheduleGrid } from '@/components/ScheduleGrid';
import { SubjectCard } from '@/components/SubjectCard';
import { ConflictAlert } from '@/components/ConflictAlert';
import { ConflictAnalysis } from '@/components/ConflictAnalysis';
import { WorkloadSummary } from '@/components/WorkloadSummary';
import { AddSubjectModal } from '@/components/AddSubjectModal';
import { ScheduleBuilder } from '@/components/ScheduleBuilder';
import { FilterModal, FilterOptions } from '@/components/FilterModal';
import { useSubjects } from '@/hooks/useSubjects';
import { useFilters } from '@/hooks/useFilters';
import { exportToPDF, exportToCSV } from '@/utils/exportUtils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    toggleSubjectSelection,
    addSubject,
    updateSubject,
    deleteSubject
  } = useSubjects();

  const conflicts = detectConflicts();
  const { filters, setFilters, filteredSubjects } = useFilters(subjects, conflicts);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | undefined>();
  const [activeView, setActiveView] = useState('schedule');

  const selectedSubjectsList = filteredSubjects.filter(s => selectedSubjects.includes(s.id));

  const handleMenuClick = (menuId: string) => {
    console.log('Menu clicked:', menuId);
    
    switch (menuId) {
      case 'schedule':
        setActiveView('schedule');
        break;
      case 'create-schedule':
        setActiveView('create-schedule');
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

  const handleUpdateSubject = (subjectData: any) => {
    if (editingSubject) {
      updateSubject(editingSubject.id, subjectData);
      setEditingSubject(undefined);
      setIsAddModalOpen(false);
    }
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
    exportToPDF(subjects, selectedSubjects);
    toast({
      title: "Exportação realizada",
      description: "Grade exportada como HTML com sucesso!",
    });
  };

  const handleExportCSV = () => {
    exportToCSV(subjects, selectedSubjects);
    toast({
      title: "Exportação realizada",
      description: "Grade exportada como CSV com sucesso!",
    });
  };

  const handleCreateSchedule = (schedule: {
    name: string;
    periods: string[];
    selectedSubjects: string[];
  }) => {
    console.log('Creating schedule:', schedule);
    toast({
      title: "Grade criada",
      description: `Grade "${schedule.name}" criada com ${schedule.selectedSubjects.length} disciplinas.`,
    });
  };

  const openAddModal = () => {
    setEditingSubject(undefined);
    setIsAddModalOpen(true);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'create-schedule':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Criar Grade de Horários</h2>
            </div>
            <ScheduleBuilder 
              subjects={subjects} 
              onCreateSchedule={handleCreateSchedule}
            />
          </div>
        );

      case 'subjects':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Gerenciar Disciplinas</h2>
              <Button className="medical-gradient" onClick={openAddModal}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Disciplina
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSubjects.map(subject => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  isSelected={selectedSubjects.includes(subject.id)}
                  onToggleSelection={toggleSubjectSelection}
                  onEdit={handleEditSubject}
                  onDelete={handleDeleteSubject}
                />
              ))}
            </div>
          </div>
        );

      case 'workload':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Análise de Carga Horária</h2>
            <WorkloadSummary 
              subjects={subjects} 
              selectedSubjects={selectedSubjects} 
            />
          </div>
        );

      case 'conflicts':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Análise de Conflitos</h2>
            <ConflictAnalysis conflicts={conflicts} />
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Relatórios e Estatísticas</h2>
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">
                Visualize análises detalhadas do seu aproveitamento acadêmico
              </p>
              <div className="flex justify-center gap-4">
                <Button className="medical-gradient" onClick={handleExportPDF}>
                  Gerar Relatório HTML
                </Button>
                <Button variant="outline" onClick={handleExportCSV}>
                  Gerar Relatório CSV
                </Button>
              </div>
            </div>
          </div>
        );

      default: // schedule
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Grade Horária Semanal</h2>
              <div className="text-sm text-gray-600">
                {selectedSubjects.length} disciplinas selecionadas
              </div>
            </div>
            <ScheduleGrid 
              subjects={selectedSubjectsList} 
              conflicts={conflicts} 
            />
          </div>
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
              Gerencie suas disciplinas e horários do curso de Medicina
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

        {/* Workload Summary - always visible */}
        <WorkloadSummary 
          subjects={subjects} 
          selectedSubjects={selectedSubjects} 
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
