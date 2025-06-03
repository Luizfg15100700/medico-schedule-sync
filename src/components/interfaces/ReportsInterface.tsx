
import React from 'react';
import { Button } from '@/components/ui/button';

interface ReportsInterfaceProps {
  onExportPDF: () => void;
  onExportCSV: () => void;
}

export const ReportsInterface: React.FC<ReportsInterfaceProps> = ({
  onExportPDF,
  onExportCSV
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Relatórios e Estatísticas</h2>
      <div className="text-center py-12">
        <p className="text-gray-600 mb-6">
          Visualize análises detalhadas do seu aproveitamento acadêmico
        </p>
        <div className="flex justify-center gap-4">
          <Button className="medical-gradient" onClick={onExportPDF}>
            Gerar Relatório HTML
          </Button>
          <Button variant="outline" onClick={onExportCSV}>
            Gerar Relatório CSV
          </Button>
        </div>
      </div>
    </div>
  );
};
