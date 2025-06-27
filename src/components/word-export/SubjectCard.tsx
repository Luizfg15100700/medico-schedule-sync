
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Subject } from '@/types';

interface SubjectCardProps {
  subject: Subject;
  isSelected: boolean;
  onToggle: (subjectId: string, period: string) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  isSelected,
  onToggle
}) => {
  return (
    <div className="border rounded p-3 hover:bg-gray-50">
      <div className="flex items-start space-x-2">
        <Checkbox
          id={`subject-${subject.id}`}
          checked={isSelected}
          onCheckedChange={() => onToggle(subject.id, subject.period.toString())}
        />
        <div className="flex-1 min-w-0">
          <Label 
            htmlFor={`subject-${subject.id}`} 
            className="text-sm font-medium cursor-pointer"
          >
            {subject.name}
          </Label>
          <p className="text-xs text-gray-600 mt-1">
            {subject.professor}
          </p>
          <div className="flex gap-1 mt-2">
            <Badge variant="outline" className="text-xs">
              {subject.totalWorkload}h
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {(subject.theoreticalClasses?.length || 0) + (subject.practicalClasses?.length || 0)} aulas
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
