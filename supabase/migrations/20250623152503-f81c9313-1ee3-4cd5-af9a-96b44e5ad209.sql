
-- Criar tabela para grupos de turmas
CREATE TABLE public.class_groups (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  period TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para disciplinas
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  period TEXT NOT NULL,
  professor TEXT,
  location TEXT,
  total_workload INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de relacionamento entre turmas e disciplinas
CREATE TABLE public.class_subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES public.class_groups(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(class_id, subject_id)
);

-- Criar tabela para horários das disciplinas padrão
CREATE TABLE public.subject_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('theoretical', 'practical')),
  day_of_week TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  location TEXT,
  workload INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para horários customizados por turma
CREATE TABLE public.class_subject_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id TEXT NOT NULL REFERENCES public.class_groups(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('theoretical', 'practical')),
  day_of_week TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  location TEXT,
  workload INTEGER NOT NULL DEFAULT 0,
  has_custom_schedule BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS nas tabelas
ALTER TABLE public.class_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subject_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_subject_schedules ENABLE ROW LEVEL SECURITY;

-- Políticas RLS permissivas para todas as tabelas (por enquanto permitir tudo para usuários autenticados)
CREATE POLICY "Users can view class groups" ON public.class_groups FOR SELECT USING (true);
CREATE POLICY "Users can create class groups" ON public.class_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update class groups" ON public.class_groups FOR UPDATE USING (true);
CREATE POLICY "Users can delete class groups" ON public.class_groups FOR DELETE USING (true);

CREATE POLICY "Users can view subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Users can create subjects" ON public.subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update subjects" ON public.subjects FOR UPDATE USING (true);
CREATE POLICY "Users can delete subjects" ON public.subjects FOR DELETE USING (true);

CREATE POLICY "Users can view class subjects" ON public.class_subjects FOR SELECT USING (true);
CREATE POLICY "Users can create class subjects" ON public.class_subjects FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update class subjects" ON public.class_subjects FOR UPDATE USING (true);
CREATE POLICY "Users can delete class subjects" ON public.class_subjects FOR DELETE USING (true);

CREATE POLICY "Users can view subject schedules" ON public.subject_schedules FOR SELECT USING (true);
CREATE POLICY "Users can create subject schedules" ON public.subject_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update subject schedules" ON public.subject_schedules FOR UPDATE USING (true);
CREATE POLICY "Users can delete subject schedules" ON public.subject_schedules FOR DELETE USING (true);

CREATE POLICY "Users can view class subject schedules" ON public.class_subject_schedules FOR SELECT USING (true);
CREATE POLICY "Users can create class subject schedules" ON public.class_subject_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update class subject schedules" ON public.class_subject_schedules FOR UPDATE USING (true);
CREATE POLICY "Users can delete class subject schedules" ON public.class_subject_schedules FOR DELETE USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_class_groups_updated_at 
    BEFORE UPDATE ON public.class_groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at 
    BEFORE UPDATE ON public.subjects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais de turmas
INSERT INTO public.class_groups (id, name, period) VALUES
('1-1', 'Turma A', '1'),
('1-2', 'Turma B', '1'),
('2-1', 'Turma A', '2'),
('2-2', 'Turma B', '2'),
('3-1', 'Turma A', '3'),
('3-2', 'Turma B', '3'),
('4-1', 'Turma A', '4'),
('4-2', 'Turma B', '4'),
('5-1', 'Turma A', '5'),
('5-2', 'Turma B', '5'),
('6-1', 'Turma A', '6'),
('6-2', 'Turma B', '6'),
('7-1', 'Turma A', '7'),
('7-2', 'Turma B', '7'),
('8-1', 'Turma A', '8'),
('8-2', 'Turma B', '8'),
('9-1', 'Turma A', '9'),
('9-2', 'Turma B', '9'),
('10-1', 'Turma A', '10'),
('10-2', 'Turma B', '10');
