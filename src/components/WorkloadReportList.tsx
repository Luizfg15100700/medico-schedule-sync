
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface WorkloadReport {
  subjectId: string;
  totalWorkload: number;
  scheduledWorkload: number;
  conflictedWorkload: number;
  availableWorkload: number;
  utilizationPercentage: number;
}

interface WorkloadReportListProps {
  reports: WorkloadReport[];
}

export const WorkloadReportList: React.FC<WorkloadReportListProps> = ({ reports }) => {
  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUtilizationBadge = (percentage: number) => {
    if (percentage >= 90) return { variant: 'default' as const, label: 'Ótimo' };
    if (percentage >= 70) return { variant: 'secondary' as const, label: 'Bom' };
    return { variant: 'destructive' as const, label: 'Baixo' };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Relatório de Carga Horária</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {reports.map(report => {
          const badge = getUtilizationBadge(report.utilizationPercentage);
          
          return (
            <Card key={report.subjectId}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span className="truncate">Disciplina {report.subjectId}</span>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Aproveitamento</span>
                    <span className={getUtilizationColor(report.utilizationPercentage)}>
                      {Math.round(report.utilizationPercentage)}%
                    </span>
                  </div>
                  <Progress 
                    value={report.utilizationPercentage} 
                    className="h-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">Total:</span>
                      <span className="font-medium">{report.totalWorkload}h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-gray-600">Agendada:</span>
                      <span className="font-medium">{report.scheduledWorkload}h</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-gray-600">Conflito:</span>
                      <span className="font-medium">{Math.round(report.conflictedWorkload)}h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Disponível:</span>
                      <span className="font-medium">{report.availableWorkload}h</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
