
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
      // Verificar se não é o último período
      if (prev.length <= 1) {
        toast({
          title: "Erro",
          description: "Não é possível excluir o último período acadêmico.",
          variant: "destructive"
        });
        return prev;
      }

      // Verificar se não é o período ativo
      const periodToDelete = prev.find(p => p.id === id);
      if (periodToDelete?.isActive) {
        toast({
          title: "Erro",
          description: "Não é possível excluir o período acadêmico ativo. Ative outro período antes de excluir.",
          variant: "destructive"
        });
        return prev;
      }

      // Filtrar o período excluído
      const filtered = prev.filter(period => period.id !== id);
      
      toast({
        title: "Período acadêmico removido",
        description: "O período foi removido com sucesso.",
      });
      
      return filtered;
    });

    // Remover templates associados
    setScheduleTemplates(prev => 
      prev.filter(template => template.academicPeriodId !== id)
    );
  }, [toast]);

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

  const duplicateAcademicPeriod = useCallback((periodId: string) => {
    const period = academicPeriods.find(p => p.id === periodId);
    if (!period) return;

    const nextYear = period.year + 1;
    const newPeriod: AcademicPeriod = {
      ...period,
      id: `${nextYear}-${period.semester}`,
      name: `${nextYear}.${period.semester}`,
      year: nextYear,
      isActive: false
    };

    setAcademicPeriods(prev => {
      const exists = prev.some(p => p.id === newPeriod.id);
      if (exists) {
        toast({
          title: "Erro",
          description: "Já existe um período com este ano e semestre.",
          variant: "destructive"
        });
        return prev;
      }

      const updated = [...prev, newPeriod];
      
      toast({
        title: "Período duplicado",
        description: `Período ${newPeriod.name} foi criado com base em ${period.name}.`,
      });
      
      return updated;
    });
  }, [academicPeriods, toast]);

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
    duplicateAcademicPeriod,
    saveScheduleTemplate,
    getActiveAcademicPeriod,
    getScheduleTemplatesForPeriod
  };
};
