
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Calendar, 
  Grid, 
  BarChart3, 
  FileText, 
  AlertTriangle, 
  User, 
  Settings,
  GraduationCap,
  Clock,
  Users,
  Target
} from 'lucide-react';

interface SidebarProps {
  onMenuClick: (menuItem: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onMenuClick }) => {
  const menuItems = [
    { 
      id: 'subjects', 
      label: 'Disciplinas', 
      icon: BookOpen, 
      description: 'Gerenciar disciplinas e conteúdos'
    },
    { 
      id: 'schedule', 
      label: 'Grade Horária', 
      icon: Grid, 
      description: 'Visualizar e editar horários'
    },
    { 
      id: 'schedule-builder', 
      label: 'Construtor de Grade', 
      icon: Target, 
      description: 'Ferramentas avançadas para criação de grades'
    },
    { 
      id: 'academic-calendar', 
      label: 'Calendário Acadêmico', 
      icon: Calendar, 
      description: 'Períodos letivos e datas importantes'
    },
    { 
      id: 'workload', 
      label: 'Carga Horária', 
      icon: Clock, 
      description: 'Análise de distribuição de horas'
    },
    { 
      id: 'conflicts', 
      label: 'Conflitos', 
      icon: AlertTriangle, 
      description: 'Identificar e resolver conflitos de horário'
    },
    { 
      id: 'reports', 
      label: 'Relatórios', 
      icon: BarChart3, 
      description: 'Estatísticas e análises detalhadas'
    },
    { 
      id: 'advanced-schedule', 
      label: 'Grade Avançada', 
      icon: GraduationCap, 
      description: 'Configurações avançadas de grade'
    }
  ];

  const settingsItems = [
    { 
      id: 'profile', 
      label: 'Perfil', 
      icon: User, 
      description: 'Configurações do usuário'
    },
    { 
      id: 'settings', 
      label: 'Configurações', 
      icon: Settings, 
      description: 'Configurações do sistema'
    }
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 fixed left-0 top-16 flex flex-col">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Sistema Acadêmico</h2>
            <p className="text-xs text-gray-500">Gestão de Grades</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2">
          <div className="pb-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Menu Principal
            </h3>
            <div className="space-y-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 hover:bg-blue-50 hover:text-blue-700 group"
                    onClick={() => onMenuClick(item.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <IconComponent className="w-5 h-5 mt-0.5 text-gray-500 group-hover:text-blue-600" />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs text-gray-500 group-hover:text-blue-600 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator className="my-4" />

          <div className="pb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Sistema
            </h3>
            <div className="space-y-1">
              {settingsItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-3 hover:bg-gray-50 hover:text-gray-700 group"
                    onClick={() => onMenuClick(item.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <IconComponent className="w-5 h-5 mt-0.5 text-gray-500 group-hover:text-gray-600" />
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs text-gray-500 group-hover:text-gray-600 mt-0.5">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          <p>Versão 2.0.1</p>
          <p className="mt-1">© 2024 Sistema Acadêmico</p>
        </div>
      </div>
    </div>
  );
};
