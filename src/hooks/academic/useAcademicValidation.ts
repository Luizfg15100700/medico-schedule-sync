
import { useCallback } from 'react';
import { AcademicPeriod, AcademicCalendarValidation } from '@/types/academic';

export const useAcademicValidation = (academicPeriods: AcademicPeriod[]) => {
  const calculatePeriodStatus = useCallback((period: AcademicPeriod): AcademicPeriod['status'] => {
    const now = new Date();
    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);

    if (now < startDate) return 'future';
    if (now > endDate) return 'finished';
    return 'active';
  }, []);

  const validatePeriod = useCallback((period: Omit<AcademicPeriod, 'id' | 'status' | 'createdAt' | 'updatedAt'>, excludeId?: string): AcademicCalendarValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    const startDate = new Date(period.startDate);
    const endDate = new Date(period.endDate);
    const now = new Date();

    if (startDate >= endDate) {
      errors.push('A data de início deve ser anterior à data de término.');
    }

    if (startDate < now && !excludeId) {
      warnings.push('A data de início está no passado.');
    }

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

    const overlappingPeriods = academicPeriods.filter(p => {
      if (excludeId && p.id === excludeId) return false;
      
      const pStart = new Date(p.startDate);
      const pEnd = new Date(p.endDate);

      return (startDate <= pEnd && endDate >= pStart);
    });

    if (overlappingPeriods.length > 0) {
      errors.push(`Existe sobreposição com o(s) período(s): ${overlappingPeriods.map(p => p.name).join(', ')}`);
    }

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

  return {
    calculatePeriodStatus,
    validatePeriod
  };
};
