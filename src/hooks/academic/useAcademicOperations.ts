
import { useCallback } from 'react';
import { AcademicPeriod } from '@/types/academic';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicValidation } from './useAcademicValidation';

export const useAcademicOperations = (
  academicPeriods: AcademicPeriod[],
  loadAcademicPeriods: () => Promise<void>
) => {
  const { toast } = useToast();
  const { calculatePeriodStatus, validatePeriod } = useAcademicValidation(academicPeriods);

  // Helper function to convert empty strings to null for date fields
  const sanitizeDateValue = (dateValue: string | undefined) => {
    return dateValue && dateValue.trim() !== '' ? dateValue : null;
  };

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
      console.log('Creating period with data:', period);
      
      const { error } = await supabase
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
          enrollment_start: sanitizeDateValue(period.enrollmentStart),
          enrollment_end: sanitizeDateValue(period.enrollmentEnd),
          exam_week_start: sanitizeDateValue(period.examWeekStart),
          exam_week_end: sanitizeDateValue(period.examWeekEnd)
        });

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
      console.log('Updating period with data:', updates);
      
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
          enrollment_start: sanitizeDateValue(updates.enrollmentStart),
          enrollment_end: sanitizeDateValue(updates.enrollmentEnd),
          exam_week_start: sanitizeDateValue(updates.examWeekStart),
          exam_week_end: sanitizeDateValue(updates.examWeekEnd)
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
      startDate: period.startDate.replace(period.year.toString(), nextYear.toString()),
      endDate: period.endDate.replace(period.year.toString(), nextYear.toString()),
      enrollmentStart: period.enrollmentStart?.replace(period.year.toString(), nextYear.toString()),
      enrollmentEnd: period.enrollmentEnd?.replace(period.year.toString(), nextYear.toString()),
      examWeekStart: period.examWeekStart?.replace(period.year.toString(), nextYear.toString()),
      examWeekEnd: period.examWeekEnd?.replace(period.year.toString(), nextYear.toString()),
    };

    addAcademicPeriod(newPeriod);
  }, [academicPeriods, addAcademicPeriod]);

  return {
    addAcademicPeriod,
    updateAcademicPeriod,
    deleteAcademicPeriod,
    duplicateAcademicPeriod
  };
};
