
import React from 'react';
import { Users } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ClassGroup } from '@/types/class';
import { PERIODS } from '@/types';

interface ClassInfoAlertProps {
  currentClass: ClassGroup;
}

export const ClassInfoAlert: React.FC<ClassInfoAlertProps> = ({ currentClass }) => {
  return (
    <Alert>
      <Users className="h-4 w-4" />
      <AlertDescription>
        <div className="flex items-center gap-2">
          <span>Turma selecionada:</span>
          <Badge>{currentClass.name}</Badge>
          <Badge variant="outline">{PERIODS[currentClass.period as keyof typeof PERIODS]}</Badge>
          <Badge variant="secondary">{currentClass.subjects.length} disciplinas</Badge>
        </div>
      </AlertDescription>
    </Alert>
  );
};
