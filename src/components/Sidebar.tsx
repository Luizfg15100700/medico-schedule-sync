
import React, { useState } from 'react';
import { 
  Calendar, 
  BookOpen, 
  Plus, 
  BarChart3, 
  Settings, 
  Clock,
  AlertTriangle,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onMenuClick?: (menuId: string) => void;
}

const menuItems = [
  { icon: Calendar, label: 'Grade Horária', id: 'schedule', active: true },
  { icon: BookOpen, label: 'Disciplinas', id: 'subjects' },
  { icon: Plus, label: 'Nova Disciplina', id: 'new-subject' },
  { icon: BarChart3, label: 'Relatórios', id: 'reports' },
  { icon: Clock, label: 'Carga Horária', id: 'workload' },
  { icon: AlertTriangle, label: 'Conflitos', id: 'conflicts' },
  { icon: Download, label: 'Exportar', id: 'export' },
  { icon: Settings, label: 'Configurações', id: 'settings' },
];

export const Sidebar: React.FC<SidebarProps> = ({ onMenuClick }) => {
  const [activeItem, setActiveItem] = useState('schedule');

  const handleItemClick = (item: typeof menuItems[0]) => {
    setActiveItem(item.id);
    onMenuClick?.(item.id);
    
    // Simple navigation logic for now
    if (item.id === 'subjects') {
      // Focus on subjects tab
      const tabsTrigger = document.querySelector('[value="subjects"]') as HTMLElement;
      tabsTrigger?.click();
    } else if (item.id === 'reports') {
      // Focus on reports tab
      const tabsTrigger = document.querySelector('[value="reports"]') as HTMLElement;
      tabsTrigger?.click();
    } else if (item.id === 'schedule') {
      // Focus on schedule tab
      const tabsTrigger = document.querySelector('[value="schedule"]') as HTMLElement;
      tabsTrigger?.click();
    } else if (item.id === 'new-subject') {
      // Trigger add subject modal
      const addButton = document.querySelector('[data-add-subject]') as HTMLElement;
      addButton?.click();
    }
  };

  return (
    <div className="fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeItem === item.id ? "default" : "ghost"}
            className={cn(
              "w-full justify-start gap-3 h-11",
              activeItem === item.id 
                ? "medical-gradient text-white" 
                : "text-gray-700 hover:bg-gray-100"
            )}
            onClick={() => handleItemClick(item)}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </Button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200 mt-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Estatísticas Rápidas</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-blue-700">Disciplinas:</span>
              <span className="font-medium text-blue-900">24</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Conflitos:</span>
              <span className="font-medium text-red-600">3</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Aproveitamento:</span>
              <span className="font-medium text-green-600">87%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
