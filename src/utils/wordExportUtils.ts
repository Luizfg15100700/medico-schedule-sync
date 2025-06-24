
import { Document, Packer, Paragraph, Table, TableCell, TableRow, WidthType, AlignmentType, BorderStyle, HeadingLevel } from 'docx';
import { Subject, ClassSchedule, DAYS_OF_WEEK, TIME_SLOTS } from '@/types';
import { ClassGroup, SubjectScheduleOverride } from '@/types/class';

interface WordExportOptions {
  subjects: Subject[];
  selectedClass?: ClassGroup;
  getSubjectScheduleForClass?: (classId: string, subjectId: string, defaultSubject?: Subject) => SubjectScheduleOverride | null;
  scheduleName: string;
}

const LUNCH_BREAK_START = '11:50';
const LUNCH_BREAK_END = '12:40';

export const exportScheduleToWord = async (options: WordExportOptions) => {
  const { subjects, selectedClass, getSubjectScheduleForClass, scheduleName } = options;

  // Função para obter horários efetivos (igual à do ScheduleGrid)
  const getEffectiveSchedule = (subject: Subject): ClassSchedule[] => {
    if (!selectedClass || !getSubjectScheduleForClass) {
      return [...subject.theoreticalClasses, ...subject.practicalClasses];
    }

    const classSchedule = getSubjectScheduleForClass(selectedClass.id, subject.id, subject);
    if (classSchedule) {
      if (classSchedule.hasCustomSchedule) {
        return [
          ...classSchedule.theoreticalClasses.map(tc => ({
            id: tc.id,
            subjectId: tc.subjectId,
            type: tc.type,
            dayOfWeek: tc.dayOfWeek,
            startTime: tc.startTime,
            endTime: tc.endTime,
            location: tc.location,
            workload: tc.workload
          })),
          ...classSchedule.practicalClasses.map(pc => ({
            id: pc.id,
            subjectId: pc.subjectId,
            type: pc.type,
            dayOfWeek: pc.dayOfWeek,
            startTime: pc.startTime,
            endTime: pc.endTime,
            location: pc.location,
            workload: pc.workload
          }))
        ] as ClassSchedule[];
      }
    }

    return [...subject.theoreticalClasses, ...subject.practicalClasses];
  };

  // Criar mapa de horários para cada dia
  const scheduleMap: { [day: string]: { [time: string]: ClassSchedule[] } } = {};
  
  Object.keys(DAYS_OF_WEEK).forEach(day => {
    scheduleMap[day] = {};
    TIME_SLOTS.forEach(time => {
      scheduleMap[day][time] = [];
    });
  });

  // Preencher o mapa com as disciplinas
  subjects.forEach(subject => {
    const effectiveSchedule = getEffectiveSchedule(subject);
    effectiveSchedule.forEach(classItem => {
      const startTime = new Date(`2000-01-01 ${classItem.startTime}`);
      const endTime = new Date(`2000-01-01 ${classItem.endTime}`);
      
      TIME_SLOTS.forEach(timeSlot => {
        const slotTime = new Date(`2000-01-01 ${timeSlot}`);
        
        if (slotTime >= startTime && slotTime < endTime) {
          scheduleMap[classItem.dayOfWeek][timeSlot].push(classItem);
        }
      });
    });
  });

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
            const dayClasses = scheduleMap[day][timeSlot];
            let cellText = '';
            
            if (dayClasses.length > 0) {
              if (dayClasses.length === 1) {
                const classItem = dayClasses[0];
                const subject = subjects.find(s => s.id === classItem.subjectId);
                const typeLabel = classItem.type === 'theoretical' ? 'T' : 'P';
                cellText = `${subject?.name || ''}\n(${typeLabel})\n${subject?.professor || ''}`;
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

  // Gerar e baixar arquivo
  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${scheduleName.replace(/\s+/g, '-').toLowerCase() || 'grade-horaria'}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
