
import React, { useState } from 'react';
import { Subject, PERIODS } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Save } from 'lucide-react';

interface ScheduleBuilderProps {
  subjects: Subject[];
  onCreateSchedule: (schedule: {
    name: string;
    periods: string[];
    selectedSubjects: string[];
  }) => void;
}

export const ScheduleBuilder: React.FC<ScheduleBuilderProps> = ({
  subjects,
  onCreateSchedule
}) => {
  const [scheduleName, setScheduleName] = useState('');
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const filteredSubjects = subjects.filter(subject => 
    selectedPeriods.length === 0 || selectedPeriods.includes(subject.period)
  );

  const addPeriod = (period: string) => {
    if (!selectedPeriods.includes(period)) {
      setSelectedPeriods(prev => [...prev, period]);
    }
  };

  const removePeriod = (period: string) => {
    setSelectedPeriods(prev => prev.filter(p => p !== period));
    // Remove subjects from removed period
    setSelectedSubjects(prev => 
      prev.filter(subjectId => {
        const subject = subjects.find(s => s.id === subjectId);
        return subject && subject.period !== period;
      })
    );
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
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
      setSelectedSubjects([]);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Criar Nova Grade Horária</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="scheduleName">Nome da Grade</Label>
            <Input
              id="scheduleName"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              placeholder="Ex: Grade 1º ao 3º Período"
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
              <Label>Disciplinas Disponíveis</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 max-h-60 overflow-y-auto">
                {filteredSubjects.map(subject => (
                  <div
                    key={subject.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedSubjects.includes(subject.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleSubject(subject.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{subject.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{subject.professor}</p>
                        <Badge className={`period-${subject.period} text-xs mt-1`}>
                          {PERIODS[subject.period]}
                        </Badge>
                      </div>
                      {selectedSubjects.includes(subject.id) && (
                        <div className="ml-2">
                          <Plus className="h-4 w-4 text-blue-600 rotate-45" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              {selectedSubjects.length} disciplinas selecionadas
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
