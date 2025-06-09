
import { useState, useCallback, useEffect } from 'react';
import { AcademicPeriod, ScheduleTemplate, AcademicCalendarValidation } from '@/types/academic';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAcademicCalendar = () => {
  const { toast } = useToast();
  
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [scheduleTemplates, setScheduleTemplates] = useState<ScheduleTemplate[]>([]);
  const [activePeriod, setActivePeriod] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Função para carregar períodos acadêmicos do banco
  const loadAcademicPeriods = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('academic_periods')
        .select('*')
        .order('year', { ascending: false })
        .order('semester', { ascending: false });

      if (error) {
        console.error('Erro ao carregar períodos acadêmicos:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar períodos acadêmicos.",
          variant: "destructive"
        });
        return;
      }

      const periods = data.map(period => ({
        id: period.id,
        name: period.name,
        semester: period.semester,
        year: period.year,
        startDate: period.start_date,
        endDate: period.end_date,
        isActive: period.is_active,
        status: period.status as AcademicPeriod['status'],
        type: period.type as AcademicPeriod['type'],
        enrollmentStart: period.enrollment_start,
        enrollmentEnd: period.enrollment_end,
        examWeekStart: period.exam_week_start,
        examWeekEnd: period.exam_week_end,
        createdAt: period.created_at,
        updatedAt: period.updated_at
      })) as AcademicPeriod[];

      setAcademicPeriods(periods);
      
      // Definir período ativo
      const active = periods.find(p => p.isActive);
      if (active) {
        setActivePeriod(active.id);
      }
    } catch (error) {
      console.error('Erro ao carregar períodos acadêmicos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Função para carregar templates de grade
  const loadScheduleTemplates = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('schedule_templates')
        .select('*');

      if (error) {
        console.error('Erro ao carregar templates:', error);
        return;
      }

      const templates = data.map(template => ({
        id: template.id,
        name: template.name,
        academicPeriodId: template.academic_period_id || '',
        subjects: (template.subjects as any) || [],
        createdAt: template.created_at,
        updatedAt: template.updated_at
      })) as ScheduleTemplate[];

      setScheduleTemplates(templates);
    } catch (error) {
      console.error('Erro ao carregar templates:', error);
    }
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadAcademicPeriods();
    loadScheduleTemplates();
  }, [loadAcademicPeriods, loadScheduleTemplates]);

  // Função para calcular o status automático baseado nas datas
  const calculatePeriodStatus = useCallback((period: AcademicPeriod): AcademicPeriod['status'] => {
    const now = new Date();
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);

    if (now < startDate) return 'future';
    if (now > endDate) return 'finished';
    return 'active';
  }, []);

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

  const addAcademicPeriod = useCallback(async (period: Omit<AcademicPeriod, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
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

    try {
      const { data, error } = await supabase
        .from('academic_periods')
        .insert({
          name: period.name,
          semester: period.semester,
          year: period.year,
          start_date: period.startDate,
          end_date: period.endDate,
          is_active: period.isActive,
          status: calculatePeriodStatus(period as AcademicPeriod),
          type: period.type,
          enrollment_start: period.enrollmentStart,
          enrollment_end: period.enrollmentEnd,
          exam_week_start: period.examWeekStart,
          exam_week_end: period.examWeekEnd
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar período:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar período acadêmico.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Período acadêmico adicionado",
        description: `Período ${period.name} foi criado com sucesso.`,
      });

      await loadAcademicPeriods();
    } catch (error) {
      console.error('Erro ao adicionar período:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar período.",
        variant: "destructive"
      });
    }
  }, [toast, calculatePeriodStatus, validatePeriod, loadAcademicPeriods]);

  const updateAcademicPeriod = useCallback(async (id: string, updates: Partial<AcademicPeriod>) => {
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

    try {
      const { error } = await supabase
        .from('academic_periods')
        .update({
          name: updates.name,
          semester: updates.semester,
          year: updates.year,
          start_date: updates.startDate,
          end_date: updates.endDate,
          is_active: updates.isActive,
          status: updates.status || calculatePeriodStatus(updatedPeriod),
          type: updates.type,
          enrollment_start: updates.enrollmentStart,
          enrollment_end: updates.enrollmentEnd,
          exam_week_start: updates.examWeekStart,
          exam_week_end: updates.examWeekEnd
        })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar período:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar período acadêmico.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Período acadêmico atualizado",
        description: "As alterações foram salvas com sucesso.",
      });

      await loadAcademicPeriods();
    } catch (error) {
      console.error('Erro ao atualizar período:', error);
    }
  }, [toast, academicPeriods, calculatePeriodStatus, validatePeriod, loadAcademicPeriods]);

  const deleteAcademicPeriod = useCallback(async (id: string) => {
    if (academicPeriods.length <= 1) {
      toast({
        title: "Erro",
        description: "Não é possível excluir o último período acadêmico.",
        variant: "destructive"
      });
      return;
    }

    const periodToDelete = academicPeriods.find(p => p.id === id);
    if (periodToDelete?.isActive) {
      toast({
        title: "Erro",
        description: "Não é possível excluir o período acadêmico ativo. Ative outro período antes de excluir.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('academic_periods')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir período:', error);
        toast({
          title: "Erro",
          description: "Erro ao excluir período acadêmico.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Período acadêmico removido",
        description: "O período foi removido com sucesso.",
      });

      await loadAcademicPeriods();
    } catch (error) {
      console.error('Erro ao excluir período:', error);
    }
  }, [toast, academicPeriods, loadAcademicPeriods]);

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

  const saveScheduleTemplate = useCallback(async (template: Omit<ScheduleTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { error } = await supabase
        .from('schedule_templates')
        .insert({
          name: template.name,
          academic_period_id: template.academicPeriodId,
          subjects: template.subjects as any
        });

      if (error) {
        console.error('Erro ao salvar template:', error);
        toast({
          title: "Erro",
          description: "Erro ao salvar grade.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Grade salva",
        description: `Grade "${template.name}" foi salva com sucesso.`,
      });

      await loadScheduleTemplates();
    } catch (error) {
      console.error('Erro ao salvar template:', error);
    }
  }, [toast, loadScheduleTemplates]);

  const getActiveAcademicPeriod = useCallback(() => {
    return academicPeriods.find(period => period.id === activePeriod);
  }, [academicPeriods, activePeriod]);

  const getScheduleTemplatesForPeriod = useCallback((periodId: string) => {
    return scheduleTemplates.filter(template => template.academicPeriodId === periodId);
  }, [scheduleTemplates]);

  const getPeriodsByStatus = useCallback((status: AcademicPeriod['status']) => {
    return academicPeriods.filter(period => period.status === status);
  }, [academicPeriods]);

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

  return {
    academicPeriods,
    scheduleTemplates,
    activePeriod,
    isLoading,
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
    calculatePeriodStatus,
    loadAcademicPeriods
  };
};
