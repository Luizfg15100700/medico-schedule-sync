
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PERIODS, DAYS_OF_WEEK } from '@/types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
}

export interface FilterOptions {
  periods: string[];
  daysOfWeek: string[];
  classType: 'all' | 'theoretical' | 'practical';
  hasConflicts: boolean | null;
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters
}) => {
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);

  const handlePeriodChange = (period: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      periods: checked 
        ? [...prev.periods, period]
        : prev.periods.filter(p => p !== period)
    }));
  };

  const handleDayChange = (day: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      daysOfWeek: checked 
        ? [...prev.daysOfWeek, day]
        : prev.daysOfWeek.filter(d => d !== day)
    }));
  };

  const clearFilters = () => {
    setFilters({
      periods: [],
      daysOfWeek: [],
      classType: 'all',
      hasConflicts: null
    });
  };

  const applyFilters = () => {
    onApplyFilters(filters);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Filtros de Disciplinas</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-3 block">Períodos</Label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PERIODS).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`period-${key}`}
                    checked={filters.periods.includes(key)}
                    onCheckedChange={(checked) => handlePeriodChange(key, checked as boolean)}
                  />
                  <Label htmlFor={`period-${key}`} className="text-sm">
                    {key === 'especial' ? 'Especial' : `${key}º`}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Dias da Semana</Label>
            <div className="space-y-2">
              {Object.entries(DAYS_OF_WEEK).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${key}`}
                    checked={filters.daysOfWeek.includes(key)}
                    onCheckedChange={(checked) => handleDayChange(key, checked as boolean)}
                  />
                  <Label htmlFor={`day-${key}`} className="text-sm">{label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Tipo de Aula</Label>
            <Select value={filters.classType} onValueChange={(value) => setFilters(prev => ({ ...prev, classType: value as any }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="theoretical">Apenas Teóricas</SelectItem>
                <SelectItem value="practical">Apenas Práticas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium mb-3 block">Conflitos</Label>
            <Select 
              value={filters.hasConflicts === null ? 'all' : filters.hasConflicts ? 'with' : 'without'} 
              onValueChange={(value) => setFilters(prev => ({ 
                ...prev, 
                hasConflicts: value === 'all' ? null : value === 'with' 
              }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="with">Com Conflitos</SelectItem>
                <SelectItem value="without">Sem Conflitos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Limpar Filtros
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={applyFilters} className="medical-gradient">
                Aplicar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
