import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  BookOpen, 
  Clock, 
  AlertTriangle, 
  FileText,
  Settings,
  BarChart3,
  CalendarPlus
} from 'lucide-react';

interface SidebarProps {
  onMenuClick?: (menuId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onMenuClick }) => {
  const menuItems = [
    { id: 'schedule', label: 'Grade Horária', icon: Calendar },
    { id: 'subjects', label: 'Disciplinas', icon: BookOpen },
    { id: 'workload', label: 'Carga Horária', icon: Clock },
    { id: 'conflicts', label: 'Conflitos', icon: AlertTriangle },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    {
      id: 'advanced-schedule',
      label: 'Criador Avançado',
      icon: CalendarPlus,
      description: 'Criar grades com análise de conflitos'
    },
    {
      id: 'word-export',
      label: 'Exportar para Word',
      icon: FileText,
      description: 'Criar grade formatada em Word'
    },
    { id: 'academic-calendar', label: 'Calendário Acadêmico', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-30">
      <div className="p-4 h-full overflow-y-auto">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start text-left hover:bg-gray-100"
                onClick={() => onMenuClick?.(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};
