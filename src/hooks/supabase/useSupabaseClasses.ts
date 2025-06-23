
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SupabaseClassGroup {
  id: string;
  name: string;
  period: string;
  created_at: string;
  updated_at: string;
}

export interface SupabaseSubject {
  id: string;
  name: string;
  period: string;
  professor: string | null;
  location: string | null;
  total_workload: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseSubjectSchedule {
  id: string;
  subject_id: string;
  type: 'theoretical' | 'practical';
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string | null;
  workload: number;
  created_at: string;
}

export interface SupabaseClassSubjectSchedule {
  id: string;
  class_id: string;
  subject_id: string;
  type: 'theoretical' | 'practical';
  day_of_week: string;
  start_time: string;
  end_time: string;
  location: string | null;
  workload: number;
  has_custom_schedule: boolean;
  created_at: string;
}

export const useSupabaseClasses = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<SupabaseClassGroup[]>([]);
  const [subjects, setSubjects] = useState<SupabaseSubject[]>([]);

  // Carregar turmas usando query SQL direta
  const loadClasses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('class_groups' as any)
        .select('*')
        .order('period', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Type cast the data properly through unknown first
      const typedData = (data || []) as unknown as SupabaseClassGroup[];
      setClasses(typedData);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as turmas.",
        variant: "destructive"
      });
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  // Carregar disciplinas usando query SQL direta
  const loadSubjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subjects' as any)
        .select('*')
        .order('period', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      
      // Type cast the data properly through unknown first
      const typedData = (data || []) as unknown as SupabaseSubject[];
      setSubjects(typedData);
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

  // Carregar disciplinas de uma turma específica
  const loadClassSubjects = async (classId: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('class_subjects' as any)
        .select('subject_id')
        .eq('class_id', classId);

      if (error) throw error;
      
      // Type cast and extract subject_id through unknown first
      const typedData = (data || []) as unknown as Array<{ subject_id: string }>;
      return typedData.map(item => item.subject_id);
    } catch (error) {
      console.error('Erro ao carregar disciplinas da turma:', error);
      return [];
    }
  };

  // Adicionar disciplina a uma turma
  const addSubjectToClass = async (classId: string, subjectId: string) => {
    try {
      const { error } = await supabase
        .from('class_subjects' as any)
        .insert({ class_id: classId, subject_id: subjectId });

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Disciplina adicionada à turma.",
      });
    } catch (error) {
      console.error('Erro ao adicionar disciplina à turma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a disciplina à turma.",
        variant: "destructive"
      });
    }
  };

  // Remover disciplina de uma turma
  const removeSubjectFromClass = async (classId: string, subjectId: string) => {
    try {
      const { error } = await supabase
        .from('class_subjects' as any)
        .delete()
        .eq('class_id', classId)
        .eq('subject_id', subjectId);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Disciplina removida da turma.",
      });
    } catch (error) {
      console.error('Erro ao remover disciplina da turma:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a disciplina da turma.",
        variant: "destructive"
      });
    }
  };

  // Carregar horários customizados de uma turma
  const loadClassCustomSchedules = async (classId: string, subjectId: string): Promise<SupabaseClassSubjectSchedule[]> => {
    try {
      const { data, error } = await supabase
        .from('class_subject_schedules' as any)
        .select('*')
        .eq('class_id', classId)
        .eq('subject_id', subjectId);

      if (error) throw error;
      
      // Type cast the data properly through unknown first
      const typedData = (data || []) as unknown as SupabaseClassSubjectSchedule[];
      return typedData;
    } catch (error) {
      console.error('Erro ao carregar horários customizados:', error);
      return [];
    }
  };

  // Salvar horários customizados para uma turma
  const saveClassCustomSchedules = async (
    classId: string, 
    subjectId: string, 
    schedules: Omit<SupabaseClassSubjectSchedule, 'id' | 'created_at'>[]
  ) => {
    try {
      // Primeiro, remover horários existentes
      await supabase
        .from('class_subject_schedules' as any)
        .delete()
        .eq('class_id', classId)
        .eq('subject_id', subjectId);

      // Inserir novos horários
      if (schedules.length > 0) {
        const { error } = await supabase
          .from('class_subject_schedules' as any)
          .insert(schedules);

        if (error) throw error;
      }

      toast({
        title: "Sucesso",
        description: "Horários customizados salvos.",
      });
    } catch (error) {
      console.error('Erro ao salvar horários customizados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar os horários customizados.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadClasses();
    loadSubjects();
  }, []);

  return {
    loading,
    classes,
    subjects,
    loadClasses,
    loadSubjects,
    loadClassSubjects,
    addSubjectToClass,
    removeSubjectFromClass,
    loadClassCustomSchedules,
    saveClassCustomSchedules
  };
};
