
import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { ScheduleGrid } from '@/components/ScheduleGrid';
import { SubjectCard } from '@/components/SubjectCard';
import { ConflictAlert } from '@/components/ConflictAlert';
import { WorkloadSummary } from '@/components/WorkloadSummary';
import { AddSubjectModal } from '@/components/AddSubjectModal';
import { FilterModal, FilterOptions } from '@/components/FilterModal';
import { useSubjects } from '@/hooks/useSubjects';
import { useFilters } from '@/hooks/useFilters';
import { exportToPDF, exportToCSV } from '@/utils/exportUtils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Filter, Download, ChevronDown } from 'lucide-react';
import { Subject } from '@/types';

const Index = () => {
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

  const selectedSubjectsList = filteredSubjects.filter(s => selectedSubjects.includes(s.id));

  const handleAddSubject = (subject: Omit<Subject, 'id'>) => {
    addSubject(subject);
    setIsAddModalOpen(false);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setIsAddModalOpen(true);
  };

  const handleUpdateSubject = (subjectData: Omit<Subject, 'id'>) => {
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
  };

  const handleExportCSV = () => {
    exportToCSV(subjects, selectedSubjects);
  };

  const openAddModal = () => {
    setEditingSubject(undefined);
    setIsAddModalOpen(true);
  };

  return (
    <Layout>
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

        {/* Workload Summary */}
        <WorkloadSummary 
          subjects={subjects} 
          selectedSubjects={selectedSubjects} 
        />

        {/* Conflict Alerts */}
        <ConflictAlert conflicts={conflicts} />

        {/* Main Content */}
        <Tabs defaultValue="schedule" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="schedule">Grade Horária</TabsTrigger>
            <TabsTrigger value="subjects">Disciplinas</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Grade Horária Semanal
              </h2>
              <div className="text-sm text-gray-600">
                {selectedSubjects.length} disciplinas selecionadas
              </div>
            </div>
            <ScheduleGrid 
              subjects={selectedSubjectsList} 
              conflicts={conflicts} 
            />
          </TabsContent>

          <TabsContent value="subjects" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Gerenciar Disciplinas
              </h2>
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
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">
                Relatórios e Estatísticas
              </h2>
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
          </TabsContent>
        </Tabs>

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
