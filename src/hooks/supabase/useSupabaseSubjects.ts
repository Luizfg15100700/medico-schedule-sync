
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Subject, ClassSchedule } from '@/types';

export interface SupabaseSubjectWithSchedules extends Subject {
  subject_schedules?: Array<{
    id: string;
    type: 'theoretical' | 'practical';
    day_of_week: string;
    start_time: string;
    end_time: string;
    location: string | null;
    workload: number;
  }>;
}

export const useSupabaseSubjects = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Carregar disciplinas do Supabase
  const loadSubjects = async () => {
    setLoading(true);
    try {
      // Carregar disciplinas
      const { data: subjectsData, error: subjectsError } = await supabase
        .from('subjects')
        .select('*')
        .order('period', { ascending: true })
        .order('name', { ascending: true });

      if (subjectsError) throw subjectsError;

      // Carregar horários para cada disciplina
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('subject_schedules')
        .select('*');

      if (schedulesError) throw schedulesError;

      // Combinar disciplinas com seus horários
      const formattedSubjects: Subject[] = (subjectsData || []).map(subject => {
        const subjectSchedules = (schedulesData || []).filter(
          schedule => schedule.subject_id === subject.id
        );

        const theoreticalClasses: ClassSchedule[] = subjectSchedules
          .filter(s => s.type === 'theoretical')
          .map(s => ({
            id: s.id,
            subjectId: subject.id,
            type: 'theoretical',
            dayOfWeek: s.day_of_week as any,
            startTime: s.start_time,
            endTime: s.end_time,
            location: s.location || '',
            workload: s.workload
          }));

        const practicalClasses: ClassSchedule[] = subjectSchedules
          .filter(s => s.type === 'practical')
          .map(s => ({
            id: s.id,
            subjectId: subject.id,
            type: 'practical',
            dayOfWeek: s.day_of_week as any,
            startTime: s.start_time,
            endTime: s.end_time,
            location: s.location || '',
            workload: s.workload
          }));

        return {
          id: subject.id,
          name: subject.name,
          period: subject.period,
          professor: subject.professor || '',
          location: subject.location || '',
          totalWorkload: subject.total_workload,
          theoreticalClasses,
          practicalClasses,
          color: `#${Math.floor(Math.random()*16777215).toString(16)}`
        };
      });

      setSubjects(formattedSubjects);
    } catch (error) {
      console.error('Erro ao carregar disciplinas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as disciplinas.",
        variant: "destructive"
      });
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  // Adicionar nova disciplina
  const addSubject = async (subjectData: Omit<Subject, 'id' | 'color'>) => {
    try {
      // Inserir disciplina
      const { data: subjectResult, error: subjectError } = await supabase
        .from('subjects')
        .insert({
          name: subjectData.name,
          period: subjectData.period,
          professor: subjectData.professor,
          location: subjectData.location,
          total_workload: subjectData.totalWorkload
        })
        .select()
        .single();

      if (subjectError) throw subjectError;

      const subjectId = subjectResult.id;

      // Inserir horários teóricos
      if (subjectData.theoreticalClasses.length > 0) {
        const theoreticalSchedules = subjectData.theoreticalClasses.map(tc => ({
          subject_id: subjectId,
          type: 'theoretical',
          day_of_week: tc.dayOfWeek,
          start_time: tc.startTime,
          end_time: tc.endTime,
          location: tc.location,
          workload: tc.workload
        }));

        const { error: theoreticalError } = await supabase
          .from('subject_schedules')
          .insert(theoreticalSchedules);

        if (theoreticalError) throw theoreticalError;
      }

      // Inserir horários práticos
      if (subjectData.practicalClasses.length > 0) {
        const practicalSchedules = subjectData.practicalClasses.map(pc => ({
          subject_id: subjectId,
          type: 'practical',
          day_of_week: pc.dayOfWeek,
          start_time: pc.startTime,
          end_time: pc.endTime,
          location: pc.location,
          workload: pc.workload
        }));

        const { error: practicalError } = await supabase
          .from('subject_schedules')
          .insert(practicalSchedules);

        if (practicalError) throw practicalError;
      }

      toast({
        title: "Sucesso",
        description: `${subjectData.name} foi adicionada com sucesso.`,
      });

      // Recarregar disciplinas
      await loadSubjects();
      return subjectId;
    } catch (error) {
      console.error('Erro ao adicionar disciplina:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a disciplina.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Atualizar disciplina
  const updateSubject = async (id: string, updates: Partial<Omit<Subject, 'id'>>) => {
    try {
      // Atualizar dados básicos da disciplina
      const { error: subjectError } = await supabase
        .from('subjects')
        .update({
          name: updates.name,
          period: updates.period,
          professor: updates.professor,
          location: updates.location,
          total_workload: updates.totalWorkload
        })
        .eq('id', id);

      if (subjectError) throw subjectError;

      // Se há atualizações de horários, remover os existentes e inserir os novos
      if (updates.theoreticalClasses || updates.practicalClasses) {
        // Remover horários existentes
        const { error: deleteError } = await supabase
          .from('subject_schedules')
          .delete()
          .eq('subject_id', id);

        if (deleteError) throw deleteError;

        // Inserir novos horários teóricos
        if (updates.theoreticalClasses && updates.theoreticalClasses.length > 0) {
          const theoreticalSchedules = updates.theoreticalClasses.map(tc => ({
            subject_id: id,
            type: 'theoretical',
            day_of_week: tc.dayOfWeek,
            start_time: tc.startTime,
            end_time: tc.endTime,
            location: tc.location,
            workload: tc.workload
          }));

          const { error: theoreticalError } = await supabase
            .from('subject_schedules')
            .insert(theoreticalSchedules);

          if (theoreticalError) throw theoreticalError;
        }

        // Inserir novos horários práticos
        if (updates.practicalClasses && updates.practicalClasses.length > 0) {
          const practicalSchedules = updates.practicalClasses.map(pc => ({
            subject_id: id,
            type: 'practical',
            day_of_week: pc.dayOfWeek,
            start_time: pc.startTime,
            end_time: pc.endTime,
            location: pc.location,
            workload: pc.workload
          }));

          const { error: practicalError } = await supabase
            .from('subject_schedules')
            .insert(practicalSchedules);

          if (practicalError) throw practicalError;
        }
      }

      toast({
        title: "Disciplina atualizada",
        description: "As alterações foram salvas com sucesso.",
      });

      // Recarregar disciplinas
      await loadSubjects();
    } catch (error) {
      console.error('Erro ao atualizar disciplina:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a disciplina.",
        variant: "destructive"
      });
    }
  };

  // Deletar disciplina
  const deleteSubject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Disciplina removida",
        description: "A disciplina foi removida com sucesso.",
      });

      // Recarregar disciplinas
      await loadSubjects();
    } catch (error) {
      console.error('Erro ao deletar disciplina:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a disciplina.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  return {
    loading,
    subjects,
    loadSubjects,
    addSubject,
    updateSubject,
    deleteSubject
  };
};
