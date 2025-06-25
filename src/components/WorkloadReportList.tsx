
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

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
  if (reports.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum relatório disponível</h3>
        <p className="text-gray-600">Adicione disciplinas para ver os relatórios de carga horária.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-blue-500" />
        <h2 className="text-xl font-semibold">Relatórios de Carga Horária</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map(report => (
          <Card key={report.subjectId} className="p-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Disciplina</span>
                {report.utilizationPercentage >= 90 ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : report.conflictedWorkload > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                ) : (
                  <Clock className="w-5 h-5 text-blue-500" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Utilização</span>
                  <span className="font-medium">{Math.round(report.utilizationPercentage)}%</span>
                </div>
                <Progress value={report.utilizationPercentage} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Total</span>
                  <div className="font-medium">{report.totalWorkload}h</div>
                </div>
                <div>
                  <span className="text-gray-600">Agendada</span>
                  <div className="font-medium">{report.scheduledWorkload}h</div>
                </div>
                <div>
                  <span className="text-gray-600">Disponível</span>
                  <div className="font-medium">{report.availableWorkload}h</div>
                </div>
                <div>
                  <span className="text-gray-600">Conflitos</span>
                  <div className="font-medium text-red-600">{report.conflictedWorkload}h</div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <Badge 
                  variant={
                    report.utilizationPercentage >= 90 ? "default" :
                    report.conflictedWorkload > 0 ? "destructive" : 
                    "secondary"
                  }
                  className="w-full justify-center"
                >
                  {report.utilizationPercentage >= 90 ? "Completa" :
                   report.conflictedWorkload > 0 ? "Com Conflitos" : 
                   "Em Progresso"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
