
import { useEffect } from 'react';
import { AcademicPeriod } from '@/types/academic';
import { useAcademicPeriods } from './academic/useAcademicPeriods';
import { useAcademicOperations } from './academic/useAcademicOperations';
import { useScheduleTemplates } from './academic/useScheduleTemplates';
import { useAcademicValidation } from './academic/useAcademicValidation';

export const useAcademicCalendar = () => {
  const {
    academicPeriods,
    activePeriod,
    isLoading,
    setActivePeriod,
    loadAcademicPeriods,
    getPeriodsByStatus,
    getActiveAcademicPeriod
  } = useAcademicPeriods();

  const {
    addAcademicPeriod,
    updateAcademicPeriod,
    deleteAcademicPeriod,
    duplicateAcademicPeriod
  } = useAcademicOperations(academicPeriods, loadAcademicPeriods);

  const {
    scheduleTemplates,
    loadScheduleTemplates,
    saveScheduleTemplate,
    getScheduleTemplatesForPeriod
  } = useScheduleTemplates();

  const { calculatePeriodStatus, validatePeriod } = useAcademicValidation(academicPeriods);

  useEffect(() => {
    loadAcademicPeriods();
    loadScheduleTemplates();
  }, [loadAcademicPeriods, loadScheduleTemplates]);

  const createTemplate = (name: string, basePeriodId?: string) => {
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
  };

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
