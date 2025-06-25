
import React from 'react';
import { Subject } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Edit, Trash2, Clock, Plus, FileDown, Download } from 'lucide-react';

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
          <Button onClick={onAddNew} className="medical-gradient">
            <Plus className="w-4 h-4 mr-2" />
            Nova Disciplina
          </Button>
          <Button variant="outline" onClick={onExportPDF}>
            <FileDown className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" onClick={onExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map(subject => (
          <Card key={subject.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {subject.name}
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">{subject.period}º Período</Badge>
                <Badge variant={currentClassSubjects.includes(subject.id) ? "default" : "secondary"}>
                  {currentClassSubjects.includes(subject.id) ? "Ativa" : "Inativa"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600">
                <p><strong>Professor:</strong> {subject.professor}</p>
                <p><strong>Local:</strong> {subject.location}</p>
                <p><strong>Carga Horária:</strong> {subject.totalWorkload}h</p>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={currentClassSubjects.includes(subject.id) ? "destructive" : "default"}
                  onClick={() => onToggleSubject(subject.id)}
                  className="flex-1"
                >
                  {currentClassSubjects.includes(subject.id) ? "Remover" : "Adicionar"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => onEdit(subject)}>
                  <Edit className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onEditSchedule(subject)}>
                  <Clock className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="outline" onClick={() => onDelete(subject.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
