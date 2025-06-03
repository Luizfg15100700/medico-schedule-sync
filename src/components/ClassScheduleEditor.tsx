
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClassSchedule, Subject, DAYS_OF_WEEK } from '@/types';
import { Save, Plus, Trash2 } from 'lucide-react';

interface ClassScheduleEditorProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
  onSave: (updatedSubject: Subject) => void;
}

export const ClassScheduleEditor: React.FC<ClassScheduleEditorProps> = ({
  isOpen,
  onClose,
  subject,
  onSave
}) => {
  const [editedSubject, setEditedSubject] = useState<Subject>(subject);

  const addSchedule = (type: 'theoretical' | 'practical') => {
    const newSchedule: ClassSchedule = {
      id: `${Date.now()}-${type}`,
      subjectId: subject.id,
      type,
      dayOfWeek: 'monday',
      startTime: '08:00',
      endTime: '10:00',
      location: '',
      workload: 2
    };

    if (type === 'theoretical') {
      setEditedSubject(prev => ({
        ...prev,
        theoreticalClasses: [...prev.theoreticalClasses, newSchedule]
      }));
    } else {
      setEditedSubject(prev => ({
        ...prev,
        practicalClasses: [...prev.practicalClasses, newSchedule]
      }));
    }
  };

  const removeSchedule = (type: 'theoretical' | 'practical', index: number) => {
    if (type === 'theoretical') {
      setEditedSubject(prev => ({
        ...prev,
        theoreticalClasses: prev.theoreticalClasses.filter((_, i) => i !== index)
      }));
    } else {
      setEditedSubject(prev => ({
        ...prev,
        practicalClasses: prev.practicalClasses.filter((_, i) => i !== index)
      }));
    }
  };

  const updateSchedule = (type: 'theoretical' | 'practical', index: number, field: keyof ClassSchedule, value: any) => {
    if (type === 'theoretical') {
      setEditedSubject(prev => ({
        ...prev,
        theoreticalClasses: prev.theoreticalClasses.map((schedule, i) =>
          i === index ? { ...schedule, [field]: value } : schedule
        )
      }));
    } else {
      setEditedSubject(prev => ({
        ...prev,
        practicalClasses: prev.practicalClasses.map((schedule, i) =>
          i === index ? { ...schedule, [field]: value } : schedule
        )
      }));
    }
  };

  const handleSave = () => {
    onSave(editedSubject);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Horários - {subject.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Aulas Teóricas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Aulas Teóricas</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSchedule('theoretical')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editedSubject.theoreticalClasses.map((schedule, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 items-end p-3 border rounded">
                  <div>
                    <Label>Dia da Semana</Label>
                    <Select 
                      value={schedule.dayOfWeek} 
                      onValueChange={(value) => updateSchedule('theoretical', index, 'dayOfWeek', value)}
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
                    />
                  </div>
                  <div>
                    <Label>Término</Label>
                    <Input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => updateSchedule('theoretical', index, 'endTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Local</Label>
                    <Input
                      value={schedule.location}
                      onChange={(e) => updateSchedule('theoretical', index, 'location', e.target.value)}
                      placeholder="Sala"
                    />
                  </div>
                  <div>
                    <Label>Carga Horária</Label>
                    <Input
                      type="number"
                      value={schedule.workload}
                      onChange={(e) => updateSchedule('theoretical', index, 'workload', Number(e.target.value))}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSchedule('theoretical', index)}
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
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {editedSubject.practicalClasses.map((schedule, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 items-end p-3 border rounded">
                  <div>
                    <Label>Dia da Semana</Label>
                    <Select 
                      value={schedule.dayOfWeek} 
                      onValueChange={(value) => updateSchedule('practical', index, 'dayOfWeek', value)}
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
                    />
                  </div>
                  <div>
                    <Label>Término</Label>
                    <Input
                      type="time"
                      value={schedule.endTime}
                      onChange={(e) => updateSchedule('practical', index, 'endTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Local</Label>
                    <Input
                      value={schedule.location}
                      onChange={(e) => updateSchedule('practical', index, 'location', e.target.value)}
                      placeholder="Laboratório"
                    />
                  </div>
                  <div>
                    <Label>Carga Horária</Label>
                    <Input
                      type="number"
                      value={schedule.workload}
                      onChange={(e) => updateSchedule('practical', index, 'workload', Number(e.target.value))}
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSchedule('practical', index)}
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
              Salvar Alterações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
