
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  BookOpen,
  Plus,
  AlertCircle,
  BarChart3,
  Download,
  Settings,
  GraduationCap,
  Layers,
  CalendarCheck
} from 'lucide-react';

interface SidebarProps {
  onMenuClick?: (menuId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onMenuClick }) => {
  const [activeMenu, setActiveMenu] = useState('schedule');

  const handleMenuClick = (menuId: string) => {
    setActiveMenu(menuId);
    onMenuClick?.(menuId);
  };

  const menuItems = [
    {
      id: 'schedule',
      label: 'Grade Horária',
      icon: Calendar,
      description: 'Visualizar grade semanal'
    },
    {
      id: 'academic-calendar',
      label: 'Calendário Acadêmico',
      icon: CalendarCheck,
      description: 'Gerenciar períodos letivos',
      isNew: true
    },
    {
      id: 'advanced-schedule',
      label: 'Criador Avançado',
      icon: Layers,
      description: 'Criar grades elaboradas',
      isNew: true
    },
    {
      id: 'subjects',
      label: 'Disciplinas',
      icon: BookOpen,
      description: 'Gerenciar disciplinas'
    },
    {
      id: 'new-subject',
      label: 'Nova Disciplina',
      icon: Plus,
      description: 'Adicionar disciplina'
    },
    {
      id: 'workload',
      label: 'Carga Horária',
      icon: Clock,
      description: 'Análise de workload'
    },
    {
      id: 'conflicts',
      label: 'Conflitos',
      icon: AlertCircle,
      description: 'Análise de conflitos'
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: BarChart3,
      description: 'Relatórios e estatísticas'
    },
    {
      id: 'export',
      label: 'Exportar',
      icon: Download,
      description: 'Exportar grades'
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      description: 'Configurações do sistema'
    }
  ];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="medical-gradient p-2 rounded-lg">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Menu Principal</h2>
            <p className="text-xs text-gray-600">Sistema de Grades</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start text-left p-3 h-auto ${
                  isActive 
                    ? 'medical-gradient text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => handleMenuClick(item.id)}
              >
                <div className="flex items-center gap-3 w-full">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{item.label}</span>
                      {item.isNew && (
                        <Badge className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5">
                          Novo
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs opacity-80 truncate">{item.description}</p>
                  </div>
                </div>
              </Button>
            );
          })}
        </nav>

        <Card className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <div className="text-center">
            <GraduationCap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h3 className="font-medium text-blue-900 mb-1">Sistema Atualizado</h3>
            <p className="text-xs text-blue-700 mb-3">
              Agora as disciplinas são automaticamente adicionadas a todas as turmas do período!
            </p>
            <Badge className="bg-blue-100 text-blue-800 text-xs">
              v2.1
            </Badge>
          </div>
        </Card>
      </div>
    </aside>
  );
};
