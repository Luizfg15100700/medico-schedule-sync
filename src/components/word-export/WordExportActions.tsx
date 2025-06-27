
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ClassGroup } from '@/types/class';

interface WordExportActionsProps {
  selectedSubjectsCount: number;
  currentClass?: ClassGroup;
  isButtonEnabled: boolean;
  onExport: () => void;
}

export const WordExportActions: React.FC<WordExportActionsProps> = ({
  selectedSubjectsCount,
  currentClass,
  isButtonEnabled,
  onExport
}) => {
  return (
    <div className="flex justify-between items-center pt-4">
      <div className="text-sm text-gray-600">
        {selectedSubjectsCount} disciplinas selecionadas
        {currentClass && ` • Turma: ${currentClass.name}`}
      </div>
      <Button 
        onClick={onExport}
        disabled={!isButtonEnabled}
        className="medical-gradient"
      >
        <Download className="w-4 h-4 mr-2" />
        Exportar para Word
      </Button>
    </div>
  );
};
