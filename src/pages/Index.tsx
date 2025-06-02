
import React from 'react';
import { Layout } from '@/components/Layout';
import { ScheduleGrid } from '@/components/ScheduleGrid';
import { SubjectCard } from '@/components/SubjectCard';
import { ConflictAlert } from '@/components/ConflictAlert';
import { WorkloadSummary } from '@/components/WorkloadSummary';
import { useSubjects } from '@/hooks/useSubjects';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Filter, Download } from 'lucide-react';

const Index = () => {
  const {
    subjects,
    selectedSubjects,
    detectConflicts,
    toggleSubjectSelection
  } = useSubjects();

  const conflicts = detectConflicts();
  const selectedSubjectsList = subjects.filter(s => selectedSubjects.includes(s.id));

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
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button className="medical-gradient">
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
              <Button className="medical-gradient">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Disciplina
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map(subject => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  isSelected={selectedSubjects.includes(subject.id)}
                  onToggleSelection={toggleSubjectSelection}
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
              <Button className="medical-gradient">
                Gerar Relatório Completo
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Index;
