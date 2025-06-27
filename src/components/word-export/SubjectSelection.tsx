
import React from 'react';
import { Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Subject } from '@/types';
import { ClassGroup } from '@/types/class';
import { SubjectCard } from './SubjectCard';

interface SubjectSelectionProps {
  organizedSubjects: Record<string, { periodLabel: string; subjects: Subject[] }>;
  selectedSubjects: { subjectId: string; period: string }[];
  onToggleSubject: (subjectId: string, period: string) => void;
  currentClass?: ClassGroup;
}

export const SubjectSelection: React.FC<SubjectSelectionProps> = ({
  organizedSubjects,
  selectedSubjects,
  onToggleSubject,
  currentClass
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium flex items-center gap-2">
        <Calendar className="w-4 h-4" />
        Selecionar Disciplinas
        {currentClass && (
          <Badge variant="outline">
            Mostrando disciplinas da turma {currentClass.name}
          </Badge>
        )}
      </h3>
      
      {Object.entries(organizedSubjects)
        .sort(([a], [b]) => {
          if (a === 'especial') return 1;
          if (b === 'especial') return -1;
          return parseInt(a) - parseInt(b);
        })
        .map(([period, group]) => (
          <Card key={period} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">{group.periodLabel}</h4>
              <Badge variant="outline">{group.subjects.length} disciplinas</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {group.subjects.map(subject => {
                const isSelected = selectedSubjects.some(s => s.subjectId === subject.id);
                
                return (
                  <SubjectCard
                    key={subject.id}
                    subject={subject}
                    isSelected={isSelected}
                    onToggle={onToggleSubject}
                  />
                );
              })}
            </div>
          </Card>
        ))}
    </div>
  );
};
