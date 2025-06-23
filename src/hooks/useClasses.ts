
import { useState, useCallback, useEffect } from 'react';
import { ClassGroup, SubjectScheduleOverride } from '@/types/class';
import { Subject } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseClasses } from '@/hooks/supabase/useSupabaseClasses';

export const useClasses = () => {
  const { toast } = useToast();
  const {
    classes: supabaseClasses,
    loadClassSubjects,
    addSubjectToClass: addSubjectToClassSupabase,
    removeSubjectFromClass: removeSubjectFromClassSupabase,
    loadClassCustomSchedules,
    saveClassCustomSchedules
  } = useSupabaseClasses();

  // Converter turmas do Supabase para o formato local
  const classes: ClassGroup[] = supabaseClasses.map(cls => ({
    id: cls.id,
    name: cls.name,
    period: cls.period,
    subjects: [], // Será carregado dinamicamente
    subjectSchedules: {} // Será carregado dinamicamente
  }));

  const [selectedClass, setSelectedClass] = useState<string>('1-1');
  const [classSubjects, setClassSubjects] = useState<Record<string, string[]>>({});
  const [classSchedules, setClassSchedules] = useState<Record<string, Record<string, SubjectScheduleOverride>>>({});

  // Carregar disciplinas de uma turma
  const loadSubjectsForClass = useCallback(async (classId: string) => {
    const subjects = await loadClassSubjects(classId);
    setClassSubjects(prev => ({ ...prev, [classId]: subjects }));
  }, [loadClassSubjects]);

  // Carregar horários customizados de uma disciplina para uma turma
  const loadScheduleForClassSubject = useCallback(async (classId: string, subjectId: string, defaultSubject?: Subject) => {
    const customSchedules = await loadClassCustomSchedules(classId, subjectId);
    
    if (customSchedules.length > 0) {
      const scheduleOverride: SubjectScheduleOverride = {
        subjectId,
        classId,
        theoreticalClasses: customSchedules
          .filter(s => s.type === 'theoretical')
          .map(s => ({
            id: s.id,
            subjectId: s.subject_id,
            classId: s.class_id,
            type: s.type,
            dayOfWeek: s.day_of_week as any,
            startTime: s.start_time,
            endTime: s.end_time,
            location: s.location || '',
            workload: s.workload
          })),
        practicalClasses: customSchedules
          .filter(s => s.type === 'practical')
          .map(s => ({
            id: s.id,
            subjectId: s.subject_id,
            classId: s.class_id,
            type: s.type,
            dayOfWeek: s.day_of_week as any,
            startTime: s.start_time,
            endTime: s.end_time,
            location: s.location || '',
            workload: s.workload
          })),
        hasCustomSchedule: true
      };

      setClassSchedules(prev => ({
        ...prev,
        [classId]: {
          ...prev[classId],
          [subjectId]: scheduleOverride
        }
      }));
    } else if (defaultSubject) {
      // Usar horários padrão da disciplina
      const scheduleOverride: SubjectScheduleOverride = {
        subjectId,
        classId,
        theoreticalClasses: defaultSubject.theoreticalClasses.map(tc => ({
          ...tc,
          classId,
          id: `${tc.id}-${classId}`
        })),
        practicalClasses: defaultSubject.practicalClasses.map(pc => ({
          ...pc,
          classId,
          id: `${pc.id}-${classId}`
        })),
        hasCustomSchedule: false
      };

      setClassSchedules(prev => ({
        ...prev,
        [classId]: {
          ...prev[classId],
          [subjectId]: scheduleOverride
        }
      }));
    }
  }, [loadClassCustomSchedules]);

  const getClassesByPeriod = useCallback((period: string) => {
    return classes.filter(cls => cls.period === period);
  }, [classes]);

  const addSubjectToAllClassesInPeriod = useCallback(async (period: string, subjectId: string) => {
    const periodClasses = classes.filter(cls => cls.period === period);
    
    for (const cls of periodClasses) {
      await addSubjectToClassSupabase(cls.id, subjectId);
      await loadSubjectsForClass(cls.id);
    }
    
    toast({
      title: "Disciplina adicionada",
      description: `Disciplina adicionada a todas as ${periodClasses.length} turmas do ${period}º período.`,
    });
  }, [classes, addSubjectToClassSupabase, loadSubjectsForClass, toast]);

  const addSubjectToClass = useCallback(async (classId: string, subjectId: string) => {
    await addSubjectToClassSupabase(classId, subjectId);
    await loadSubjectsForClass(classId);
  }, [addSubjectToClassSupabase, loadSubjectsForClass]);

  const removeSubjectFromClass = useCallback(async (classId: string, subjectId: string) => {
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
  }, [removeSubjectFromClassSupabase, loadSubjectsForClass]);

  const removeSubjectFromAllClassesInPeriod = useCallback(async (period: string, subjectId: string) => {
    const periodClasses = classes.filter(cls => cls.period === period);
    
    for (const cls of periodClasses) {
      await removeSubjectFromClassSupabase(cls.id, subjectId);
      await loadSubjectsForClass(cls.id);
    }
  }, [classes, removeSubjectFromClassSupabase, loadSubjectsForClass]);

  const updateSubjectScheduleForClass = useCallback(async (classId: string, subjectId: string, scheduleOverride: SubjectScheduleOverride) => {
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

    toast({
      title: "Horário atualizado",
      description: "Horário da disciplina foi atualizado para esta turma.",
    });
  }, [saveClassCustomSchedules, toast]);

  const getSubjectScheduleForClass = useCallback((classId: string, subjectId: string, defaultSubject?: Subject): SubjectScheduleOverride | null => {
    const existingSchedule = classSchedules[classId]?.[subjectId];
    if (existingSchedule) {
      return existingSchedule;
    }

    // Se não há horário customizado e temos a disciplina padrão, criar um baseado nela
    if (defaultSubject) {
      return {
        subjectId,
        classId,
        theoreticalClasses: defaultSubject.theoreticalClasses.map(tc => ({
          ...tc,
          classId,
          id: `${tc.id}-${classId}`
        })),
        practicalClasses: defaultSubject.practicalClasses.map(pc => ({
          ...pc,
          classId,
          id: `${pc.id}-${classId}`
        })),
        hasCustomSchedule: false
      };
    }

    return null;
  }, [classSchedules]);

  const copyScheduleBetweenClasses = useCallback(async (fromClassId: string, toClassId: string) => {
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
  }, [classes, classSubjects, classSchedules, addSubjectToClass, updateSubjectScheduleForClass, toast]);

  // Carregar disciplinas da turma selecionada quando ela mudar
  useEffect(() => {
    if (selectedClass) {
      loadSubjectsForClass(selectedClass);
    }
  }, [selectedClass, loadSubjectsForClass]);

  // Converter classes para incluir subjects do estado local
  const classesWithSubjects: ClassGroup[] = classes.map(cls => ({
    ...cls,
    subjects: classSubjects[cls.id] || [],
    subjectSchedules: classSchedules[cls.id] || {}
  }));

  return {
    classes: classesWithSubjects,
    selectedClass,
    setSelectedClass,
    getClassesByPeriod,
    addSubjectToClass,
    removeSubjectFromClass,
    addSubjectToAllClassesInPeriod,
    removeSubjectFromAllClassesInPeriod,
    updateSubjectScheduleForClass,
    getSubjectScheduleForClass,
    copyScheduleBetweenClasses,
    loadSubjectsForClass,
    loadScheduleForClassSubject
  };
};
