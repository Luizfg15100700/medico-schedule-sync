
import { useState, useCallback } from 'react';
import { ClassGroup, SubjectScheduleOverride } from '@/types/class';
import { Subject } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useClasses = () => {
  const { toast } = useToast();
  
  const [classes, setClasses] = useState<ClassGroup[]>([
    // Inicializar com 4 turmas para cada período (1-8)
    ...Array.from({ length: 8 }, (_, periodIndex) => 
      Array.from({ length: 4 }, (_, classIndex) => ({
        id: `${periodIndex + 1}-${classIndex + 1}`,
        name: `Turma ${String.fromCharCode(65 + classIndex)}`, // A, B, C, D
        period: `${periodIndex + 1}`,
        subjects: [],
        subjectSchedules: {}
      }))
    ).flat()
  ]);

  const [selectedClass, setSelectedClass] = useState<string>('1-1'); // Período 1, Turma A

  const getClassesByPeriod = useCallback((period: string) => {
    return classes.filter(cls => cls.period === period);
  }, [classes]);

  const addSubjectToAllClassesInPeriod = useCallback((period: string, subjectId: string) => {
    setClasses(prev => prev.map(cls => 
      cls.period === period 
        ? { ...cls, subjects: [...cls.subjects, subjectId] }
        : cls
    ));
    
    const periodClasses = classes.filter(cls => cls.period === period);
    toast({
      title: "Disciplina adicionada",
      description: `Disciplina adicionada a todas as ${periodClasses.length} turmas do ${period}º período.`,
    });
  }, [classes, toast]);

  const addSubjectToClass = useCallback((classId: string, subjectId: string) => {
    setClasses(prev => prev.map(cls => 
      cls.id === classId 
        ? { ...cls, subjects: [...cls.subjects, subjectId] }
        : cls
    ));
  }, []);

  const removeSubjectFromClass = useCallback((classId: string, subjectId: string) => {
    setClasses(prev => prev.map(cls => 
      cls.id === classId 
        ? { 
            ...cls, 
            subjects: cls.subjects.filter(id => id !== subjectId),
            subjectSchedules: Object.fromEntries(
              Object.entries(cls.subjectSchedules).filter(([id]) => id !== subjectId)
            )
          }
        : cls
    ));
  }, []);

  const removeSubjectFromAllClassesInPeriod = useCallback((period: string, subjectId: string) => {
    setClasses(prev => prev.map(cls => 
      cls.period === period 
        ? { 
            ...cls, 
            subjects: cls.subjects.filter(id => id !== subjectId),
            subjectSchedules: Object.fromEntries(
              Object.entries(cls.subjectSchedules).filter(([id]) => id !== subjectId)
            )
          }
        : cls
    ));
  }, []);

  const updateSubjectScheduleForClass = useCallback((classId: string, subjectId: string, scheduleOverride: SubjectScheduleOverride) => {
    setClasses(prev => prev.map(cls => 
      cls.id === classId 
        ? { 
            ...cls, 
            subjectSchedules: {
              ...cls.subjectSchedules,
              [subjectId]: scheduleOverride
            }
          }
        : cls
    ));

    toast({
      title: "Horário atualizado",
      description: "Horário da disciplina foi atualizado para esta turma.",
    });
  }, [toast]);

  const getSubjectScheduleForClass = useCallback((classId: string, subjectId: string, defaultSubject?: Subject): SubjectScheduleOverride | null => {
    const cls = classes.find(c => c.id === classId);
    if (!cls) return null;

    const customSchedule = cls.subjectSchedules[subjectId];
    if (customSchedule) return customSchedule;

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
  }, [classes]);

  const copyScheduleBetweenClasses = useCallback((fromClassId: string, toClassId: string) => {
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

    setClasses(prev => prev.map(cls => 
      cls.id === toClassId 
        ? { 
            ...cls, 
            subjects: [...fromClass.subjects],
            subjectSchedules: { ...fromClass.subjectSchedules }
          }
        : cls
    ));

    toast({
      title: "Horário copiado",
      description: `Horário da ${fromClass.name} copiado para ${toClass.name}.`,
    });
  }, [classes, toast]);

  return {
    classes,
    selectedClass,
    setSelectedClass,
    getClassesByPeriod,
    addSubjectToClass,
    removeSubjectFromClass,
    addSubjectToAllClassesInPeriod,
    removeSubjectFromAllClassesInPeriod,
    updateSubjectScheduleForClass,
    getSubjectScheduleForClass,
    copyScheduleBetweenClasses
  };
};
