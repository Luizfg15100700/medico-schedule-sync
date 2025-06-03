
import { useState, useCallback } from 'react';
import { AcademicPeriod, ScheduleTemplate } from '@/types/academic';
import { useToast } from '@/hooks/use-toast';

export const useAcademicCalendar = () => {
  const { toast } = useToast();
  
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([
    {
      id: '2024-1',
      name: '2024.1',
      semester: '1',
      year: 2024,
      startDate: '2024-02-05',
      endDate: '2024-06-30',
      isActive: true
    },
    {
      id: '2024-2',
      name: '2024.2',
      semester: '2',
      year: 2024,
      startDate: '2024-08-05',
      endDate: '2024-12-20',
      isActive: false
    }
  ]);

  const [scheduleTemplates, setScheduleTemplates] = useState<ScheduleTemplate[]>([]);
  const [activePeriod, setActivePeriod] = useState<string>('2024-1');

  const addAcademicPeriod = useCallback((period: Omit<AcademicPeriod, 'id'>) => {
    const newPeriod: AcademicPeriod = {
      ...period,
      id: `${period.year}-${period.semester}`
    };

    setAcademicPeriods(prev => {
      // Verificar se já existe um período com o mesmo ID
      const exists = prev.some(p => p.id === newPeriod.id);
      if (exists) {
        toast({
          title: "Erro",
          description: "Já existe um período acadêmico com este ano e semestre.",
          variant: "destructive"
        });
        return prev;
      }
      
      const newPeriods = [...prev, newPeriod];
      
      toast({
        title: "Período acadêmico adicionado",
        description: `Período ${newPeriod.name} foi criado com sucesso.`,
      });
      
      return newPeriods;
    });
  }, [toast]);

  const updateAcademicPeriod = useCallback((id: string, updates: Partial<AcademicPeriod>) => {
    setAcademicPeriods(prev => {
      const updated = prev.map(period => 
        period.id === id ? { ...period, ...updates } : period
      );
      
      toast({
        title: "Período acadêmico atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
      
      return updated;
    });
  }, [toast]);

  const deleteAcademicPeriod = useCallback((id: string) => {
    setAcademicPeriods(prev => {
      const filtered = prev.filter(period => period.id !== id);
      
      // Remover templates associados
      setScheduleTemplates(prevTemplates => 
        prevTemplates.filter(template => template.academicPeriodId !== id)
      );
      
      // Se o período ativo foi removido, ativar outro
      if (activePeriod === id && filtered.length > 0) {
        setActivePeriod(filtered[0].id);
      }
      
      toast({
        title: "Período acadêmico removido",
        description: "O período e suas grades associadas foram removidos.",
      });
      
      return filtered;
    });
  }, [toast, activePeriod]);

  const saveScheduleTemplate = useCallback((template: Omit<ScheduleTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: ScheduleTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setScheduleTemplates(prev => {
      const updated = [...prev, newTemplate];
      
      toast({
        title: "Grade salva",
        description: `Grade "${template.name}" foi salva com sucesso.`,
      });
      
      return updated;
    });
  }, [toast]);

  const getActiveAcademicPeriod = useCallback(() => {
    return academicPeriods.find(period => period.id === activePeriod);
  }, [academicPeriods, activePeriod]);

  const getScheduleTemplatesForPeriod = useCallback((periodId: string) => {
    return scheduleTemplates.filter(template => template.academicPeriodId === periodId);
  }, [scheduleTemplates]);

  return {
    academicPeriods,
    scheduleTemplates,
    activePeriod,
    setActivePeriod,
    addAcademicPeriod,
    updateAcademicPeriod,
    deleteAcademicPeriod,
    saveScheduleTemplate,
    getActiveAcademicPeriod,
    getScheduleTemplatesForPeriod
  };
};
