
import { useToast } from '@/hooks/use-toast';

export const useMenuHandlers = (
  setActiveView: (view: string) => void,
  openAddModal: () => void,
  handleExportPDF: () => void
) => {
  const { toast } = useToast();

  const handleMenuClick = (menuId: string) => {
    console.log('Menu clicked:', menuId);
    
    switch (menuId) {
      case 'schedule':
        setActiveView('schedule');
        break;
      case 'create-schedule':
        setActiveView('create-schedule');
        break;
      case 'advanced-schedule':
        setActiveView('advanced-schedule');
        break;
      case 'academic-calendar':
        setActiveView('academic-calendar');
        break;
      case 'subjects':
        setActiveView('subjects');
        break;
      case 'new-subject':
        openAddModal();
        break;
      case 'workload':
        setActiveView('workload');
        break;
      case 'conflicts':
        setActiveView('conflicts');
        break;
      case 'reports':
        setActiveView('reports');
        break;
      case 'export':
        handleExportPDF();
        break;
      case 'settings':
        toast({
          title: "Configurações",
          description: "Funcionalidade em desenvolvimento",
        });
        break;
      default:
        break;
    }
  };

  return { handleMenuClick };
};
