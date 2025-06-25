
import React from 'react';
import { Subject } from '@/types';
import { SubjectCard } from '@/components/SubjectCard';
import { Button } from '@/components/ui/button';
import { Plus, FileDown, FileBarChart } from 'lucide-react';

interface SubjectListProps {
  subjects: Subject[];
  currentClassSubjects: string[];
  onToggleSubject: (subjectId: string) => void;
  onEdit: (subject: Subject) => void;
  onDelete: (subjectId: string) => void;
  onEditSchedule: (subject: Subject) => void;
  onAddNew: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
}

export const SubjectList: React.FC<SubjectListProps> = ({
  subjects,
  currentClassSubjects,
  onToggleSubject,
  onEdit,
  onDelete,
  onEditSchedule,
  onAddNew,
  onExportPDF,
  onExportCSV
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Disciplinas</h2>
        <div className="flex gap-2">
          <Button onClick={onExportPDF} variant="outline" size="sm">
            <FileDown className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button onClick={onExportCSV} variant="outline" size="sm">
            <FileBarChart className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Button onClick={onAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Disciplina
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map(subject => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            isSelected={currentClassSubjects.includes(subject.id)}
            onToggle={() => onToggleSubject(subject.id)}
            onEdit={() => onEdit(subject)}
            onDelete={() => onDelete(subject.id)}
            onEditSchedule={() => onEditSchedule(subject)}
          />
        ))}
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Nenhuma disciplina encontrada</p>
          <Button onClick={onAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar primeira disciplina
          </Button>
        </div>
      )}
    </div>
  );
};
