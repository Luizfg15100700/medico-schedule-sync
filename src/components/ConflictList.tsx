
import React from 'react';
import { ScheduleConflict } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Calendar } from 'lucide-react';

interface ConflictListProps {
  conflicts: ScheduleConflict[];
}

export const ConflictList: React.FC<ConflictListProps> = ({ conflicts }) => {
  if (conflicts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum conflito encontrado</h3>
        <p className="text-gray-600">Todas as disciplinas estão com horários compatíveis.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <h2 className="text-xl font-semibold">Conflitos de Horário</h2>
        <Badge variant="destructive">{conflicts.length}</Badge>
      </div>

      <div className="space-y-3">
        {conflicts.map(conflict => (
          <Card key={conflict.id} className="border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Conflito de Horário
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-800">{conflict.subject1.name}</h4>
                  <p className="text-sm text-red-600">{conflict.subject1.professor}</p>
                  <p className="text-sm text-red-600">{conflict.subject1.period}º Período</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-800">{conflict.subject2.name}</h4>
                  <p className="text-sm text-red-600">{conflict.subject2.professor}</p>
                  <p className="text-sm text-red-600">{conflict.subject2.period}º Período</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Sobreposição: {Math.round(conflict.overlapMinutes)} minutos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
