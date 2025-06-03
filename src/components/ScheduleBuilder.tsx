
import React, { useState } from 'react';
import { Subject, PERIODS } from '@/types';
import { ClassGroup } from '@/types/class';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Save } from 'lucide-react';

interface ScheduleBuilderProps {
  subjects: Subject[];
  classes: ClassGroup[];
  onCreateSchedule: (schedule: {
    name: string;
    periods: string[];
    selectedSubjects: { subjectId: string; classId: string }[];
  }) => void;
}

export const ScheduleBuilder: React.FC<ScheduleBuilderProps> = ({
  subjects,
  classes,
  onCreateSchedule
}) => {
  const [scheduleName, setScheduleName] = useState('');
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<{ subjectId: string; classId: string }[]>([]);

  const filteredSubjects = subjects.filter(subject => 
    selectedPeriods.length === 0 || selectedPeriods.includes(subject.period)
  );

  const filteredClasses = classes.filter(cls => 
    selectedPeriods.length === 0 || selectedPeriods.includes(cls.period)
  );

  const addPeriod = (period: string) => {
    if (!selectedPeriods.includes(period)) {
      setSelectedPeriods(prev => [...prev, period]);
    }
  };

  const removePeriod = (period: string) => {
    setSelectedPeriods(prev => prev.filter(p => p !== period));
    // Remove classes from removed period
    setSelectedClasses(prev => 
      prev.filter(classId => {
        const cls = classes.find(c => c.id === classId);
        return cls && cls.period !== period;
      })
    );
    // Remove subjects from removed period
    setSelectedSubjects(prev => 
      prev.filter(item => {
        const subject = subjects.find(s => s.id === item.subjectId);
        return subject && subject.period !== period;
      })
    );
  };

  const toggleClass = (classId: string) => {
    setSelectedClasses(prev => 
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const toggleSubjectForClass = (subjectId: string, classId: string) => {
    const itemKey = `${subjectId}-${classId}`;
    const existingIndex = selectedSubjects.findIndex(
      item => item.subjectId === subjectId && item.classId === classId
    );

    if (existingIndex >= 0) {
      setSelectedSubjects(prev => prev.filter((_, i) => i !== existingIndex));
    } else {
      setSelectedSubjects(prev => [...prev, { subjectId, classId }]);
    }
  };

  const handleSave = () => {
    if (scheduleName && selectedPeriods.length > 0 && selectedSubjects.length > 0) {
      onCreateSchedule({
        name: scheduleName,
        periods: selectedPeriods,
        selectedSubjects
      });
      // Reset form
      setScheduleName('');
      setSelectedPeriods([]);
      setSelectedClasses([]);
      setSelectedSubjects([]);
    }
  };

  const groupedClasses = filteredClasses.reduce((acc, cls) => {
    if (!acc[cls.period]) {
      acc[cls.period] = [];
    }
    acc[cls.period].push(cls);
    return acc;
  }, {} as Record<string, ClassGroup[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Criar Nova Grade Horária Multicurso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="scheduleName">Nome da Grade</Label>
            <Input
              id="scheduleName"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              placeholder="Ex: Grade Integrada 1º ao 3º Período"
            />
          </div>

          <div>
            <Label>Selecionar Períodos</Label>
            <div className="mt-2">
              <Select onValueChange={addPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Adicionar período" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PERIODS).map(([key, label]) => (
                    <SelectItem 
                      key={key} 
                      value={key}
                      disabled={selectedPeriods.includes(key)}
                    >
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedPeriods.map(period => (
                <Badge key={period} variant="secondary" className="flex items-center gap-1">
                  {PERIODS[period as keyof typeof PERIODS]}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-red-100"
                    onClick={() => removePeriod(period)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          {selectedPeriods.length > 0 && (
            <div>
              <Label>Selecionar Turmas</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2 max-h-48 overflow-y-auto">
                {Object.entries(groupedClasses).map(([period, periodClasses]) => (
                  <div key={period} className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">
                      {PERIODS[period as keyof typeof PERIODS]}
                    </h4>
                    {periodClasses.map(cls => (
                      <div key={cls.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={cls.id}
                          checked={selectedClasses.includes(cls.id)}
                          onCheckedChange={() => toggleClass(cls.id)}
                        />
                        <Label htmlFor={cls.id} className="text-sm">
                          {cls.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedClasses.length > 0 && (
            <div>
              <Label>Disciplinas e Turmas</Label>
              <div className="grid grid-cols-1 gap-4 mt-2 max-h-60 overflow-y-auto">
                {filteredSubjects.map(subject => (
                  <Card key={subject.id} className="p-3">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-sm">{subject.name}</h4>
                        <p className="text-xs text-gray-600">{subject.professor}</p>
                        <Badge className={`period-${subject.period} text-xs mt-1`}>
                          {PERIODS[subject.period]}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {selectedClasses
                        .filter(classId => {
                          const cls = classes.find(c => c.id === classId);
                          return cls && cls.period === subject.period;
                        })
                        .map(classId => {
                          const cls = classes.find(c => c.id === classId);
                          const isSelected = selectedSubjects.some(
                            item => item.subjectId === subject.id && item.classId === classId
                          );
                          return (
                            <div key={classId} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${subject.id}-${classId}`}
                                checked={isSelected}
                                onCheckedChange={() => toggleSubjectForClass(subject.id, classId)}
                              />
                              <Label htmlFor={`${subject.id}-${classId}`} className="text-xs">
                                {cls?.name}
                              </Label>
                            </div>
                          );
                        })}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              {selectedSubjects.length} disciplinas/turmas selecionadas
            </div>
            <Button 
              onClick={handleSave}
              disabled={!scheduleName || selectedPeriods.length === 0 || selectedSubjects.length === 0}
              className="medical-gradient"
            >
              <Save className="w-4 h-4 mr-2" />
              Criar Grade
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
