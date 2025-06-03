
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAcademicCalendar } from '@/hooks/useAcademicCalendar';
import { Calendar, Plus, Edit, Trash2, CheckCircle, Clock, Copy } from 'lucide-react';
import { AcademicPeriod } from '@/types/academic';

export const AcademicCalendar: React.FC = () => {
  const {
    academicPeriods,
    activePeriod,
    setActivePeriod,
    addAcademicPeriod,
    updateAcademicPeriod,
    deleteAcademicPeriod,
    duplicateAcademicPeriod
  } = useAcademicCalendar();

  const [isCreating, setIsCreating] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<AcademicPeriod | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    semester: '1',
    year: new Date().getFullYear(),
    startDate: '',
    endDate: '',
    isActive: false
  });

  const resetForm = () => {
    setFormData({
      name: '',
      semester: '1',
      year: new Date().getFullYear(),
      startDate: '',
      endDate: '',
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
      startDate: period.startDate,
      endDate: period.endDate,
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
    duplicateAcademicPeriod(periodId);
  };

  const toggleActive = (period: AcademicPeriod) => {
    // Desativar outros períodos
    academicPeriods.forEach(p => {
      if (p.id !== period.id && p.isActive) {
        updateAcademicPeriod(p.id, { isActive: false });
      }
    });
    
    // Ativar o período selecionado
    updateAcademicPeriod(period.id, { isActive: true });
    setActivePeriod(period.id);
  };

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

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{academicPeriods.length}</div>
            <p className="text-sm text-gray-600">Períodos Cadastrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {academicPeriods.filter(p => p.isActive).length}
            </div>
            <p className="text-sm text-gray-600">Período Ativo</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {academicPeriods.filter(p => new Date(p.endDate) > new Date()).length}
            </div>
            <p className="text-sm text-gray-600">Períodos Futuros</p>
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Lista de Períodos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {academicPeriods.map(period => (
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
                  <Badge variant="outline">
                    {period.semester}º Semestre
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {new Date(period.startDate).toLocaleDateString()} - {' '}
                    {new Date(period.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(period)}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(period.id)}
                    title="Duplicar período"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(period.id)}
                    className="text-red-600 hover:text-red-700"
                    disabled={period.isActive || academicPeriods.length <= 1}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                
                {!period.isActive && (
                  <Button
                    size="sm"
                    className="medical-gradient"
                    onClick={() => toggleActive(period)}
                  >
                    Ativar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
