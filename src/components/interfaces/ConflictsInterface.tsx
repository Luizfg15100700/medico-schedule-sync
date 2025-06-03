
import React from 'react';
import { ConflictAnalysis } from '@/components/ConflictAnalysis';
import { ScheduleConflict } from '@/types';

interface ConflictsInterfaceProps {
  conflicts: ScheduleConflict[];
}

export const ConflictsInterface: React.FC<ConflictsInterfaceProps> = ({
  conflicts
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Análise de Conflitos</h2>
      <ConflictAnalysis conflicts={conflicts} />
    </div>
  );
};
