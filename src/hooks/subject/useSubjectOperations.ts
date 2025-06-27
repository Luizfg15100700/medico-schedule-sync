
import { useToast } from '@/hooks/use-toast';
import { useSupabaseIntegration } from '@/hooks/useSupabaseIntegration';
import { useAppState } from '@/hooks/useAppState';
import { Subject } from '@/types';

export const useSubjectOperations = () => {
  const { toast } = useToast();
  const appState = useAppState();
  const {
    addSubject,
    updateSubject,
    deleteSubject,
    addSubjectToClass,
    removeSubjectFromClass
  } = useSupabaseIntegration();

  const handleAddSubject = async (subject: {
    name: string;
    period: Subject['period'];
    professor: string;
    location: string;
    totalWorkload: number;
    theoreticalClasses: any[];
    practicalClasses: any[];
  }) => {
    try {
      await addSubject(subject);
      appState.closeAddModal();
      toast({
        title: "Sucesso",
        description: "Disciplina adicionada e salva no banco de dados.",
      });
    } catch (error) {
      console.error('Erro ao adicionar disciplina:', error);
    }
  };

  const handleUpdateSubject = async (subjectData: any) => {
    if (appState.editingSubject) {
      try {
        await updateSubject(appState.editingSubject.id, subjectData);
        appState.closeAddModal();
        toast({
          title: "Sucesso",
          description: "Disciplina atualizada no banco de dados.",
        });
      } catch (error) {
        console.error('Erro ao atualizar disciplina:', error);
      }
    }
  };

  const handleUpdateSchedule = async (updatedSubject: Subject) => {
    console.log('Atualizando horários padrão da disciplina:', updatedSubject.name);
    try {
      await updateSubject(updatedSubject.id, updatedSubject);
      appState.closeScheduleEditor();
      
      toast({
        title: "Horários padrão atualizados",
        description: "Os horários padrão da disciplina foram atualizados e salvos no banco de dados.",
      });
    } catch (error) {
      console.error('Erro ao atualizar horários:', error);
    }
  };

  const handleDeleteSubject = async (subjectId: string) => {
    if (confirm('Tem certeza que deseja excluir esta disciplina? Ela será removida do banco de dados.')) {
      try {
        await deleteSubject(subjectId);
        toast({
          title: "Sucesso",
          description: "Disciplina removida do banco de dados.",
        });
      } catch (error) {
        console.error('Erro ao deletar disciplina:', error);
      }
    }
  };

  const handleToggleSubjectInClass = async (selectedClass: string, subjectId: string, currentClassSubjects: string[]) => {
    try {
      if (currentClassSubjects.includes(subjectId)) {
        await removeSubjectFromClass(selectedClass, subjectId);
        toast({
          title: "Disciplina removida",
          description: "Disciplina removida da turma no banco de dados.",
        });
      } else {
        await addSubjectToClass(selectedClass, subjectId);
        toast({
          title: "Disciplina adicionada",
          description: "Disciplina adicionada à turma no banco de dados.",
        });
      }
    } catch (error) {
      console.error('Erro ao alterar disciplina da turma:', error);
    }
  };

  return {
    handleAddSubject,
    handleUpdateSubject,
    handleUpdateSchedule,
    handleDeleteSubject,
    handleToggleSubjectInClass
  };
};
