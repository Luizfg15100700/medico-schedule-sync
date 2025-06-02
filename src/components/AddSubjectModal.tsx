
import React, { useState, useEffect } from 'react';
import { Subject, ClassSchedule, PERIODS, DAYS_OF_WEEK, TIME_SLOTS } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Omit<Subject, 'id'>) => void;
  subject?: Subject;
}

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subject
}) => {
  const [formData, setFormData] = useState({
    name: '',
    period: '1' as Subject['period'],
    professor: '',
    location: '',
    totalWorkload: 0,
    theoreticalClasses: [] as Omit<ClassSchedule, 'id' | 'subjectId'>[],
    practicalClasses: [] as Omit<ClassSchedule, 'id' | 'subjectId'>[]
  });

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name,
        period: subject.period,
        professor: subject.professor,
        location: subject.location,
        totalWorkload: subject.totalWorkload,
        theoreticalClasses: subject.theoreticalClasses.map(c => ({
          type: c.type,
          dayOfWeek: c.dayOfWeek,
          startTime: c.startTime,
          endTime: c.endTime,
          location: c.location,
          workload: c.workload
        })),
        practicalClasses: subject.practicalClasses.map(c => ({
          type: c.type,
          dayOfWeek: c.dayOfWeek,
          startTime: c.startTime,
          endTime: c.endTime,
          location: c.location,
          workload: c.workload
        }))
      });
    } else {
      setFormData({
        name: '',
        period: '1',
        professor: '',
        location: '',
        totalWorkload: 0,
        theoreticalClasses: [],
        practicalClasses: []
      });
    }
  }, [subject, isOpen]);

  const addClass = (type: 'theoretical' | 'practical') => {
    const newClass = {
      type: type as 'theoretical' | 'practical',
      dayOfWeek: 'monday' as const,
      startTime: '08:00',
      endTime: '10:00',
      location: '',
      workload: 2
    };

    if (type === 'theoretical') {
      setFormData(prev => ({
        ...prev,
        theoreticalClasses: [...prev.theoreticalClasses, newClass]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        practicalClasses: [...prev.practicalClasses, newClass]
      }));
    }
  };

  const removeClass = (type: 'theoretical' | 'practical', index: number) => {
    if (type === 'theoretical') {
      setFormData(prev => ({
        ...prev,
        theoreticalClasses: prev.theoreticalClasses.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        practicalClasses: prev.practicalClasses.filter((_, i) => i !== index)
      }));
    }
  };

  const updateClass = (type: 'theoretical' | 'practical', index: number, field: string, value: any) => {
    if (type === 'theoretical') {
      setFormData(prev => ({
        ...prev,
        theoreticalClasses: prev.theoreticalClasses.map((cls, i) => 
          i === index ? { ...cls, [field]: value } : cls
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        practicalClasses: prev.practicalClasses.map((cls, i) => 
          i === index ? { ...cls, [field]: value } : cls
        )
      }));
    }
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {subject ? 'Editar Disciplina' : 'Nova Disciplina'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome da Disciplina</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Anatomia Humana I"
              />
            </div>
            <div>
              <Label htmlFor="period">Período</Label>
              <Select value={formData.period} onValueChange={(value) => setFormData(prev => ({ ...prev, period: value as Subject['period'] }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PERIODS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="professor">Professor</Label>
              <Input
                id="professor"
                value={formData.professor}
                onChange={(e) => setFormData(prev => ({ ...prev, professor: e.target.value }))}
                placeholder="Ex: Dr. João Silva"
              />
            </div>
            <div>
              <Label htmlFor="location">Local Principal</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: Laboratório de Anatomia"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="totalWorkload">Carga Horária Total</Label>
            <Input
              id="totalWorkload"
              type="number"
              value={formData.totalWorkload}
              onChange={(e) => setFormData(prev => ({ ...prev, totalWorkload: Number(e.target.value) }))}
              placeholder="Ex: 120"
            />
          </div>

          {/* Theoretical Classes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Aulas Teóricas</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addClass('theoretical')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.theoreticalClasses.map((cls, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 items-end">
                  <div>
                    <Label>Dia da Semana</Label>
                    <Select value={cls.dayOfWeek} onValueChange={(value) => updateClass('theoretical', index, 'dayOfWeek', value)}>
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
                    <Select value={cls.startTime} onValueChange={(value) => updateClass('theoretical', index, 'startTime', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fim</Label>
                    <Select value={cls.endTime} onValueChange={(value) => updateClass('theoretical', index, 'endTime', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Local</Label>
                    <Input
                      value={cls.location}
                      onChange={(e) => updateClass('theoretical', index, 'location', e.target.value)}
                      placeholder="Sala"
                    />
                  </div>
                  <div>
                    <Label>Carga Horária</Label>
                    <Input
                      type="number"
                      value={cls.workload}
                      onChange={(e) => updateClass('theoretical', index, 'workload', Number(e.target.value))}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeClass('theoretical', index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Practical Classes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Aulas Práticas</CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addClass('practical')}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.practicalClasses.map((cls, index) => (
                <div key={index} className="grid grid-cols-6 gap-2 items-end">
                  <div>
                    <Label>Dia da Semana</Label>
                    <Select value={cls.dayOfWeek} onValueChange={(value) => updateClass('practical', index, 'dayOfWeek', value)}>
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
                    <Select value={cls.startTime} onValueChange={(value) => updateClass('practical', index, 'startTime', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fim</Label>
                    <Select value={cls.endTime} onValueChange={(value) => updateClass('practical', index, 'endTime', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_SLOTS.map(time => (
                          <SelectItem key={time} value={time}>{time}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Local</Label>
                    <Input
                      value={cls.location}
                      onChange={(e) => updateClass('practical', index, 'location', e.target.value)}
                      placeholder="Laboratório"
                    />
                  </div>
                  <div>
                    <Label>Carga Horária</Label>
                    <Input
                      type="number"
                      value={cls.workload}
                      onChange={(e) => updateClass('practical', index, 'workload', Number(e.target.value))}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeClass('practical', index)}
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
              {subject ? 'Atualizar' : 'Salvar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
