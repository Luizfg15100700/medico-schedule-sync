
-- Criar tabela para períodos acadêmicos
CREATE TABLE public.academic_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  semester TEXT NOT NULL,
  year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'future' CHECK (status IN ('future', 'active', 'finished')),
  type TEXT NOT NULL DEFAULT 'regular' CHECK (type IN ('regular', 'intensive', 'special')),
  enrollment_start DATE,
  enrollment_end DATE,
  exam_week_start DATE,
  exam_week_end DATE,
  institution_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para templates de grade
CREATE TABLE public.schedule_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  academic_period_id UUID REFERENCES public.academic_periods(id) ON DELETE CASCADE,
  subjects JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.academic_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_templates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para academic_periods (por enquanto permitir tudo para usuários autenticados)
CREATE POLICY "Users can view academic periods" 
  ON public.academic_periods 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create academic periods" 
  ON public.academic_periods 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update academic periods" 
  ON public.academic_periods 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Users can delete academic periods" 
  ON public.academic_periods 
  FOR DELETE 
  USING (true);

-- Políticas RLS para schedule_templates
CREATE POLICY "Users can view schedule templates" 
  ON public.schedule_templates 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create schedule templates" 
  ON public.schedule_templates 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update schedule templates" 
  ON public.schedule_templates 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Users can delete schedule templates" 
  ON public.schedule_templates 
  FOR DELETE 
  USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_academic_periods_updated_at 
    BEFORE UPDATE ON public.academic_periods 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_templates_updated_at 
    BEFORE UPDATE ON public.schedule_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
