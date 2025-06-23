
import { useState, useEffect } from 'react';
import { useSupabaseClasses } from '@/hooks/supabase/useSupabaseClasses';
import { useSupabaseSubjects } from '@/hooks/supabase/useSupabaseSubjects';
import { useToast } from '@/hooks/use-toast';
import { Subject } from '@/types';
import { ClassGroup, SubjectScheduleOverride } from '@/types/class';

export const useSupabaseIntegration = () => {
  const { toast } = useToast();
  const [selectedClass, setSelectedClass] = useState<string>('1-1');
  
  // Hooks do Supabase
  const {
    classes: supabaseClasses,
    loadClassSubjects,
    addSubjectToClass: addSubjectToClassSupabase,
    removeSubjectFromClass: removeSubjectFromClassSupabase,
    loadClassCustomSchedules,
    saveClassCustomSchedules
  } = useSupabaseClasses();

  const {
    subjects,
    loading: subjectsLoading,
    addSubject: addSubjectSupabase,
    updateSubject: updateSubjectSupabase,
    deleteSubject: deleteSubjectSupabase
  } = useSupabaseSubjects();

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

  // Adicionar disciplina a todas as turmas do período
  const addSubjectToAllClassesInPeriod = async (period: string, subjectId: string) => {
    const periodClasses = classes.filter(cls => cls.period === period);
    
    for (const cls of periodClasses) {
      await addSubjectToClass(cls.id, subjectId);
    }
    
    toast({
      title: "Disciplina adicionada",
      description: `Disciplina adicionada a todas as ${periodClasses.length} turmas do ${period}º período.`,
    });
  };

  // Remover disciplina de todas as turmas do período
  const removeSubjectFromAllClassesInPeriod = async (period: string, subjectId: string) => {
    const periodClasses = classes.filter(cls => cls.period === period);
    
    for (const cls of periodClasses) {
      await removeSubjectFromClass(cls.id, subjectId);
    }
  };

  // Adicionar nova disciplina
  const addSubject = async (subjectData: Omit<Subject, 'id' | 'color'>) => {
    const subjectId = await addSubjectSupabase(subjectData);
    // Adicionar automaticamente a todas as turmas do período
    await addSubjectToAllClassesInPeriod(subjectData.period, subjectId);
    return { id: subjectId, ...subjectData, color: '#3B82F6' };
  };

  // Atualizar disciplina
  const updateSubject = async (id: string, updates: Partial<Omit<Subject, 'id'>>) => {
    await updateSubjectSupabase(id, updates);
  };

  // Deletar disciplina
  const deleteSubject = async (id: string) => {
    const subject = subjects.find(s => s.id === id);
    if (subject) {
      await removeSubjectFromAllClassesInPeriod(subject.period, id);
    }
    await deleteSubjectSupabase(id);
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

  // Obter horário de disciplina para uma turma específica
  const getSubjectScheduleForClass = (classId: string, subjectId: string, defaultSubject?: Subject): SubjectScheduleOverride | null => {
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

  // Carregar disciplinas da turma selecionada quando ela mudar
  useEffect(() => {
    if (selectedClass) {
      loadSubjectsForClass(selectedClass);
    }
  }, [selectedClass]);

  // Carregar horários customizados quando necessário
  const loadScheduleForClassSubject = async (classId: string, subjectId: string, defaultSubject?: Subject) => {
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
    }
  };

  return {
    // Data
    subjects,
    classes,
    selectedClass,
    setSelectedClass,
    loading: subjectsLoading,
    
    // Subject operations
    addSubject,
    updateSubject,
    deleteSubject,
    
    // Class operations
    addSubjectToClass,
    removeSubjectFromClass,
    addSubjectToAllClassesInPeriod,
    removeSubjectFromAllClassesInPeriod,
    loadSubjectsForClass,
    
    // Schedule operations
    updateSubjectScheduleForClass,
    getSubjectScheduleForClass,
    loadScheduleForClassSubject,
    copyScheduleBetweenClasses
  };
};
