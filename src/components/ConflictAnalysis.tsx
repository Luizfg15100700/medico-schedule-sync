
import React from 'react';
import { ScheduleConflict, DAYS_OF_WEEK } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Clock, MapPin } from 'lucide-react';

interface ConflictAnalysisProps {
  conflicts: ScheduleConflict[];
}

export const ConflictAnalysis: React.FC<ConflictAnalysisProps> = ({ conflicts }) => {
  if (conflicts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Clock className="w-5 h-5" />
            Análise de Conflitos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">
              ✅ Nenhum conflito detectado! Sua grade está perfeita.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="w-5 h-5" />
          Análise de Conflitos ({conflicts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {conflicts.map((conflict, index) => (
          <Alert key={conflict.id} className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium text-red-800">
                  Conflito #{index + 1}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="font-medium">{conflict.subject1.name}</div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-3 h-3" />
                      {DAYS_OF_WEEK[conflict.conflictingClass1.dayOfWeek]} - 
                      {conflict.conflictingClass1.startTime} às {conflict.conflictingClass1.endTime}
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-3 h-3" />
                      {conflict.conflictingClass1.location}
                    </div>
                    <Badge variant={conflict.conflictingClass1.type === 'theoretical' ? 'default' : 'secondary'}>
                      {conflict.conflictingClass1.type === 'theoretical' ? 'Teórica' : 'Prática'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="font-medium">{conflict.subject2.name}</div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-3 h-3" />
                      {DAYS_OF_WEEK[conflict.conflictingClass2.dayOfWeek]} - 
                      {conflict.conflictingClass2.startTime} às {conflict.conflictingClass2.endTime}
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-3 h-3" />
                      {conflict.conflictingClass2.location}
                    </div>
                    <Badge variant={conflict.conflictingClass2.type === 'theoretical' ? 'default' : 'secondary'}>
                      {conflict.conflictingClass2.type === 'theoretical' ? 'Teórica' : 'Prática'}
                    </Badge>
                  </div>
                </div>
                
                <div className="text-xs text-red-700 bg-red-100 p-2 rounded">
                  ⚠️ Sobreposição de {conflict.overlapMinutes} minutos
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ))}
      </CardContent>
    </Card>
  );
};
