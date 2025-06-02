
import React from 'react';
import { Subject, PERIODS, DAYS_OF_WEEK } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Clock, MapPin, User, Edit, Trash2 } from 'lucide-react';

interface SubjectCardProps {
  subject: Subject;
  isSelected: boolean;
  onToggleSelection: (subjectId: string) => void;
  onEdit?: (subject: Subject) => void;
  onDelete?: (subjectId: string) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  isSelected,
  onToggleSelection,
  onEdit,
  onDelete
}) => {
  const totalScheduledHours = [
    ...subject.theoreticalClasses,
    ...subject.practicalClasses
  ].reduce((total, classItem) => total + classItem.workload, 0);

  return (
    <Card className={`transition-all duration-200 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold">{subject.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={`period-${subject.period}`}>
                {PERIODS[subject.period]}
              </Badge>
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: subject.color }}
              />
            </div>
          </div>
          <Switch
            checked={isSelected}
            onCheckedChange={() => onToggleSelection(subject.id)}
          />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-4 h-4" />
            <span>{subject.professor}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{subject.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{totalScheduledHours}h de {subject.totalWorkload}h programadas</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Horários:</div>
          
          {subject.theoreticalClasses.length > 0 && (
            <div>
              <div className="text-xs font-medium text-blue-600 mb-1">Aulas Teóricas:</div>
              {subject.theoreticalClasses.map(classItem => (
                <div key={classItem.id} className="text-xs text-gray-600 ml-2">
                  {DAYS_OF_WEEK[classItem.dayOfWeek]}: {classItem.startTime} - {classItem.endTime}
                </div>
              ))}
            </div>
          )}
          
          {subject.practicalClasses.length > 0 && (
            <div>
              <div className="text-xs font-medium text-green-600 mb-1">Aulas Práticas:</div>
              {subject.practicalClasses.map(classItem => (
                <div key={classItem.id} className="text-xs text-gray-600 ml-2">
                  {DAYS_OF_WEEK[classItem.dayOfWeek]}: {classItem.startTime} - {classItem.endTime}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(subject)}
              className="flex-1"
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(subject.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
