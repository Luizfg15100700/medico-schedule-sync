
import React, { useState } from 'react';
import { Subject, PERIODS } from '@/types';
import { ClassGroup } from '@/types/class';
import { ConflictAnalysisResult, ScheduleSubjectAssignment } from '@/types/academic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdvancedScheduleBuilder } from '@/hooks/useAdvancedScheduleBuilder';
import { useAcademicCalendar } from '@/hooks/useAcademicCalendar';
import { Save, Download, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface AdvancedScheduleBuilderProps {
  subjects: Subject[];
  classes: ClassGroup[];
  onSaveSchedule: (schedule: {
    name: string;
    academicPeriodId: string;
    assignments: ScheduleSubjectAssignment[];
  }) => void;
}

export const AdvancedScheduleBuilder: React.FC<AdvancedScheduleBuilderProps> = ({
  subjects,
  classes,
  onSaveSchedule
}) => {
  const { getActiveAcademicPeriod } = useAcademicCalendar();
  const {
    selectedSubjects,
    addSubjectToSchedule,
    removeSubjectFromSchedule,
    acceptConflict,
    clearSchedule,
    calculateConflicts,
    CONFLICT_THRESHOLD
  } = useAdvancedScheduleBuilder();

  const [scheduleName, setScheduleName] = useState('');
  const [conflicts, setConflicts] = useState<ConflictAnalysisResult[]>([]);

  const activePeriod = getActiveAcademicPeriod();

  const handleAddSubject = (subjectId: string, classId: string, period: string) => {
    const assignment: ScheduleSubjectAssignment = {
      subjectId,
      classId,
      period,
      isConflictAccepted: false
    };

    addSubjectToSchedule(assignment);
    
    // Recalcular conflitos
    const newConflicts = calculateConflicts(subjects, [...selectedSubjects, assignment]);
    setConflicts(newConflicts);
  };

  const handleRemoveSubject = (subjectId: string, classId: string) => {
    removeSubjectFromSchedule(subjectId, classId);
    
    // Recalcular conflitos
    const newAssignments = selectedSubjects.filter(
      a => !(a.subjectId === subjectId && a.classId === classId)
    );
    const newConflicts = calculateConflicts(subjects, newAssignments);
    setConflicts(newConflicts);
  };

  const handleAcceptConflict = (subjectId: string, classId: string) => {
    acceptConflict(subjectId, classId);
  };

  const handleSave = () => {
    if (!scheduleName || !activePeriod) return;

    // Verificar se todos os conflitos foram aceitos
    const unacceptedConflicts = conflicts.filter(
      conflict => !conflict.isWithinThreshold && 
      conflict.conflictingSubjects.some(subjectId => {
        const assignment = selectedSubjects.find(a => a.subjectId === subjectId);
        return assignment && !assignment.isConflictAccepted;
      })
    );

    if (unacceptedConflicts.length > 0) {
      alert('Há conflitos não aceitos que excedem 25% da carga horária. Aceite-os antes de salvar.');
      return;
    }

    onSaveSchedule({
      name: scheduleName,
      academicPeriodId: activePeriod.id,
      assignments: selectedSubjects
    });

    // Limpar formulário
    setScheduleName('');
    clearSchedule();
    setConflicts([]);
  };

  const exportSchedule = () => {
    const scheduleData = {
      name: scheduleName,
      period: activePeriod?.name,
      subjects: selectedSubjects.map(assignment => {
        const subject = subjects.find(s => s.id === assignment.subjectId);
        const classGroup = classes.find(c => c.id === assignment.classId);
        
        return {
          subject: subject?.name,
          class: classGroup?.name,
          period: assignment.period,
          schedule: subject ? [...subject.theoreticalClasses, ...subject.practicalClasses] : []
        };
      })
    };

    const dataStr = JSON.stringify(scheduleData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `grade-${scheduleName.replace(/\s+/g, '-').toLowerCase()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  // Agrupar disciplinas por período
  const subjectsByPeriod = subjects.reduce((acc, subject) => {
    if (!acc[subject.period]) {
      acc[subject.period] = [];
    }
    acc[subject.period].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);

  const classesByPeriod = classes.reduce((acc, cls) => {
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
          <CardTitle>Criador Avançado de Grades</CardTitle>
          {activePeriod && (
            <p className="text-sm text-gray-600">
              Período Ativo: {activePeriod.name} ({activePeriod.startDate} - {activePeriod.endDate})
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="scheduleName">Nome da Grade</Label>
            <Input
              id="scheduleName"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
              placeholder="Ex: Grade Integrada Medicina 2024.1"
            />
          </div>

          {/* Conflitos */}
          {conflicts.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Análise de Conflitos</h3>
              {conflicts.map((conflict, index) => (
                <Alert key={index} className={conflict.isWithinThreshold ? 'border-yellow-300' : 'border-red-300'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">
                        Conflito de horário detectado ({(conflict.overlapPercentage * 100).toFixed(1)}% de sobreposição)
                      </p>
                      {conflict.conflictDetails.map((detail, i) => (
                        <div key={i} className="text-sm">
                          <p>{detail.subject1} ↔ {detail.subject2}</p>
                          <p className="text-gray-600">
                            Sobreposição: {detail.overlapHours}h ({(detail.percentage * 100).toFixed(1)}% da carga horária)
                          </p>
                        </div>
                      ))}
                      {!conflict.isWithinThreshold && (
                        <div className="flex gap-2 mt-2">
                          <Badge variant="destructive">Excede limite de 25%</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              conflict.conflictingSubjects.forEach(subjectId => {
                                const assignment = selectedSubjects.find(a => a.subjectId === subjectId);
                                if (assignment) {
                                  handleAcceptConflict(assignment.subjectId, assignment.classId);
                                }
                              });
                            }}
                          >
                            Aceitar Conflito
                          </Button>
                        </div>
                      )}
                      {conflict.isWithinThreshold && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Dentro do limite permitido
                        </Badge>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Seleção de Disciplinas por Período */}
          <div className="space-y-4">
            <h3 className="font-medium">Selecionar Disciplinas por Período</h3>
            {Object.entries(PERIODS).map(([periodKey, periodLabel]) => {
              const periodSubjects = subjectsByPeriod[periodKey] || [];
              const periodClasses = classesByPeriod[periodKey] || [];
              
              if (periodSubjects.length === 0) return null;

              return (
                <Card key={periodKey} className="p-4">
                  <h4 className="font-medium mb-3">{periodLabel}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {periodSubjects.map(subject => (
                      <div key={subject.id} className="border rounded p-3">
                        <div className="mb-2">
                          <h5 className="font-medium text-sm">{subject.name}</h5>
                          <p className="text-xs text-gray-600">{subject.professor}</p>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-xs font-medium">Turmas disponíveis:</p>
                          <div className="grid grid-cols-2 gap-2">
                            {periodClasses.map(cls => {
                              const isSelected = selectedSubjects.some(
                                a => a.subjectId === subject.id && a.classId === cls.id
                              );
                              
                              return (
                                <div key={cls.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`${subject.id}-${cls.id}`}
                                    checked={isSelected}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        handleAddSubject(subject.id, cls.id, periodKey);
                                      } else {
                                        handleRemoveSubject(subject.id, cls.id);
                                      }
                                    }}
                                  />
                                  <Label htmlFor={`${subject.id}-${cls.id}`} className="text-xs">
                                    {cls.name}
                                  </Label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Disciplinas Selecionadas */}
          {selectedSubjects.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Disciplinas Selecionadas ({selectedSubjects.length})</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedSubjects.map((assignment, index) => {
                  const subject = subjects.find(s => s.id === assignment.subjectId);
                  const cls = classes.find(c => c.id === assignment.classId);
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <span className="text-sm font-medium">{subject?.name}</span>
                        <span className="text-xs text-gray-600 ml-2">- {cls?.name}</span>
                        <Badge className={`period-${assignment.period} text-xs ml-2`}>
                          {PERIODS[assignment.period as keyof typeof PERIODS]}
                        </Badge>
                        {assignment.isConflictAccepted && (
                          <Badge variant="destructive" className="text-xs ml-2">
                            Conflito Aceito
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSubject(assignment.subjectId, assignment.classId)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              {selectedSubjects.length} disciplinas selecionadas
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={exportSchedule}
                disabled={selectedSubjects.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!scheduleName || selectedSubjects.length === 0}
                className="medical-gradient"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Grade
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
