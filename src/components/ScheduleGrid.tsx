
import React from 'react';
import { Subject, ClassSchedule, DAYS_OF_WEEK, TIME_SLOTS } from '@/types';
import { ClassGroup, SubjectScheduleOverride } from '@/types/class';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ScheduleGridProps {
  subjects: Subject[];
  conflicts: any[];
  selectedClass?: ClassGroup;
  getSubjectScheduleForClass?: (classId: string, subjectId: string, defaultSubject?: Subject) => SubjectScheduleOverride | null;
}

export const ScheduleGrid: React.FC<ScheduleGridProps> = ({ 
  subjects, 
  conflicts, 
  selectedClass,
  getSubjectScheduleForClass 
}) => {
  const getEffectiveSchedule = (subject: Subject): ClassSchedule[] => {
    if (!selectedClass || !getSubjectScheduleForClass) {
      // Usar horários padrão da disciplina
      return [...subject.theoreticalClasses, ...subject.practicalClasses];
    }

    const classSchedule = getSubjectScheduleForClass(selectedClass.id, subject.id, subject);
    if (classSchedule && classSchedule.hasCustomSchedule) {
      // Usar horários customizados da turma
      return [
        ...classSchedule.theoreticalClasses.map(tc => ({
          id: tc.id,
          subjectId: tc.subjectId,
          type: tc.type,
          dayOfWeek: tc.dayOfWeek,
          startTime: tc.startTime,
          endTime: tc.endTime,
          location: tc.location,
          workload: tc.workload
        })),
        ...classSchedule.practicalClasses.map(pc => ({
          id: pc.id,
          subjectId: pc.subjectId,
          type: pc.type,
          dayOfWeek: pc.dayOfWeek,
          startTime: pc.startTime,
          endTime: pc.endTime,
          location: pc.location,
          workload: pc.workload
        }))
      ] as ClassSchedule[];
    }

    // Usar horários padrão da disciplina
    return [...subject.theoreticalClasses, ...subject.practicalClasses];
  };

  const renderTimeSlot = (day: keyof typeof DAYS_OF_WEEK, time: string) => {
    const classes: ClassSchedule[] = [];
    
    subjects.forEach(subject => {
      const effectiveSchedule = getEffectiveSchedule(subject);
      effectiveSchedule.forEach(classItem => {
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
      
      // Verificar se é um horário customizado
      const isCustomSchedule = selectedClass && getSubjectScheduleForClass && 
        getSubjectScheduleForClass(selectedClass.id, subject?.id || '', subject)?.hasCustomSchedule;
      
      return (
        <div className={`schedule-cell occupied ${hasConflict ? 'conflict' : ''} ${isCustomSchedule ? 'custom-schedule' : ''}`}>
          <div className="p-1">
            <div className="text-xs font-medium text-gray-900 truncate">
              {subject?.name}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {classItem.startTime} - {classItem.endTime}
            </div>
            <div className="flex gap-1 mt-1">
              <Badge 
                variant={classItem.type === 'theoretical' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {classItem.type === 'theoretical' ? 'Teórica' : 'Prática'}
              </Badge>
              {isCustomSchedule && (
                <Badge variant="outline" className="text-xs">
                  Custom
                </Badge>
              )}
            </div>
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

      <style>{`
        .schedule-cell {
          min-height: 40px;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          background-color: white;
        }
        
        .schedule-cell.occupied {
          background-color: #dbeafe;
          border-color: #3b82f6;
        }
        
        .schedule-cell.conflict {
          background-color: #fecaca;
          border-color: #ef4444;
        }
        
        .schedule-cell.custom-schedule {
          background-color: #dcfce7;
          border-color: #22c55e;
        }
      `}</style>
    </Card>
  );
};
