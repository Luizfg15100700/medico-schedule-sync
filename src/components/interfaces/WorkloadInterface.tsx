
import React from 'react';
import { WorkloadSummary } from '@/components/WorkloadSummary';
import { Subject } from '@/types';

interface WorkloadInterfaceProps {
  subjects: Subject[];
  selectedSubjects: string[];
}

export const WorkloadInterface: React.FC<WorkloadInterfaceProps> = ({
  subjects,
  selectedSubjects
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Análise de Carga Horária</h2>
      <WorkloadSummary 
        subjects={subjects} 
        selectedSubjects={selectedSubjects} 
      />
    </div>
  );
};
