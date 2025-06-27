
import { useState, useEffect } from 'react';
import { useSupabaseClasses } from '@/hooks/supabase/useSupabaseClasses';
import { useToast } from '@/hooks/use-toast';
import { ClassGroup, SubjectScheduleOverride } from '@/types/class';

export const useSupabaseClassIntegration = () => {
  const { toast } = useToast();
  
  const {
    classes: supabaseClasses,
    loadClassSubjects,
    addSubjectToClass: addSubjectToClassSupabase,
    removeSubjectFromClass: removeSubjectFromClassSupabase,
    loadClassCustomSchedules,
    saveClassCustomSchedules
  } = useSupabaseClasses();

  // Estado local para disciplinas das turmas
  const [classSubjects, setClassSubjects] = useState<Record<string, string[]>>({});
  const [classSchedules, setClassSchedules] = useState<Record<string, Record<string, SubjectScheduleOverride>>>({});

  // Converter turmas do Supabase para o formato local
  const classes: ClassGroup[] = supabaseClasses.map(cls => ({
    id: cls.id,
    name: cls.name,
    period: cls.period,
    subjects: classSubjects[cls.id] || [],
    subjectSchedules: classSchedules[cls.id] || {}
  }));

  // Carregar disciplinas de uma turma
  const loadSubjectsForClass = async (classId: string) => {
    const subjectIds = await loadClassSubjects(classId);
    setClassSubjects(prev => ({ ...prev, [classId]: subjectIds }));
  };

  // Adicionar disciplina a uma turma
  const addSubjectToClass = async (classId: string, subjectId: string) => {
    await addSubjectToClassSupabase(classId, subjectId);
    await loadSubjectsForClass(classId);
  };

  // Remover disciplina de uma turma
  const removeSubjectFromClass = async (classId: string, subjectId: string) => {
    await removeSubjectFromClassSupabase(classId, subjectId);
    await loadSubjectsForClass(classId);
    
    // Remover horários customizados do estado local
    setClassSchedules(prev => {
      const newSchedules = { ...prev };
      if (newSchedules[classId]) {
        delete newSchedules[classId][subjectId];
      }
      return newSchedules;
    });
  };

  // Copiar horário entre turmas
  const copyScheduleBetweenClasses = async (fromClassId: string, toClassId: string) => {
    const fromClass = classes.find(cls => cls.id === fromClassId);
    const toClass = classes.find(cls => cls.id === toClassId);

    if (!fromClass || !toClass) {
      toast({
        title: "Erro",
        description: "Turma não encontrada.",
        variant: "destructive"
      });
      return;
    }

    if (fromClass.period !== toClass.period) {
      toast({
        title: "Erro",
        description: "Só é possível copiar horários entre turmas do mesmo período.",
        variant: "destructive"
      });
      return;
    }

    // Copiar disciplinas
    const fromSubjects = classSubjects[fromClassId] || [];
    const toSubjects = classSubjects[toClassId] || [];
    
    // Adicionar disciplinas que estão na turma origem mas não na destino
    for (const subjectId of fromSubjects) {
      if (!toSubjects.includes(subjectId)) {
        await addSubjectToClass(toClassId, subjectId);
      }
    }

    // Copiar horários customizados
    const fromSchedules = classSchedules[fromClassId] || {};
    for (const [subjectId, schedule] of Object.entries(fromSchedules)) {
      if (schedule.hasCustomSchedule) {
        await updateSubjectScheduleForClass(toClassId, subjectId, schedule);
      }
    }

    toast({
      title: "Horário copiado",
      description: `Horário da ${fromClass.name} copiado para ${toClass.name}.`,
    });
  };

  // Atualizar horário de disciplina para uma turma específica
  const updateSubjectScheduleForClass = async (classId: string, subjectId: string, scheduleOverride: SubjectScheduleOverride) => {
    // Preparar dados para o Supabase
    const schedulesToSave = [
      ...scheduleOverride.theoreticalClasses.map(tc => ({
        class_id: classId,
        subject_id: subjectId,
        type: 'theoretical' as const,
        day_of_week: tc.dayOfWeek,
        start_time: tc.startTime,
        end_time: tc.endTime,
        location: tc.location || null,
        workload: tc.workload,
        has_custom_schedule: scheduleOverride.hasCustomSchedule
      })),
      ...scheduleOverride.practicalClasses.map(pc => ({
        class_id: classId,
        subject_id: subjectId,
        type: 'practical' as const,
        day_of_week: pc.dayOfWeek,
        start_time: pc.startTime,
        end_time: pc.endTime,
        location: pc.location || null,
        workload: pc.workload,
        has_custom_schedule: scheduleOverride.hasCustomSchedule
      }))
    ];

    await saveClassCustomSchedules(classId, subjectId, schedulesToSave);
    
    // Atualizar estado local
    setClassSchedules(prev => ({
      ...prev,
      [classId]: {
        ...prev[classId],
        [subjectId]: scheduleOverride
      }
    }));
  };

  return {
    classes,
    classSubjects,
    classSchedules,
    setClassSchedules,
    loadSubjectsForClass,
    addSubjectToClass,
    removeSubjectFromClass,
    copyScheduleBetweenClasses,
    updateSubjectScheduleForClass,
    loadClassCustomSchedules,
    saveClassCustomSchedules
  };
};
