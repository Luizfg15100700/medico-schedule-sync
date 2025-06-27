
import React from 'react';
import { Subject } from '@/types';
import { ClassGroup, SubjectScheduleOverride } from '@/types/class';
import { Card, CardContent } from '@/components/ui/card';
import { exportScheduleToWord } from '@/utils/wordExportUtils';
import { useToast } from '@/hooks/use-toast';
import { useWordExportLogic } from '@/hooks/useWordExportLogic';
import { WordExportHeader } from './word-export/WordExportHeader';
import { WordExportForm } from './word-export/WordExportForm';
import { ClassInfoAlert } from './word-export/ClassInfoAlert';
import { SubjectSelection } from './word-export/SubjectSelection';
import { SelectedSubjectsDisplay } from './word-export/SelectedSubjectsDisplay';
import { WordExportActions } from './word-export/WordExportActions';

interface WordScheduleBuilderProps {
  subjects: Subject[];
  classes: ClassGroup[];
  getSubjectScheduleForClass?: (classId: string, subjectId: string, defaultSubject?: Subject) => SubjectScheduleOverride | null;
}

export const WordScheduleBuilder: React.FC<WordScheduleBuilderProps> = ({
  subjects,
  classes,
  getSubjectScheduleForClass
}) => {
  const { toast } = useToast();
  const {
    scheduleName,
    setScheduleName,
    selectedClass,
    setSelectedClass,
    selectedSubjects,
    currentClass,
    organizedSubjects,
    isButtonEnabled,
    handleToggleSubject
  } = useWordExportLogic(subjects, classes);

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

  return (
    <div className="space-y-6">
      <Card>
        <WordExportHeader />
        <CardContent className="space-y-6">
          <WordExportForm
            scheduleName={scheduleName}
            onScheduleNameChange={setScheduleName}
            selectedClass={selectedClass}
            onClassChange={setSelectedClass}
            classes={classes}
          />

          {currentClass && <ClassInfoAlert currentClass={currentClass} />}

          <SubjectSelection
            organizedSubjects={organizedSubjects}
            selectedSubjects={selectedSubjects}
            onToggleSubject={handleToggleSubject}
            currentClass={currentClass}
          />

          <SelectedSubjectsDisplay
            selectedSubjects={selectedSubjects}
            subjects={subjects}
          />

          <WordExportActions
            selectedSubjectsCount={selectedSubjects.length}
            currentClass={currentClass}
            isButtonEnabled={isButtonEnabled}
            onExport={handleExportToWord}
          />
        </CardContent>
      </Card>
    </div>
  );
};
