
import { useState, useCallback } from 'react';
import { AcademicPeriod } from '@/types/academic';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useAcademicPeriods = () => {
  const { toast } = useToast();
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [activePeriod, setActivePeriod] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

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

  const getPeriodsByStatus = useCallback((status: AcademicPeriod['status']) => {
    return academicPeriods.filter(period => period.status === status);
  }, [academicPeriods]);

  const getActiveAcademicPeriod = useCallback(() => {
    return academicPeriods.find(period => period.id === activePeriod);
  }, [academicPeriods, activePeriod]);

  return {
    academicPeriods,
    activePeriod,
    isLoading,
    setActivePeriod,
    loadAcademicPeriods,
    getPeriodsByStatus,
    getActiveAcademicPeriod
  };
};
