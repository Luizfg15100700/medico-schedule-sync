
import { useState, useCallback } from 'react';
import { ClassGroup } from '@/types/class';
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
        subjects: []
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
        ? { ...cls, subjects: cls.subjects.filter(id => id !== subjectId) }
        : cls
    ));
  }, []);

  const removeSubjectFromAllClassesInPeriod = useCallback((period: string, subjectId: string) => {
    setClasses(prev => prev.map(cls => 
      cls.period === period 
        ? { ...cls, subjects: cls.subjects.filter(id => id !== subjectId) }
        : cls
    ));
  }, []);

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
        ? { ...cls, subjects: [...fromClass.subjects] }
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
    copyScheduleBetweenClasses
  };
};
