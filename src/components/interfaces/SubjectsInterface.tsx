
import React from 'react';
import { SubjectCard } from '@/components/SubjectCard';
import { ClassSelector } from '@/components/ClassSelector';
import { Button } from '@/components/ui/button';
import { Plus, Edit } from 'lucide-react';
import { Subject } from '@/types';
import { ClassGroup } from '@/types/class';

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
  onCopySchedule
}) => {
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
            Você pode editar os horários individualmente para cada turma usando o botão de editar horário.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map(subject => (
            <div key={subject.id} className="relative">
              <SubjectCard
                subject={subject}
                isSelected={selectedSubjects.includes(subject.id)}
                onToggleSelection={onToggleSelection}
                onEdit={onEdit}
                onDelete={onDelete}
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => onEditSchedule(subject)}
              >
                <Edit className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
