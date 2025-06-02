
import React from 'react';
import { Subject } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Clock, TrendingUp } from 'lucide-react';

interface WorkloadSummaryProps {
  subjects: Subject[];
  selectedSubjects: string[];
}

export const WorkloadSummary: React.FC<WorkloadSummaryProps> = ({
  subjects,
  selectedSubjects
}) => {
  const selectedSubjectsList = subjects.filter(s => selectedSubjects.includes(s.id));
  
  const totalWorkload = selectedSubjectsList.reduce((total, subject) => 
    total + subject.totalWorkload, 0
  );
  
  const scheduledWorkload = selectedSubjectsList.reduce((total, subject) => {
    const scheduled = [...subject.theoreticalClasses, ...subject.practicalClasses]
      .reduce((sum, classItem) => sum + classItem.workload, 0);
    return total + scheduled;
  }, 0);
  
  const utilizationPercentage = totalWorkload > 0 ? (scheduledWorkload / totalWorkload) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Carga Horária Total
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWorkload}h</div>
          <p className="text-xs text-muted-foreground">
            {selectedSubjectsList.length} disciplinas selecionadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Horas Programadas
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{scheduledWorkload}h</div>
          <p className="text-xs text-muted-foreground">
            Aulas teóricas e práticas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Aproveitamento
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {utilizationPercentage.toFixed(1)}%
          </div>
          <Progress value={utilizationPercentage} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  );
};
