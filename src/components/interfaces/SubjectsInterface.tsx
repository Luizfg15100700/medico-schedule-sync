
import React, { useState } from 'react';
import { SubjectCard } from '@/components/SubjectCard';
import { ClassSelector } from '@/components/ClassSelector';
import { ClassSpecificScheduleEditor } from '@/components/ClassSpecificScheduleEditor';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Calendar } from 'lucide-react';
import { Subject } from '@/types';
import { ClassGroup, SubjectScheduleOverride } from '@/types/class';

interface SubjectsInterfaceProps {
  subjects: Subject[];
  selectedSubjects: string[];
  onToggleSelection: (subjectId: string) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (subjectId: string) => void;
  onEditSchedule: (subject: Subject) => void;
  onAddNew: () => void;
  classes: ClassGroup[];
  selectedClass: string;
  onClassChange: (classId: string) => void;
  onCopySchedule: (fromClassId: string, toClassId: string) => void;
  updateSubjectScheduleForClass?: (classId: string, subjectId: string, scheduleOverride: SubjectScheduleOverride) => void;
  getSubjectScheduleForClass?: (classId: string, subjectId: string, defaultSubject?: Subject) => SubjectScheduleOverride | null;
}

export const SubjectsInterface: React.FC<SubjectsInterfaceProps> = ({
  subjects,
  selectedSubjects,
  onToggleSelection,
  onEdit,
  onDelete,
  onEditSchedule,
  onAddNew,
  classes,
  selectedClass,
  onClassChange,
  onCopySchedule,
  updateSubjectScheduleForClass,
  getSubjectScheduleForClass
}) => {
  const [editingClassSchedule, setEditingClassSchedule] = useState<{subject: Subject, classGroup: ClassGroup} | null>(null);

  const currentClass = classes.find(cls => cls.id === selectedClass);

  const handleEditClassSchedule = (subject: Subject) => {
    if (currentClass) {
      setEditingClassSchedule({ subject, classGroup: currentClass });
    }
  };

  const handleSaveClassSchedule = (classId: string, subjectId: string, scheduleOverride: SubjectScheduleOverride) => {
    if (updateSubjectScheduleForClass) {
      updateSubjectScheduleForClass(classId, subjectId, scheduleOverride);
    }
    setEditingClassSchedule(null);
  };

  return (
    <div className="space-y-6">
      <ClassSelector
        classes={classes}
        selectedClass={selectedClass}
        onClassChange={onClassChange}
        onCopySchedule={onCopySchedule}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Gerenciar Disciplinas</h2>
          <Button className="medical-gradient" onClick={onAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Disciplina
          </Button>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">📢 Importante</h4>
          <p className="text-sm text-blue-800">
            As disciplinas são automaticamente adicionadas a todas as turmas do período selecionado. 
            Cada turma pode ter horários específicos para suas disciplinas usando o botão "Editar Horário da Turma".
          </p>
        </div>

        {currentClass && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">
              🎯 Editando: {currentClass.name} - {currentClass.period}º Período
            </h4>
            <p className="text-sm text-green-800">
              Use o botão "Editar Horário da Turma" para personalizar os horários desta turma específica.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => {
            const isSelected = selectedSubjects.includes(subject.id);
            const hasCustomSchedule = currentClass && getSubjectScheduleForClass && 
              getSubjectScheduleForClass(currentClass.id, subject.id, subject)?.hasCustomSchedule;

            return (
              <div key={subject.id} className="relative">
                <SubjectCard
                  subject={subject}
                  isSelected={isSelected}
                  onToggleSelection={onToggleSelection}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditSchedule(subject)}
                    title="Editar horário padrão da disciplina"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  {currentClass && isSelected && (
                    <Button
                      variant={hasCustomSchedule ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleEditClassSchedule(subject)}
                      title={`Editar horário específico para ${currentClass.name}`}
                      className={hasCustomSchedule ? "bg-green-600 hover:bg-green-700" : ""}
                    >
                      <Calendar className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {hasCustomSchedule && (
                  <div className="absolute top-1 left-1">
                    <div className="bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                      Custom
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {editingClassSchedule && getSubjectScheduleForClass && (
        <ClassSpecificScheduleEditor
          isOpen={true}
          onClose={() => setEditingClassSchedule(null)}
          subject={editingClassSchedule.subject}
          classGroup={editingClassSchedule.classGroup}
          onSave={handleSaveClassSchedule}
          existingSchedule={getSubjectScheduleForClass(
            editingClassSchedule.classGroup.id, 
            editingClassSchedule.subject.id, 
            editingClassSchedule.subject
          )}
        />
      )}
    </div>
  );
};
