
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Users } from 'lucide-react';
import { ClassGroup } from '@/types/class';
import { PERIODS } from '@/types';

interface ClassSelectorProps {
  classes: ClassGroup[];
  selectedClass: string;
  onClassChange: (classId: string) => void;
  onCopySchedule: (fromClassId: string, toClassId: string) => void;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({
  classes,
  selectedClass,
  onClassChange,
  onCopySchedule
}) => {
  const selectedClassObj = classes.find(cls => cls.id === selectedClass);
  const samePeriodsClasses = selectedClassObj 
    ? classes.filter(cls => cls.period === selectedClassObj.period && cls.id !== selectedClass)
    : [];

  const groupedClasses = classes.reduce((acc, cls) => {
    if (!acc[cls.period]) {
      acc[cls.period] = [];
    }
    acc[cls.period].push(cls);
    return acc;
  }, {} as Record<string, ClassGroup[]>);

  // Ordenar períodos: 1-8 primeiro, depois especial
  const sortedPeriods = Object.keys(groupedClasses).sort((a, b) => {
    if (a === 'especial') return 1;
    if (b === 'especial') return -1;
    return parseInt(a) - parseInt(b);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Seleção de Turma
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Turma Atual</label>
          <Select value={selectedClass} onValueChange={onClassChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortedPeriods.map(period => (
                <div key={period}>
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                    {PERIODS[period as keyof typeof PERIODS]}
                  </div>
                  {groupedClasses[period].map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      <div className="flex items-center gap-2">
                        <span>{cls.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {cls.subjects.length} disciplinas
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedClassObj && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{selectedClassObj.name}</h4>
                <p className="text-sm text-gray-600">
                  {PERIODS[selectedClassObj.period as keyof typeof PERIODS]}
                </p>
              </div>
              <Badge>
                {selectedClassObj.subjects.length} disciplinas
              </Badge>
            </div>

            {samePeriodsClasses.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Copiar horário para outra turma
                </label>
                <div className="space-y-2">
                  {samePeriodsClasses.map(cls => (
                    <div key={cls.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <span className="text-sm font-medium">{cls.name}</span>
                        <p className="text-xs text-gray-500">
                          {cls.subjects.length} disciplinas
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCopySchedule(selectedClass, cls.id)}
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copiar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
