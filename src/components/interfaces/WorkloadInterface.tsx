
import React, { useState } from 'react';
import { WorkloadSummary } from '@/components/WorkloadSummary';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Subject, PERIODS } from '@/types';
import { ClassGroup } from '@/types/class';

interface WorkloadInterfaceProps {
  subjects: Subject[];
  selectedSubjects: string[];
  classes: ClassGroup[];
}

export const WorkloadInterface: React.FC<WorkloadInterfaceProps> = ({
  subjects,
  selectedSubjects,
  classes
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1');
  const [selectedClass, setSelectedClass] = useState<string>('');

  // Filtrar turmas por período selecionado
  const availableClasses = classes.filter(cls => cls.period === selectedPeriod);
  
  // Se não há turma selecionada, usar a primeira disponível
  const currentClass = selectedClass || (availableClasses.length > 0 ? availableClasses[0].id : '');
  
  // Filtrar disciplinas por período e turma
  const periodSubjects = subjects.filter(subject => subject.period === selectedPeriod);
  const classGroup = classes.find(cls => cls.id === currentClass);
  const classSubjects = classGroup ? classGroup.subjects : [];
  
  // Filtrar apenas as disciplinas que estão na turma selecionada
  const filteredSelectedSubjects = periodSubjects
    .filter(subject => classSubjects.includes(subject.id))
    .map(subject => subject.id);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Análise de Carga Horária</h2>
      
      {/* Seletores de Período e Turma */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div>
          <Label htmlFor="period-select">Período</Label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger id="period-select">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PERIODS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="class-select">Turma</Label>
          <Select 
            value={currentClass} 
            onValueChange={setSelectedClass}
            disabled={availableClasses.length === 0}
          >
            <SelectTrigger id="class-select">
              <SelectValue placeholder="Selecione a turma" />
            </SelectTrigger>
            <SelectContent>
              {availableClasses.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {availableClasses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhuma turma encontrada para o período selecionado.
        </div>
      ) : (
        <>
          <div className="text-sm text-gray-600">
            Exibindo carga horária para: {PERIODS[selectedPeriod as keyof typeof PERIODS]} - {classGroup?.name}
          </div>
          
          <WorkloadSummary 
            subjects={periodSubjects} 
            selectedSubjects={filteredSelectedSubjects} 
          />
        </>
      )}
    </div>
  );
};
