
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClassGroup } from '@/types/class';
import { PERIODS } from '@/types';

interface WordExportFormProps {
  scheduleName: string;
  onScheduleNameChange: (name: string) => void;
  selectedClass: string;
  onClassChange: (classId: string) => void;
  classes: ClassGroup[];
}

export const WordExportForm: React.FC<WordExportFormProps> = ({
  scheduleName,
  onScheduleNameChange,
  selectedClass,
  onClassChange,
  classes
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="scheduleName">Nome da Grade</Label>
        <Input
          id="scheduleName"
          value={scheduleName}
          onChange={(e) => onScheduleNameChange(e.target.value)}
          placeholder="Ex: Grade Medicina 2024.1"
        />
      </div>
      <div>
        <Label htmlFor="classSelect">Filtrar por Turma</Label>
        <Select value={selectedClass} onValueChange={onClassChange}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma turma" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as disciplinas</SelectItem>
            {classes.map(cls => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name} - {PERIODS[cls.period as keyof typeof PERIODS]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
