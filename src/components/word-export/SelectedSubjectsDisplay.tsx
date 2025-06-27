
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Subject } from '@/types';

interface SelectedSubjectsDisplayProps {
  selectedSubjects: { subjectId: string; period: string }[];
  subjects: Subject[];
}

export const SelectedSubjectsDisplay: React.FC<SelectedSubjectsDisplayProps> = ({
  selectedSubjects,
  subjects
}) => {
  if (selectedSubjects.length === 0) return null;

  return (
    <Card className="p-4">
      <h4 className="font-medium mb-3">
        Disciplinas Selecionadas ({selectedSubjects.length})
      </h4>
      <div className="flex flex-wrap gap-2">
        {selectedSubjects.map(selected => {
          const subject = subjects.find(s => s.id === selected.subjectId);
          return (
            <Badge key={selected.subjectId} variant="default">
              {subject?.name}
            </Badge>
          );
        })}
      </div>
    </Card>
  );
};
