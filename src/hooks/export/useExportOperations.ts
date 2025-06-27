
import { useToast } from '@/hooks/use-toast';
import { useAcademicCalendar } from '@/hooks/useAcademicCalendar';
import { exportToPDF, exportToExcel } from '@/utils/exportUtils';
import { Subject } from '@/types';

export const useExportOperations = () => {
  const { toast } = useToast();
  const { saveScheduleTemplate } = useAcademicCalendar();

  const handleExportPDF = (subjects: Subject[], currentClassSubjects: string[]) => {
    exportToPDF(subjects, currentClassSubjects);
    toast({
      title: "Exportação realizada",
      description: "Grade exportada como HTML com sucesso!",
    });
  };

  const handleExportCSV = (subjects: Subject[], currentClassSubjects: string[]) => {
    exportToExcel(subjects, currentClassSubjects);
    toast({
      title: "Exportação realizada",
      description: "Grade exportada como Excel com sucesso!",
    });
  };

  const handleSaveAdvancedSchedule = (schedule: {
    name: string;
    academicPeriodId: string;
    assignments: any[];
  }) => {
    saveScheduleTemplate({
      name: schedule.name,
      academicPeriodId: schedule.academicPeriodId,
      subjects: schedule.assignments
    });
  };

  return {
    handleExportPDF,
    handleExportCSV,
    handleSaveAdvancedSchedule
  };
};
