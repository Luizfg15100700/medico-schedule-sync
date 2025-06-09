import { useState, useCallback, useEffect } from 'react';
import { AcademicPeriod, ScheduleTemplate, AcademicCalendarValidation } from '@/types/academic';
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
      isActive: true,
      status: 'active',
      type: 'regular',
      enrollmentStart: '2024-01-15',
      enrollmentEnd: '2024-02-01',
      examWeekStart: '2024-06-20',
      examWeekEnd: '2024-06-30',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2024-2',
      name: '2024.2',
      semester: '2',
      year: 2024,
      startDate: '2024-08-05',
      endDate: '2024-12-20',
      isActive: false,
      status: 'future',
      type: 'regular',
      enrollmentStart: '2024-07-15',
      enrollmentEnd: '2024-08-01',
      examWeekStart: '2024-12-10',
      examWeekEnd: '2024-12-20',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const [scheduleTemplates, setScheduleTemplates] = useState<ScheduleTemplate[]>([]);
  const [activePeriod, setActivePeriod] = useState<string>('2024-1');

  // Função para calcular o status automático baseado nas datas
  const calculatePeriodStatus = useCallback((period: AcademicPeriod): AcademicPeriod['status'] => {
    const now = new Date();
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);

    if (now < startDate) return 'future';
    if (now > endDate) return 'finished';
    return 'active';
  }, []);

  // Atualizar status automaticamente
  useEffect(() => {
    setAcademicPeriods(prev => 
      prev.map(period => ({
        ...period,
        status: calculatePeriodStatus(period)
      }))
    );
  }, [calculatePeriodStatus]);

  // Função de validação avançada
  const validatePeriod = useCallback((period: Omit<AcademicPeriod, 'id' | 'status' | 'createdAt' | 'updatedAt'>, excludeId?: string): AcademicCalendarValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validar datas
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    const now = new Date();

    if (startDate >= endDate) {
      errors.push('A data de início deve ser anterior à data de término.');
    }

    if (startDate < now && !excludeId) {
      warnings.push('A data de início está no passado.');
    }

    // Validar períodos de matrícula
    if (period.enrollmentStart && period.enrollmentEnd) {
      const enrollmentStart = new Date(period.enrollmentStart);
      const enrollmentEnd = new Date(period.enrollmentEnd);

      if (enrollmentStart >= enrollmentEnd) {
        errors.push('A data de início da matrícula deve ser anterior à data de término.');
      }

      if (enrollmentEnd > startDate) {
        errors.push('O período de matrícula deve terminar antes do início das aulas.');
      }
    }

    // Validar semana de provas
    if (period.examWeekStart && period.examWeekEnd) {
      const examStart = new Date(period.examWeekStart);
      const examEnd = new Date(period.examWeekEnd);

      if (examStart >= examEnd) {
        errors.push('A data de início da semana de provas deve ser anterior à data de término.');
      }

      if (examStart < startDate || examEnd > endDate) {
        errors.push('A semana de provas deve estar dentro do período letivo.');
      }
    }

    // Verificar sobreposição com outros períodos
    const overlappingPeriods = academicPeriods.filter(p => {
      if (excludeId && p.id === excludeId) return false;
      
      const pStart = new Date(p.startDate);
      const pEnd = new Date(p.endDate);

      return (startDate <= pEnd && endDate >= pStart);
    });

    if (overlappingPeriods.length > 0) {
      errors.push(`Existe sobreposição com o(s) período(s): ${overlappingPeriods.map(p => p.name).join(', ')}`);
    }

    // Verificar período duplicado
    const duplicatePeriod = academicPeriods.find(p => 
      p.year === period.year && 
      p.semester === period.semester && 
      (!excludeId || p.id !== excludeId)
    );

    if (duplicatePeriod) {
      errors.push(`Já existe um período para ${period.year}.${period.semester}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [academicPeriods]);

  const addAcademicPeriod = useCallback((period: Omit<AcademicPeriod, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    const validation = validatePeriod(period);
    
    if (!validation.isValid) {
      toast({
        title: "Erro de Validação",
        description: validation.errors.join(' '),
        variant: "destructive"
      });
      return;
    }

    if (validation.warnings.length > 0) {
      toast({
        title: "Atenção",
        description: validation.warnings.join(' '),
        variant: "default"
      });
    }

    const newPeriod: AcademicPeriod = {
      ...period,
      id: `${period.year}-${period.semester}`,
      status: calculatePeriodStatus(period as AcademicPeriod),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAcademicPeriods(prev => {
      const newPeriods = [...prev, newPeriod].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return parseInt(a.semester) - parseInt(b.semester);
      });
      
      toast({
        title: "Período acadêmico adicionado",
        description: `Período ${newPeriod.name} foi criado com sucesso.`,
      });
      
      return newPeriods;
    });
  }, [toast, calculatePeriodStatus, validatePeriod]);

  const updateAcademicPeriod = useCallback((id: string, updates: Partial<AcademicPeriod>) => {
    const currentPeriod = academicPeriods.find(p => p.id === id);
    if (!currentPeriod) return;

    const updatedPeriod = { ...currentPeriod, ...updates };
    const validation = validatePeriod(updatedPeriod, id);
    
    if (!validation.isValid) {
      toast({
        title: "Erro de Validação",
        description: validation.errors.join(' '),
        variant: "destructive"
      });
      return;
    }

    setAcademicPeriods(prev => {
      const updated = prev.map(period => 
        period.id === id ? { 
          ...period, 
          ...updates, 
          status: calculatePeriodStatus({ ...period, ...updates } as AcademicPeriod),
          updatedAt: new Date().toISOString() 
        } : period
      );
      
      toast({
        title: "Período acadêmico atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
      
      return updated;
    });
  }, [toast, academicPeriods, calculatePeriodStatus, validatePeriod]);

  const deleteAcademicPeriod = useCallback((id: string) => {
    setAcademicPeriods(prev => {
      if (prev.length <= 1) {
        toast({
          title: "Erro",
          description: "Não é possível excluir o último período acadêmico.",
          variant: "destructive"
        });
        return prev;
      }

      const periodToDelete = prev.find(p => p.id === id);
      if (periodToDelete?.isActive) {
        toast({
          title: "Erro",
          description: "Não é possível excluir o período acadêmico ativo. Ative outro período antes de excluir.",
          variant: "destructive"
        });
        return prev;
      }

      const filtered = prev.filter(period => period.id !== id);
      
      toast({
        title: "Período acadêmico removido",
        description: "O período foi removido com sucesso.",
      });
      
      return filtered;
    });

    setScheduleTemplates(prev => 
      prev.filter(template => template.academicPeriodId !== id)
    );
  }, [toast]);

  const duplicateAcademicPeriod = useCallback((periodId: string, targetYear?: number) => {
    const period = academicPeriods.find(p => p.id === periodId);
    if (!period) return;

    const nextYear = targetYear || period.year + 1;
    const newPeriod: Omit<AcademicPeriod, 'id' | 'status' | 'createdAt' | 'updatedAt'> = {
      ...period,
      name: `${nextYear}.${period.semester}`,
      year: nextYear,
      isActive: false,
      // Ajustar datas automaticamente
      startDate: period.startDate.replace(period.year.toString(), nextYear.toString()),
      endDate: period.endDate.replace(period.year.toString(), nextYear.toString()),
      enrollmentStart: period.enrollmentStart?.replace(period.year.toString(), nextYear.toString()),
      enrollmentEnd: period.enrollmentEnd?.replace(period.year.toString(), nextYear.toString()),
      examWeekStart: period.examWeekStart?.replace(period.year.toString(), nextYear.toString()),
      examWeekEnd: period.examWeekEnd?.replace(period.year.toString(), nextYear.toString()),
    };

    addAcademicPeriod(newPeriod);
  }, [academicPeriods, addAcademicPeriod]);

  const createTemplate = useCallback((name: string, basePeriodId?: string) => {
    const basePeriod = basePeriodId ? academicPeriods.find(p => p.id === basePeriodId) : academicPeriods[0];
    
    if (!basePeriod) return;

    const template: Omit<AcademicPeriod, 'id' | 'status' | 'createdAt' | 'updatedAt'> = {
      ...basePeriod,
      name: name,
      year: new Date().getFullYear(),
      isActive: false,
      startDate: '',
      endDate: ''
    };

    return template;
  }, [academicPeriods]);

  const getActiveAcademicPeriod = useCallback(() => {
    return academicPeriods.find(period => period.id === activePeriod);
  }, [academicPeriods, activePeriod]);

  const getScheduleTemplatesForPeriod = useCallback((periodId: string) => {
    return scheduleTemplates.filter(template => template.academicPeriodId === periodId);
  }, [scheduleTemplates]);

  const getPeriodsByStatus = useCallback((status: AcademicPeriod['status']) => {
    return academicPeriods.filter(period => period.status === status);
  }, [academicPeriods]);

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
    getScheduleTemplatesForPeriod,
    getPeriodsByStatus,
    validatePeriod,
    createTemplate,
    calculatePeriodStatus
  };
};
