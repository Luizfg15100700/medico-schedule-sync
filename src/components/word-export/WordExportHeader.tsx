
import React from 'react';
import { FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const WordExportHeader: React.FC = () => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <FileText className="w-5 h-5" />
        Criador de Grade para Word
      </CardTitle>
      <p className="text-sm text-gray-600">
        Monte sua grade horária e exporte diretamente para um documento Word (.docx)
      </p>
    </CardHeader>
  );
};
