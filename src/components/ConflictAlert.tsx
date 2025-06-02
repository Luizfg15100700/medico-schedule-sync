
import React from 'react';
import { ScheduleConflict, DAYS_OF_WEEK } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock } from 'lucide-react';

interface ConflictAlertProps {
  conflicts: ScheduleConflict[];
}

export const ConflictAlert: React.FC<ConflictAlertProps> = ({ conflicts }) => {
  if (conflicts.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <AlertTriangle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Nenhum conflito detectado</AlertTitle>
        <AlertDescription className="text-green-700">
          Sua grade horária atual não apresenta conflitos de horários.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>
          {conflicts.length} Conflito{conflicts.length > 1 ? 's' : ''} Detectado{conflicts.length > 1 ? 's' : ''}
        </AlertTitle>
        <AlertDescription>
          Existem sobreposições de horários entre as disciplinas selecionadas.
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        {conflicts.map(conflict => (
          <div key={conflict.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    CONFLITO
                  </Badge>
                  <span className="text-sm font-medium text-red-800">
                    {DAYS_OF_WEEK[conflict.conflictingClass1.dayOfWeek]}
                  </span>
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="font-medium text-red-900">
                    {conflict.subject1.name} × {conflict.subject2.name}
                  </div>
                  <div className="text-red-700">
                    Horário 1: {conflict.conflictingClass1.startTime} - {conflict.conflictingClass1.endTime}
                  </div>
                  <div className="text-red-700">
                    Horário 2: {conflict.conflictingClass2.startTime} - {conflict.conflictingClass2.endTime}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-1 text-red-700">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {conflict.overlapMinutes} min
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
