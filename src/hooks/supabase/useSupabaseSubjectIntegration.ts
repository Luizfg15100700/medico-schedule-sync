
import { useSupabaseSubjects } from '@/hooks/supabase/useSupabaseSubjects';
import { useToast } from '@/hooks/use-toast';
import { Subject } from '@/types';

export const useSupabaseSubjectIntegration = () => {
  const { toast } = useToast();
  const {
    subjects,
    loading: subjectsLoading,
    addSubject: addSubjectSupabase,
    updateSubject: updateSubjectSupabase,
    deleteSubject: deleteSubjectSupabase
  } = useSupabaseSubjects();

  // Adicionar disciplina a todas as turmas do período
  const addSubjectToAllClassesInPeriod = async (period: string, subjectId: string, classes: any[], addSubjectToClassSupabase: (classId: string, subjectId: string) => Promise<void>) => {
    const periodClasses = classes.filter(cls => cls.period === period);
    
    for (const cls of periodClasses) {
      await addSubjectToClassSupabase(cls.id, subjectId);
    }
    
    toast({
      title: "Disciplina adicionada",
      description: `Disciplina adicionada a todas as ${periodClasses.length} turmas do ${period}º período.`,
    });
  };

  // Remover disciplina de todas as turmas do período
  const removeSubjectFromAllClassesInPeriod = async (period: string, subjectId: string, classes: any[], removeSubjectFromClassSupabase: (classId: string, subjectId: string) => Promise<void>) => {
    const periodClasses = classes.filter(cls => cls.period === period);
    
    for (const cls of periodClasses) {
      await removeSubjectFromClassSupabase(cls.id, subjectId);
    }
  };

  // Adicionar nova disciplina
  const addSubject = async (subjectData: Omit<Subject, 'id' | 'color'>, classes: any[], addSubjectToClassSupabase: (classId: string, subjectId: string) => Promise<void>) => {
    const subjectId = await addSubjectSupabase(subjectData);
    // Adicionar automaticamente a todas as turmas do período
    await addSubjectToAllClassesInPeriod(subjectData.period, subjectId, classes, addSubjectToClassSupabase);
    return { id: subjectId, ...subjectData, color: '#3B82F6' };
  };

  // Atualizar disciplina
  const updateSubject = async (id: string, updates: Partial<Omit<Subject, 'id'>>) => {
    await updateSubjectSupabase(id, updates);
  };

  // Deletar disciplina
  const deleteSubject = async (id: string, classes: any[], removeSubjectFromClassSupabase: (classId: string, subjectId: string) => Promise<void>) => {
    const subject = subjects.find(s => s.id === id);
    if (subject) {
      await removeSubjectFromAllClassesInPeriod(subject.period, id, classes, removeSubjectFromClassSupabase);
    }
    await deleteSubjectSupabase(id);
  };

  return {
    subjects,
    subjectsLoading,
    addSubject,
    updateSubject,
    deleteSubject,
    addSubjectToAllClassesInPeriod,
    removeSubjectFromAllClassesInPeriod
  };
};
