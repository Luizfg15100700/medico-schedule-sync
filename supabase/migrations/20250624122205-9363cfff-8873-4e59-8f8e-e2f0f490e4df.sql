
-- Remover as turmas existentes (apenas 2 por período)
DELETE FROM public.class_groups;

-- Inserir 4 turmas por período
INSERT INTO public.class_groups (id, name, period) VALUES
-- Período 1
('1-1', 'Turma A', '1'),
('1-2', 'Turma B', '1'),
('1-3', 'Turma C', '1'),
('1-4', 'Turma D', '1'),
-- Período 2
('2-1', 'Turma A', '2'),
('2-2', 'Turma B', '2'),
('2-3', 'Turma C', '2'),
('2-4', 'Turma D', '2'),
-- Período 3
('3-1', 'Turma A', '3'),
('3-2', 'Turma B', '3'),
('3-3', 'Turma C', '3'),
('3-4', 'Turma D', '3'),
-- Período 4
('4-1', 'Turma A', '4'),
('4-2', 'Turma B', '4'),
('4-3', 'Turma C', '4'),
('4-4', 'Turma D', '4'),
-- Período 5
('5-1', 'Turma A', '5'),
('5-2', 'Turma B', '5'),
('5-3', 'Turma C', '5'),
('5-4', 'Turma D', '5'),
-- Período 6
('6-1', 'Turma A', '6'),
('6-2', 'Turma B', '6'),
('6-3', 'Turma C', '6'),
('6-4', 'Turma D', '6'),
-- Período 7
('7-1', 'Turma A', '7'),
('7-2', 'Turma B', '7'),
('7-3', 'Turma C', '7'),
('7-4', 'Turma D', '7'),
-- Período 8
('8-1', 'Turma A', '8'),
('8-2', 'Turma B', '8'),
('8-3', 'Turma C', '8'),
('8-4', 'Turma D', '8'),
-- Período 9
('9-1', 'Turma A', '9'),
('9-2', 'Turma B', '9'),
('9-3', 'Turma C', '9'),
('9-4', 'Turma D', '9'),
-- Período 10
('10-1', 'Turma A', '10'),
('10-2', 'Turma B', '10'),
('10-3', 'Turma C', '10'),
('10-4', 'Turma D', '10');
