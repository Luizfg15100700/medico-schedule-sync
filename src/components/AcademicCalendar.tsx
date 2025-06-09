
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAcademicCalendar } from '@/hooks/useAcademicCalendar';
import { Calendar, Plus, Edit, Trash2, CheckCircle, Clock, Copy, AlertTriangle, TrendingUp, Users, BookOpen, GraduationCap } from 'lucide-react';
import { AcademicPeriod } from '@/types/academic';

export const AcademicCalendar: React.FC = () => {
  const {
    academicPeriods,
    activePeriod,
    setActivePeriod,
    addAcademicPeriod,
    updateAcademicPeriod,
    deleteAcademicPeriod,
    duplicateAcademicPeriod,
    getPeriodsByStatus,
    validatePeriod
  } = useAcademicCalendar();

  const [isCreating, setIsCreating] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<AcademicPeriod | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    semester: '1',
    year: new Date().getFullYear(),
    type: 'regular' as 'regular' | 'intensive' | 'special',
    startDate: '',
    endDate: '',
    enrollmentStart: '',
    enrollmentEnd: '',
    examWeekStart: '',
    examWeekEnd: '',
    isActive: false
  });

  const resetForm = () => {
    setFormData({
      name: '',
      semester: '1',
      year: new Date().getFullYear(),
      type: 'regular',
      startDate: '',
      endDate: '',
      enrollmentStart: '',
      enrollmentEnd: '',
      examWeekStart: '',
      examWeekEnd: '',
      isActive: false
    });
    setIsCreating(false);
    setEditingPeriod(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPeriod) {
      updateAcademicPeriod(editingPeriod.id, formData);
    } else {
      addAcademicPeriod(formData);
    }
    resetForm();
  };

  const handleEdit = (period: AcademicPeriod) => {
    setEditingPeriod(period);
    setFormData({
      name: period.name,
      semester: period.semester,
      year: period.year,
      type: period.type,
      startDate: period.startDate,
      endDate: period.endDate,
      enrollmentStart: period.enrollmentStart || '',
      enrollmentEnd: period.enrollmentEnd || '',
      examWeekStart: period.examWeekStart || '',
      examWeekEnd: period.examWeekEnd || '',
      isActive: period.isActive
    });
    setIsCreating(true);
  };

  const handleDelete = (periodId: string) => {
    if (confirm('Tem certeza que deseja excluir este período acadêmico?')) {
      deleteAcademicPeriod(periodId);
    }
  };

  const handleDuplicate = (periodId: string) => {
    const targetYear = prompt('Digite o ano para o novo período:', (new Date().getFullYear() + 1).toString());
    if (targetYear) {
      duplicateAcademicPeriod(periodId, parseInt(targetYear));
    }
  };

  const toggleActive = (period: AcademicPeriod) => {
    academicPeriods.forEach(p => {
      if (p.id !== period.id && p.isActive) {
        updateAcademicPeriod(p.id, { isActive: false });
      }
    });
    
    updateAcademicPeriod(period.id, { isActive: true });
    setActivePeriod(period.id);
  };

  const getStatusColor = (status: AcademicPeriod['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'future': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'finished': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeLabel = (type: AcademicPeriod['type']) => {
    switch (type) {
      case 'regular': return 'Regular';
      case 'intensive': return 'Intensivo';
      case 'special': return 'Especial';
      default: return 'Regular';
    }
  };

  const activePeriods = getPeriodsByStatus('active');
  const futurePeriods = getPeriodsByStatus('future');
  const finishedPeriods = getPeriodsByStatus('finished');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Calendário Acadêmico</h2>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="medical-gradient"
          disabled={isCreating}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Período
        </Button>
      </div>

      {/* Dashboard de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{academicPeriods.length}</div>
                <p className="text-sm text-gray-600">Total de Períodos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{activePeriods.length}</div>
                <p className="text-sm text-gray-600">Períodos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{futurePeriods.length}</div>
                <p className="text-sm text-gray-600">Períodos Futuros</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{finishedPeriods.length}</div>
                <p className="text-sm text-gray-600">Períodos Finalizados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de Criação/Edição */}
      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingPeriod ? 'Editar Período Acadêmico' : 'Novo Período Acadêmico'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="advanced">Configurações Avançadas</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="name">Nome do Período</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Ex: 2024.1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="semester">Semestre</Label>
                      <Select 
                        value={formData.semester} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, semester: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1º Semestre</SelectItem>
                          <SelectItem value="2">2º Semestre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="year">Ano</Label>
                      <Input
                        id="year"
                        type="number"
                        value={formData.year}
                        onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                        min={2020}
                        max={2030}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="type">Tipo de Período</Label>
                      <Select 
                        value={formData.type} 
                        onValueChange={(value: 'regular' | 'intensive' | 'special') => setFormData(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="intensive">Intensivo</SelectItem>
                          <SelectItem value="special">Especial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="startDate">Data de Início</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="endDate">Data de Término</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="enrollmentStart">Início das Matrículas</Label>
                      <Input
                        id="enrollmentStart"
                        type="date"
                        value={formData.enrollmentStart}
                        onChange={(e) => setFormData(prev => ({ ...prev, enrollmentStart: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="enrollmentEnd">Fim das Matrículas</Label>
                      <Input
                        id="enrollmentEnd"
                        type="date"
                        value={formData.enrollmentEnd}
                        onChange={(e) => setFormData(prev => ({ ...prev, enrollmentEnd: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="examWeekStart">Início da Semana de Provas</Label>
                      <Input
                        id="examWeekStart"
                        type="date"
                        value={formData.examWeekStart}
                        onChange={(e) => setFormData(prev => ({ ...prev, examWeekStart: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="examWeekEnd">Fim da Semana de Provas</Label>
                      <Input
                        id="examWeekEnd"
                        type="date"
                        value={formData.examWeekEnd}
                        onChange={(e) => setFormData(prev => ({ ...prev, examWeekEnd: e.target.value }))}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="medical-gradient">
                  {editingPeriod ? 'Atualizar' : 'Criar'} Período
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Períodos com Tabs por Status */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Todos ({academicPeriods.length})</TabsTrigger>
          <TabsTrigger value="active">Ativos ({activePeriods.length})</TabsTrigger>
          <TabsTrigger value="future">Futuros ({futurePeriods.length})</TabsTrigger>
          <TabsTrigger value="finished">Finalizados ({finishedPeriods.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <PeriodsList 
            periods={academicPeriods} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onToggleActive={toggleActive}
            getStatusColor={getStatusColor}
            getTypeLabel={getTypeLabel}
          />
        </TabsContent>
        
        <TabsContent value="active">
          <PeriodsList 
            periods={activePeriods} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onToggleActive={toggleActive}
            getStatusColor={getStatusColor}
            getTypeLabel={getTypeLabel}
          />
        </TabsContent>
        
        <TabsContent value="future">
          <PeriodsList 
            periods={futurePeriods} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onToggleActive={toggleActive}
            getStatusColor={getStatusColor}
            getTypeLabel={getTypeLabel}
          />
        </TabsContent>
        
        <TabsContent value="finished">
          <PeriodsList 
            periods={finishedPeriods} 
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onToggleActive={toggleActive}
            getStatusColor={getStatusColor}
            getTypeLabel={getTypeLabel}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente auxiliar para lista de períodos
const PeriodsList: React.FC<{
  periods: AcademicPeriod[];
  onEdit: (period: AcademicPeriod) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleActive: (period: AcademicPeriod) => void;
  getStatusColor: (status: AcademicPeriod['status']) => string;
  getTypeLabel: (type: AcademicPeriod['type']) => string;
}> = ({ periods, onEdit, onDelete, onDuplicate, onToggleActive, getStatusColor, getTypeLabel }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {periods.map(period => (
        <Card key={period.id} className={period.isActive ? 'ring-2 ring-blue-500' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{period.name}</CardTitle>
              <div className="flex items-center gap-2">
                {period.isActive && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ativo
                  </Badge>
                )}
                <Badge className={getStatusColor(period.status)}>
                  {period.status === 'active' && 'Em Andamento'}
                  {period.status === 'future' && 'Futuro'}
                  {period.status === 'finished' && 'Finalizado'}
                </Badge>
                <Badge variant="outline">
                  {getTypeLabel(period.type)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-1">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  {new Date(period.startDate).toLocaleDateString()} - {' '}
                  {new Date(period.endDate).toLocaleDateString()}
                </span>
              </div>
              
              {period.enrollmentStart && period.enrollmentEnd && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-600">
                    Matrículas: {new Date(period.enrollmentStart).toLocaleDateString()} - {' '}
                    {new Date(period.enrollmentEnd).toLocaleDateString()}
                  </span>
                </div>
              )}
              
              {period.examWeekStart && period.examWeekEnd && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-600">
                    Provas: {new Date(period.examWeekStart).toLocaleDateString()} - {' '}
                    {new Date(period.examWeekEnd).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(period)}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDuplicate(period.id)}
                  title="Duplicar período"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(period.id)}
                  className="text-red-600 hover:text-red-700"
                  disabled={period.isActive}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              
              {!period.isActive && (
                <Button
                  size="sm"
                  className="medical-gradient"
                  onClick={() => onToggleActive(period)}
                >
                  Ativar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
