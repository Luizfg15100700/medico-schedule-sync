
import React from 'react';
import { Subject, ClassSchedule, DAYS_OF_WEEK, TIME_SLOTS } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, User } from 'lucide-react';

interface ScheduleGridProps {
  subjects: Subject[];
  conflicts: any[];
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({ subjects, conflicts }) => {
  const renderTimeSlot = (day: keyof typeof DAYS_OF_WEEK, time: string) => {
    const classes: ClassSchedule[] = [];
    
    subjects.forEach(subject => {
      [...subject.theoreticalClasses, ...subject.practicalClasses].forEach(classItem => {
        if (classItem.dayOfWeek === day) {
          const startTime = new Date(`2000-01-01 ${classItem.startTime}`);
          const endTime = new Date(`2000-01-01 ${classItem.endTime}`);
          const slotTime = new Date(`2000-01-01 ${time}`);
          
          if (slotTime >= startTime && slotTime < endTime) {
            classes.push(classItem);
          }
        }
      });
    });

    const hasConflict = conflicts.some(conflict => 
      classes.some(c => c.id === conflict.conflictingClass1.id || c.id === conflict.conflictingClass2.id)
    );

    if (classes.length === 0) {
      return <div className="schedule-cell"></div>;
    }

    if (classes.length === 1) {
      const classItem = classes[0];
      const subject = subjects.find(s => s.id === classItem.subjectId);
      
      return (
        <div className={`schedule-cell occupied ${hasConflict ? 'conflict' : ''}`}>
          <div className="p-1">
            <div className="text-xs font-medium text-gray-900 truncate">
              {subject?.name}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {classItem.startTime} - {classItem.endTime}
            </div>
            <Badge 
              variant={classItem.type === 'theoretical' ? 'default' : 'secondary'}
              className="text-xs mt-1"
            >
              {classItem.type === 'theoretical' ? 'Teórica' : 'Prática'}
            </Badge>
          </div>
        </div>
      );
    }

    return (
      <div className="schedule-cell conflict">
        <div className="p-1">
          <div className="text-xs font-medium text-red-900">
            CONFLITO
          </div>
          <div className="text-xs text-red-700 mt-1">
            {classes.length} disciplinas
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="p-4 overflow-x-auto">
      <div className="min-w-[800px]">
        <div className="grid grid-cols-7 gap-1">
          {/* Header */}
          <div className="p-3 font-medium text-center bg-gray-100 rounded">
            Horário
          </div>
          {Object.entries(DAYS_OF_WEEK).map(([key, label]) => (
            <div key={key} className="p-3 font-medium text-center bg-gray-100 rounded">
              {label}
            </div>
          ))}
          
          {/* Time slots */}
          {TIME_SLOTS.map(time => (
            <React.Fragment key={time}>
              <div className="p-2 text-sm font-medium text-gray-600 bg-gray-50 text-center rounded">
                {time}
              </div>
              {Object.keys(DAYS_OF_WEEK).map(day => (
                <div key={`${day}-${time}`}>
                  {renderTimeSlot(day as keyof typeof DAYS_OF_WEEK, time)}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </Card>
  );
};
