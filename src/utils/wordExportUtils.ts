
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle, HeadingLevel } from 'docx';
import { Subject, ClassSchedule, DAYS_OF_WEEK } from '@/types';
import { ClassGroup, SubjectScheduleOverride } from '@/types/class';

interface WordExportOptions {
  subjects: Subject[];
  selectedClass?: ClassGroup;
  getSubjectScheduleForClass?: (classId: string, subjectId: string, defaultSubject?: Subject) => SubjectScheduleOverride | null;
  scheduleName: string;
}

// Definir horários
const TIME_SLOTS = [
  '07:00', '07:50', '08:40', '09:30', '10:20', '11:10',
  '12:40', '13:30', '14:20', '15:10', '16:00', '16:50',
  '17:40', '18:30', '19:20', '20:10', '21:00'
];

const LUNCH_BREAK_START = '11:50';
const LUNCH_BREAK_END = '12:40';

export const exportScheduleToWord = async (options: WordExportOptions) => {
  const { subjects, selectedClass, getSubjectScheduleForClass, scheduleName } = options;

  console.log('Iniciando exportação para Word:', { 
    subjects: subjects.length, 
    selectedClass: selectedClass?.name, 
    scheduleName,
    subjectNames: subjects.map(s => s.name)
  });

  if (!subjects || subjects.length === 0) {
    console.error('Nenhuma disciplina fornecida');
    throw new Error('Nenhuma disciplina foi fornecida para exportação');
  }

  // Função para obter horários efetivos (considerando horários específicos da turma)
  const getEffectiveSchedule = (subject: Subject): ClassSchedule[] => {
    console.log(`Obtendo horários para disciplina: ${subject.name}`);
    
    try {
      // Verificar se as propriedades existem e são arrays válidos
      const theoreticalClasses = Array.isArray(subject.theoreticalClasses) ? subject.theoreticalClasses : [];
      const practicalClasses = Array.isArray(subject.practicalClasses) ? subject.practicalClasses : [];
      
      if (!selectedClass || !getSubjectScheduleForClass) {
        console.log('Usando horários padrão da disciplina');
        return [...theoreticalClasses, ...practicalClasses];
      }

      const classSchedule = getSubjectScheduleForClass(selectedClass.id, subject.id, subject);
      
      if (classSchedule && classSchedule.hasCustomSchedule) {
        console.log(`Usando horários customizados para ${subject.name} na turma ${selectedClass.name}`);
        
        const customTheoreticalClasses = Array.isArray(classSchedule.theoreticalClasses) ? classSchedule.theoreticalClasses : [];
        const customPracticalClasses = Array.isArray(classSchedule.practicalClasses) ? classSchedule.practicalClasses : [];
        
        return [
          ...customTheoreticalClasses.map(tc => ({
            id: tc.id || `${tc.subjectId}-t-${tc.dayOfWeek}-${tc.startTime}`,
            subjectId: tc.subjectId,
            type: tc.type || 'theoretical',
            dayOfWeek: tc.dayOfWeek,
            startTime: tc.startTime,
            endTime: tc.endTime,
            location: tc.location || subject.location || '',
            workload: tc.workload || 0
          })),
          ...customPracticalClasses.map(pc => ({
            id: pc.id || `${pc.subjectId}-p-${pc.dayOfWeek}-${pc.startTime}`,
            subjectId: pc.subjectId,
            type: pc.type || 'practical',
            dayOfWeek: pc.dayOfWeek,
            startTime: pc.startTime,
            endTime: pc.endTime,
            location: pc.location || subject.location || '',
            workload: pc.workload || 0
          }))
        ] as ClassSchedule[];
      }

      console.log('Usando horários padrão da disciplina');
      return [...theoreticalClasses, ...practicalClasses];
      
    } catch (error) {
      console.error(`Erro ao obter horários para ${subject.name}:`, error);
      return [];
    }
  };

  // Criar mapa de horários para cada dia
  const scheduleMap: { [day: string]: { [time: string]: Array<{ subject: Subject; classItem: ClassSchedule }> } } = {};
  
  Object.keys(DAYS_OF_WEEK).forEach(day => {
    scheduleMap[day] = {};
    TIME_SLOTS.forEach(time => {
      scheduleMap[day][time] = [];
    });
  });

  console.log('Processando disciplinas para o mapa de horários...');

  // Preencher o mapa com as disciplinas
  subjects.forEach(subject => {
    console.log(`Processando disciplina: ${subject.name}`);
    
    try {
      const effectiveSchedule = getEffectiveSchedule(subject);
      
      console.log(`Horários efetivos para ${subject.name}:`, effectiveSchedule);
      
      effectiveSchedule.forEach(classItem => {
        console.log(`Processando aula: ${classItem.dayOfWeek} ${classItem.startTime}-${classItem.endTime}`);
        
        if (!classItem.startTime || !classItem.endTime || !classItem.dayOfWeek) {
          console.warn(`Horário inválido para ${subject.name}:`, classItem);
          return;
        }

        try {
          // Validar formato de horário
          const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
          if (!timeRegex.test(classItem.startTime) || !timeRegex.test(classItem.endTime)) {
            console.warn(`Formato de horário inválido para ${subject.name}:`, classItem);
            return;
          }

          const startTime = new Date(`2000-01-01 ${classItem.startTime}`);
          const endTime = new Date(`2000-01-01 ${classItem.endTime}`);
          
          if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            console.warn(`Não foi possível converter horário para ${subject.name}:`, classItem);
            return;
          }
          
          TIME_SLOTS.forEach(timeSlot => {
            try {
              const slotTime = new Date(`2000-01-01 ${timeSlot}`);
              
              if (slotTime >= startTime && slotTime < endTime) {
                if (!scheduleMap[classItem.dayOfWeek]) {
                  scheduleMap[classItem.dayOfWeek] = {};
                }
                if (!scheduleMap[classItem.dayOfWeek][timeSlot]) {
                  scheduleMap[classItem.dayOfWeek][timeSlot] = [];
                }
                scheduleMap[classItem.dayOfWeek][timeSlot].push({ subject, classItem });
                console.log(`Adicionado ${subject.name} em ${classItem.dayOfWeek} ${timeSlot}`);
              }
            } catch (slotError) {
              console.error(`Erro ao processar slot ${timeSlot}:`, slotError);
            }
          });
        } catch (error) {
          console.error(`Erro ao processar horário da disciplina ${subject.name}:`, error);
        }
      });
    } catch (error) {
      console.error(`Erro ao processar disciplina ${subject.name}:`, error);
    }
  });

  console.log('Mapa de horários criado:', scheduleMap);

  try {
    // Criar cabeçalho da tabela
    const headerRow = new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ text: "Horário", alignment: AlignmentType.CENTER })],
          width: { size: 15, type: WidthType.PERCENTAGE },
        }),
        ...Object.values(DAYS_OF_WEEK).map(dayName => 
          new TableCell({
            children: [new Paragraph({ text: dayName, alignment: AlignmentType.CENTER })],
            width: { size: 17, type: WidthType.PERCENTAGE },
          })
        )
      ],
    });

    // Criar linhas da tabela
    const tableRows = [headerRow];
    
    TIME_SLOTS.forEach(timeSlot => {
      // Verificar se é horário de almoço
      const isLunchTime = timeSlot >= LUNCH_BREAK_START && timeSlot <= LUNCH_BREAK_END;
      
      if (isLunchTime && timeSlot === LUNCH_BREAK_START) {
        // Criar linha especial para o almoço
        const lunchRow = new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: `${LUNCH_BREAK_START} - ${LUNCH_BREAK_END}`, alignment: AlignmentType.CENTER })],
            }),
            ...Object.keys(DAYS_OF_WEEK).map(() => 
              new TableCell({
                children: [new Paragraph({ text: "INTERVALO PARA ALMOÇO", alignment: AlignmentType.CENTER })],
              })
            )
          ],
        });
        tableRows.push(lunchRow);
      } else if (!isLunchTime) {
        // Criar linha normal
        const row = new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: timeSlot, alignment: AlignmentType.CENTER })],
            }),
            ...Object.keys(DAYS_OF_WEEK).map(day => {
              const dayClasses = scheduleMap[day]?.[timeSlot] || [];
              let cellText = '';
              
              if (dayClasses.length > 0) {
                if (dayClasses.length === 1) {
                  const { subject, classItem } = dayClasses[0];
                  const typeLabel = classItem.type === 'theoretical' ? 'T' : 'P';
                  cellText = `${subject.name}\n(${typeLabel})\n${subject.professor || ''}`;
                } else {
                  cellText = `CONFLITO\n(${dayClasses.length} disciplinas)`;
                }
              }
              
              return new TableCell({
                children: [new Paragraph({ text: cellText, alignment: AlignmentType.CENTER })],
              });
            })
          ],
        });
        tableRows.push(row);
      }
    });

    // Criar tabela
    const table = new Table({
      rows: tableRows,
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
    });

    // Criar documento
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              text: scheduleName || 'Grade Horária',
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: selectedClass ? `Turma: ${selectedClass.name} - ${selectedClass.period}º Período` : '',
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `Gerado em: ${new Date().toLocaleDateString('pt-BR')}`,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: '',
            }),
            table,
            new Paragraph({
              text: '',
            }),
            new Paragraph({
              text: 'Legenda: T = Teórica, P = Prática',
              alignment: AlignmentType.LEFT,
            }),
          ],
        },
      ],
    });

    // Gerar e baixar arquivo usando toBlob() ao invés de toBuffer()
    console.log('Gerando documento Word...');
    const blob = await Packer.toBlob(doc);
    console.log('Documento gerado, iniciando download...');
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${scheduleName.replace(/\s+/g, '-').toLowerCase() || 'grade-horaria'}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Download concluído com sucesso!');
    
  } catch (error) {
    console.error('Erro ao gerar ou baixar documento:', error);
    throw new Error(`Erro na geração do documento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
};
