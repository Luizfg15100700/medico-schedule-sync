
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, AlertCircle } from 'lucide-react';

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
        <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum relatório disponível</h3>
        <p className="text-gray-500">Adicione disciplinas para ver os relatórios de carga horária.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-500" />
        <h2 className="text-xl font-semibold">Relatório de Carga Horária</h2>
        <Badge variant="outline">{reports.length} disciplinas</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card key={report.subjectId}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Carga Horária
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Utilização</span>
                  <span className="font-medium">{Math.round(report.utilizationPercentage)}%</span>
                </div>
                <Progress value={report.utilizationPercentage} className="h-2" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium">{report.totalWorkload}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Agendado:</span>
                  <span className="font-medium text-green-600">{report.scheduledWorkload}h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Disponível:</span>
                  <span className="font-medium text-blue-600">{report.availableWorkload}h</span>
                </div>
                {report.conflictedWorkload > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Conflitos:
                    </span>
                    <span className="font-medium text-red-600">{Math.round(report.conflictedWorkload)}h</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t">
                <Badge 
                  variant={report.utilizationPercentage > 90 ? "destructive" : 
                          report.utilizationPercentage > 70 ? "default" : "secondary"}
                  className="w-full justify-center"
                >
                  {report.utilizationPercentage > 90 ? "Sobrecarga" :
                   report.utilizationPercentage > 70 ? "Alta Utilização" : "Normal"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
