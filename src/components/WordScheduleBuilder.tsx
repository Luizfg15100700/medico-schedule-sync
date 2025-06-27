
import React, { useState, useEffect } from 'react';
import { Subject, PERIODS } from '@/types';
import { ClassGroup, SubjectScheduleOverride } from '@/types/class';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Calendar, Users } from 'lucide-react';
import { exportScheduleToWord } from '@/utils/wordExportUtils';
import { useToast } from '@/hooks/use-toast';

interface WordScheduleBuilderProps {
  subjects: Subject[];
  classes: ClassGroup[];
  getSubjectScheduleForClass?: (classId: string, subjectId: string, defaultSubject?: Subject) => SubjectScheduleOverride | null;
}

interface SelectedSubject {
  subjectId: string;
  period: string;
}

export const WordScheduleBuilder: React.FC<WordScheduleBuilderProps> = ({
  subjects,
  classes,
  getSubjectScheduleForClass
}) => {
  const { toast } = useToast();
  const [scheduleName, setScheduleName] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubjects, setSelectedSubjects] = useState<SelectedSubject[]>([]);

  console.log('WordScheduleBuilder - subjects:', subjects?.length || 0);
  console.log('WordScheduleBuilder - classes:', classes?.length || 0);
  console.log('WordScheduleBuilder - selectedSubjects:', selectedSubjects);

  const currentClass = selectedClass !== 'all' ? classes.find(cls => cls.id === selectedClass) : undefined;

  const handleToggleSubject = (subjectId: string, period: string) => {
    console.log('Toggling subject:', subjectId, 'period:', period);
    
    setSelectedSubjects(prev => {
      const exists = prev.some(s => s.subjectId === subjectId);
      if (exists) {
        const newSelected = prev.filter(s => s.subjectId !== subjectId);
        console.log('Removing subject, new selectedSubjects:', newSelected);
        return newSelected;
      } else {
        const newSelected = [...prev, { subjectId, period }];
        console.log('Adding subject, new selectedSubjects:', newSelected);
        return newSelected;
      }
    });
  };

  const handleExportToWord = async () => {
    console.log('Iniciando exportação - scheduleName:', scheduleName);
    console.log('Iniciando exportação - selectedSubjects:', selectedSubjects);
    console.log('Iniciando exportação - currentClass:', currentClass);

    if (!scheduleName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe um nome para a grade.",
        variant: "destructive"
      });
      return;
    }

    if (selectedSubjects.length === 0) {
      toast({
        title: "Disciplinas obrigatórias",
        description: "Por favor, selecione pelo menos uma disciplina.",
        variant: "destructive"
      });
      return;
    }

    try {
      const subjectsToExport = subjects.filter(s => 
        selectedSubjects.some(selected => selected.subjectId === s.id)
      );

      console.log('Disciplinas para exportar:', subjectsToExport);

      await exportScheduleToWord({
        subjects: subjectsToExport,
        selectedClass: currentClass,
        getSubjectScheduleForClass,
        scheduleName
      });

      toast({
        title: "Exportação concluída",
        description: "Grade horária exportada com sucesso para Word!",
      });
    } catch (error) {
      console.error('Erro ao exportar para Word:', error);
      toast({
        title: "Erro na exportação",
        description: "Ocorreu um erro ao gerar o documento Word. Verifique o console para mais detalhes.",
        variant: "destructive"
      });
    }
  };

  // Organizar disciplinas por período, considerando turma selecionada
  const getOrganizedSubjects = () => {
    console.log('Getting organized subjects...');
    console.log('All subjects:', subjects.map(s => ({ id: s.id, name: s.name, period: s.period })));
    console.log('Current class:', currentClass);
    console.log('Current class subjects:', currentClass?.subjects);
    
    let filteredSubjects = subjects;
    
    // Se uma turma específica foi selecionada, filtrar apenas disciplinas dessa turma
    if (currentClass) {
      console.log('Filtering subjects for class:', currentClass.name);
      filteredSubjects = subjects.filter(subject => {
        const isInClass = currentClass.subjects.includes(subject.id);
        console.log(`Subject ${subject.name} (${subject.period}) is in class:`, isInClass);
        return isInClass;
      });
    }
    
    console.log('Filtered subjects:', filteredSubjects.map(s => ({ id: s.id, name: s.name, period: s.period })));
    
    // Agrupar por período
    const organized = filteredSubjects.reduce((acc, subject) => {
      // Converter período para string se necessário
      const periodKey = subject.period.toString();
      
      if (!acc[periodKey]) {
        acc[periodKey] = {
          periodLabel: PERIODS[subject.period],
          subjects: []
        };
      }
      acc[periodKey].subjects.push(subject);
      return acc;
    }, {} as Record<string, { periodLabel: string; subjects: Subject[] }>);
    
    console.log('Organized subjects:', organized);
    return organized;
  };

  const organizedSubjects = getOrganizedSubjects();

  // Debug: verificar se o botão deve estar habilitado
  const isButtonEnabled = scheduleName.trim() !== '' && selectedSubjects.length > 0;
  console.log('Button enabled check:', { 
    scheduleName: scheduleName.trim(), 
    selectedSubjectsCount: selectedSubjects.length, 
    isEnabled: isButtonEnabled 
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Criador de Grade para Word
          </CardTitle>
          <p className="text-sm text-gray-600">
            Monte sua grade horária e exporte diretamente para um documento Word (.docx)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configurações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="scheduleName">Nome da Grade</Label>
              <Input
                id="scheduleName"
                value={scheduleName}
                onChange={(e) => setScheduleName(e.target.value)}
                placeholder="Ex: Grade Medicina 2024.1"
              />
            </div>
            <div>
              <Label htmlFor="classSelect">Filtrar por Turma</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as disciplinas</SelectItem>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} - {PERIODS[cls.period as keyof typeof PERIODS]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Informações da Turma Selecionada */}
          {currentClass && (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center gap-2">
                  <span>Turma selecionada:</span>
                  <Badge>{currentClass.name}</Badge>
                  <Badge variant="outline">{PERIODS[currentClass.period as keyof typeof PERIODS]}</Badge>
                  <Badge variant="secondary">{currentClass.subjects.length} disciplinas</Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Seleção de Disciplinas */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Selecionar Disciplinas
              {currentClass && (
                <Badge variant="outline">
                  Mostrando disciplinas da turma {currentClass.name}
                </Badge>
              )}
            </h3>
            
            {Object.entries(organizedSubjects)
              .sort(([a], [b]) => {
                if (a === 'especial') return 1;
                if (b === 'especial') return -1;
                return parseInt(a) - parseInt(b);
              })
              .map(([period, group]) => (
                <Card key={period} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{group.periodLabel}</h4>
                    <Badge variant="outline">{group.subjects.length} disciplinas</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {group.subjects.map(subject => {
                      const isSelected = selectedSubjects.some(s => s.subjectId === subject.id);
                      
                      return (
                        <div key={subject.id} className="border rounded p-3 hover:bg-gray-50">
                          <div className="flex items-start space-x-2">
                            <Checkbox
                              id={`subject-${subject.id}`}
                              checked={isSelected}
                              onCheckedChange={() => handleToggleSubject(subject.id, subject.period.toString())}
                            />
                            <div className="flex-1 min-w-0">
                              <Label 
                                htmlFor={`subject-${subject.id}`} 
                                className="text-sm font-medium cursor-pointer"
                              >
                                {subject.name}
                              </Label>
                              <p className="text-xs text-gray-600 mt-1">
                                {subject.professor}
                              </p>
                              <div className="flex gap-1 mt-2">
                                <Badge variant="outline" className="text-xs">
                                  {subject.totalWorkload}h
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {(subject.theoreticalClasses?.length || 0) + (subject.practicalClasses?.length || 0)} aulas
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
          </div>

          {/* Disciplinas Selecionadas */}
          {selectedSubjects.length > 0 && (
            <Card className="p-4">
              <h4 className="font-medium mb-3">
                Disciplinas Selecionadas ({selectedSubjects.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedSubjects.map(selected => {
                  const subject = subjects.find(s => s.id === selected.subjectId);
                  return (
                    <Badge key={selected.subjectId} variant="default">
                      {subject?.name}
                    </Badge>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Ações */}
          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              {selectedSubjects.length} disciplinas selecionadas
              {currentClass && ` • Turma: ${currentClass.name}`}
            </div>
            <Button 
              onClick={handleExportToWord}
              disabled={!isButtonEnabled}
              className="medical-gradient"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar para Word
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
