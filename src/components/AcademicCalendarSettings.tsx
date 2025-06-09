
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Settings, Save, RefreshCw, Download, Upload, AlertTriangle } from 'lucide-react';

interface AcademicCalendarSettingsProps {
  onClose: () => void;
}

export const AcademicCalendarSettings: React.FC<AcademicCalendarSettingsProps> = ({ onClose }) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    defaultSemesterDuration: 120,
    autoStatusUpdate: true,
    allowOverlappingPeriods: false,
    requireEnrollmentDates: true,
    requireExamWeekDates: false,
    emailNotifications: true,
    advancedValidation: true
  });

  const handleSaveSettings = () => {
    // Salvar configurações no localStorage ou backend
    localStorage.setItem('academicCalendarSettings', JSON.stringify(settings));
    
    toast({
      title: "Configurações salvas",
      description: "As configurações do calendário acadêmico foram atualizadas.",
    });
    
    onClose();
  };

  const handleExportCalendar = () => {
    toast({
      title: "Exportação iniciada",
      description: "O calendário acadêmico está sendo exportado...",
    });
  };

  const handleImportCalendar = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        toast({
          title: "Importação iniciada",
          description: `Importando dados de ${file.name}...`,
        });
      }
    };
    input.click();
  };

  const handleResetToDefaults = () => {
    setSettings({
      defaultSemesterDuration: 120,
      autoStatusUpdate: true,
      allowOverlappingPeriods: false,
      requireEnrollmentDates: true,
      requireExamWeekDates: false,
      emailNotifications: true,
      advancedValidation: true
    });
    
    toast({
      title: "Configurações resetadas",
      description: "As configurações foram restauradas para os valores padrão.",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-600" />
              <CardTitle>Configurações do Calendário Acadêmico</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configurações Gerais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configurações Gerais</h3>
            
            <div className="space-y-2">
              <Label htmlFor="semesterDuration">Duração padrão do semestre (dias)</Label>
              <Input
                id="semesterDuration"
                type="number"
                value={settings.defaultSemesterDuration}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  defaultSemesterDuration: parseInt(e.target.value) || 120 
                }))}
                min={90}
                max={180}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoStatus">Atualização automática de status</Label>
                <p className="text-sm text-gray-600">Atualiza automaticamente o status dos períodos baseado nas datas</p>
              </div>
              <Switch
                id="autoStatus"
                checked={settings.autoStatusUpdate}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoStatusUpdate: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allowOverlap">Permitir períodos sobrepostos</Label>
                <p className="text-sm text-gray-600">Permite criar períodos com datas sobrepostas</p>
              </div>
              <Switch
                id="allowOverlap"
                checked={settings.allowOverlappingPeriods}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allowOverlappingPeriods: checked }))}
              />
            </div>
          </div>

          {/* Validações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Validações</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireEnrollment">Exigir datas de matrícula</Label>
                <p className="text-sm text-gray-600">Torna obrigatório o preenchimento das datas de matrícula</p>
              </div>
              <Switch
                id="requireEnrollment"
                checked={settings.requireEnrollmentDates}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireEnrollmentDates: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="requireExamWeek">Exigir semana de provas</Label>
                <p className="text-sm text-gray-600">Torna obrigatório o preenchimento da semana de provas</p>
              </div>
              <Switch
                id="requireExamWeek"
                checked={settings.requireExamWeekDates}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireExamWeekDates: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="advancedValidation">Validação avançada</Label>
                <p className="text-sm text-gray-600">Ativa validações avançadas de consistência</p>
              </div>
              <Switch
                id="advancedValidation"
                checked={settings.advancedValidation}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, advancedValidation: checked }))}
              />
            </div>
          </div>

          {/* Notificações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Notificações</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailNotifications">Notificações por email</Label>
                <p className="text-sm text-gray-600">Receber notificações sobre alterações no calendário</p>
              </div>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
          </div>

          {/* Importação/Exportação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" onClick={handleExportCalendar} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar Calendário
              </Button>
              
              <Button variant="outline" onClick={handleImportCalendar} className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Importar Calendário
              </Button>
            </div>
          </div>

          {/* Status das Configurações */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status</h3>
            
            <div className="flex flex-wrap gap-2">
              <Badge variant={settings.autoStatusUpdate ? "default" : "secondary"}>
                Auto Status: {settings.autoStatusUpdate ? "Ativo" : "Inativo"}
              </Badge>
              <Badge variant={settings.advancedValidation ? "default" : "secondary"}>
                Validação Avançada: {settings.advancedValidation ? "Ativa" : "Inativa"}
              </Badge>
              <Badge variant={settings.emailNotifications ? "default" : "secondary"}>
                Email: {settings.emailNotifications ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>

          {/* Ações */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleResetToDefaults} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Restaurar Padrões
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSaveSettings} className="medical-gradient">
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
