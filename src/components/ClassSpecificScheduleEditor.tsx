
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Subject, DAYS_OF_WEEK } from '@/types';
import { ClassGroup, SubjectScheduleOverride, ClassScheduleOverride } from '@/types/class';
import { Save, Plus, Trash2, RotateCcw } from 'lucide-react';

interface ClassSpecificScheduleEditorProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
  classGroup: ClassGroup;
  onSave: (classId: string, subjectId: string, scheduleOverride: SubjectScheduleOverride) => void;
  existingSchedule?: SubjectScheduleOverride | null;
}

export const ClassSpecificScheduleEditor: React.FC<ClassSpecificScheduleEditorProps> = ({
  isOpen,
  onClose,
  subject,
  classGroup,
  onSave,
  existingSchedule
}) => {
  const [scheduleData, setScheduleData] = useState<SubjectScheduleOverride>({
    subjectId: subject.id,
    classId: classGroup.id,
    theoreticalClasses: [],
    practicalClasses: [],
    hasCustomSchedule: false
  });

  useEffect(() => {
    if (existingSchedule) {
      setScheduleData(existingSchedule);
    } else {
      // Inicializar com os horários padrão da disciplina
      setScheduleData({
        subjectId: subject.id,
        classId: classGroup.id,
        theoreticalClasses: subject.theoreticalClasses.map(tc => ({
          ...tc,
          classId: classGroup.id,
          id: `${tc.id}-${classGroup.id}`
        })),
        practicalClasses: subject.practicalClasses.map(pc => ({
          ...pc,
          classId: classGroup.id,
          id: `${pc.id}-${classGroup.id}`
        })),
        hasCustomSchedule: false
      });
    }
  }, [subject, classGroup, existingSchedule]);

  const resetToDefault = () => {
    setScheduleData({
      subjectId: subject.id,
      classId: classGroup.id,
      theoreticalClasses: subject.theoreticalClasses.map(tc => ({
        ...tc,
        classId: classGroup.id,
        id: `${tc.id}-${classGroup.id}`
      })),
      practicalClasses: subject.practicalClasses.map(pc => ({
        ...pc,
        classId: classGroup.id,
        id: `${pc.id}-${classGroup.id}`
      })),
      hasCustomSchedule: false
    });
  };

  const addSchedule = (type: 'theoretical' | 'practical') => {
    const newSchedule: ClassScheduleOverride = {
      id: `${Date.now()}-${type}-${classGroup.id}`,
      subjectId: subject.id,
      classId: classGroup.id,
      type,
      dayOfWeek: 'monday',
      startTime: '08:00',
      endTime: '10:00',
      location: '',
      workload: 2
    };

    if (type === 'theoretical') {
      setScheduleData(prev => ({
        ...prev,
        theoreticalClasses: [...prev.theoreticalClasses, newSchedule],
        hasCustomSchedule: true
      }));
    } else {
      setScheduleData(prev => ({
        ...prev,
        practicalClasses: [...prev.practicalClasses, newSchedule],
        hasCustomSchedule: true
      }));
    }
  };

  const removeSchedule = (type: 'theoretical' | 'practical', index: number) => {
    if (type === 'theoretical') {
      setScheduleData(prev => ({
        ...prev,
        theoreticalClasses: prev.theoreticalClasses.filter((_, i) => i !== index),
        hasCustomSchedule: true
      }));
    } else {
      setScheduleData(prev => ({
        ...prev,
        practicalClasses: prev.practicalClasses.filter((_, i) => i !== index),
        hasCustomSchedule: true
      }));
    }
  };

  const updateSchedule = (type: 'theoretical' | 'practical', index: number, field: keyof ClassScheduleOverride, value: any) => {
    if (type === 'theoretical') {
      setScheduleData(prev => ({
        ...prev,
        theoreticalClasses: prev.theoreticalClasses.map((schedule, i) =>
          i === index ? { ...schedule, [field]: value } : schedule
        ),
        hasCustomSchedule: true
      }));
    } else {
      setScheduleData(prev => ({
        ...prev,
        practicalClasses: prev.practicalClasses.map((schedule, i) =>
          i === index ? { ...schedule, [field]: value } : schedule
        ),
        hasCustomSchedule: true
      }));
    }
  };

  const handleSave = () => {
    onSave(classGroup.id, subject.id, scheduleData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar Horários - {subject.name} | {classGroup.name} ({classGroup.period}º Período)
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Switch
                checked={scheduleData.hasCustomSchedule}
                onCheckedChange={(checked) => 
                  setScheduleData(prev => ({ ...prev, hasCustomSchedule: checked }))
                }
              />
              <div>
                <p className="font-medium">Usar horário customizado para esta turma</p>
                <p className="text-sm text-gray-600">
                  {scheduleData.hasCustomSchedule 
                    ? 'Esta turma terá horários específicos diferentes do padrão da disciplina'
                    : 'Esta turma usará os horários padrão da disciplina'
                  }
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={resetToDefault}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Restaurar Padrão
            </Button>
          </div>

          {/* Aulas Teóricas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Aulas Teóricas</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSchedule('theoretical')}
                  disabled={!scheduleData.hasCustomSchedule}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduleData.theoreticalClasses.map((schedule, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 items-end p-3 border rounded">
                  <div>
                    <Label>Dia da Semana</Label>
                    <Select 
                      value={schedule.dayOfWeek} 
                      onValueChange={(value) => updateSchedule('theoretical', index, 'dayOfWeek', value)}
                      disabled={!scheduleData.hasCustomSchedule}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DAYS_OF_WEEK).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Início</Label>
                    <Input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => updateSchedule('theoretical', index, 'startTime', e.target.value)}
                      disabled={!scheduleData.hasCustomSchedule}
                    />
                  </div>
                  <div>
                    <Label>Término</Label>
                    <Input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => updateSchedule('theoretical', index, 'endTime', e.target.value)}
                      disabled={!scheduleData.hasCustomSchedule}
                    />
                  </div>
                  <div>
                    <Label>Local</Label>
                    <Input
                      value={schedule.location}
                      onChange={(e) => updateSchedule('theoretical', index, 'location', e.target.value)}
                      placeholder="Sala"
                      disabled={!scheduleData.hasCustomSchedule}
                    />
                  </div>
                  <div>
                    <Label>Carga Horária</Label>
                    <Input
                      type="number"
                      value={schedule.workload}
                      onChange={(e) => updateSchedule('theoretical', index, 'workload', Number(e.target.value))}
                      disabled={!scheduleData.hasCustomSchedule}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSchedule('theoretical', index)}
                    disabled={!scheduleData.hasCustomSchedule}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Aulas Práticas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Aulas Práticas</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSchedule('practical')}
                  disabled={!scheduleData.hasCustomSchedule}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduleData.practicalClasses.map((schedule, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 items-end p-3 border rounded">
                  <div>
                    <Label>Dia da Semana</Label>
                    <Select 
                      value={schedule.dayOfWeek} 
                      onValueChange={(value) => updateSchedule('practical', index, 'dayOfWeek', value)}
                      disabled={!scheduleData.hasCustomSchedule}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(DAYS_OF_WEEK).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Início</Label>
                    <Input
                      type="time"
                      value={schedule.startTime}
                      onChange={(e) => updateSchedule('practical', index, 'startTime', e.target.value)}
                      disabled={!scheduleData.hasCustomSchedule}
                    />
                  </div>
                  <div>
                    <Label>Término</Label>
                    <Input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => updateSchedule('practical', index, 'endTime', e.target.value)}
                      disabled={!scheduleData.hasCustomSchedule}
                    />
                  </div>
                  <div>
                    <Label>Local</Label>
                    <Input
                      value={schedule.location}
                      onChange={(e) => updateSchedule('practical', index, 'location', e.target.value)}
                      placeholder="Laboratório"
                      disabled={!scheduleData.hasCustomSchedule}
                    />
                  </div>
                  <div>
                    <Label>Carga Horária</Label>
                    <Input
                      type="number"
                      value={schedule.workload}
                      onChange={(e) => updateSchedule('practical', index, 'workload', Number(e.target.value))}
                      disabled={!scheduleData.hasCustomSchedule}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSchedule('practical', index)}
                    disabled={!scheduleData.hasCustomSchedule}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="medical-gradient">
              <Save className="w-4 h-4 mr-2" />
              Salvar Horários
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
