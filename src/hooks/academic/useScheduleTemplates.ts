
import { useState, useCallback } from 'react';
import { ScheduleTemplate } from '@/types/academic';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useScheduleTemplates = () => {
  const { toast } = useToast();
  const [scheduleTemplates, setScheduleTemplates] = useState<ScheduleTemplate[]>([]);

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

  const getScheduleTemplatesForPeriod = useCallback((periodId: string) => {
    return scheduleTemplates.filter(template => template.academicPeriodId === periodId);
  }, [scheduleTemplates]);

  return {
    scheduleTemplates,
    loadScheduleTemplates,
    saveScheduleTemplate,
    getScheduleTemplatesForPeriod
  };
};
