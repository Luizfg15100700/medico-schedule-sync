
import React from 'react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Plus, Filter, Download, ChevronDown } from 'lucide-react';

interface PageHeaderProps {
  onOpenFilter: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
  onAddSubject: () => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  onOpenFilter,
  onExportPDF,
  onExportCSV,
  onAddSubject
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Sistema de Grades Horárias
        </h1>
        <p className="text-gray-600 mt-1">
          Gerencie suas disciplinas e horários do curso de Medicina por turmas
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onOpenFilter}>
          <Filter className="w-4 h-4 mr-2" />
          Filtros
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onExportPDF}>
              Exportar como HTML
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onExportCSV}>
              Exportar como CSV
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button className="medical-gradient" onClick={onAddSubject}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Disciplina
        </Button>
      </div>
    </div>
  );
};
