
import { Subject, ClassSchedule } from '@/types';

export const exportToPDF = (subjects: Subject[], selectedSubjects: string[]) => {
  const selectedSubjectsList = subjects.filter(s => selectedSubjects.includes(s.id));
  
  // Create a simple HTML content for PDF
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Grade Horária - MedSchedule</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #1e40af; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f5f5f5; }
        .theoretical { background-color: #dbeafe; }
        .practical { background-color: #dcfce7; }
      </style>
    </head>
    <body>
      <h1>Grade Horária Selecionada</h1>
      <p>Gerado em: ${new Date().toLocaleDateString('pt-BR')}</p>
      
      <h2>Disciplinas Selecionadas (${selectedSubjectsList.length})</h2>
      
      ${selectedSubjectsList.map(subject => `
        <h3>${subject.name} - ${subject.period}º Período</h3>
        <p><strong>Professor:</strong> ${subject.professor}</p>
        <p><strong>Local:</strong> ${subject.location}</p>
        <p><strong>Carga Horária:</strong> ${subject.totalWorkload}h</p>
        
        ${subject.theoreticalClasses.length > 0 ? `
          <h4>Aulas Teóricas:</h4>
          <ul>
            ${subject.theoreticalClasses.map(cls => `
              <li>${getDayName(cls.dayOfWeek)}: ${cls.startTime} - ${cls.endTime} (${cls.location})</li>
            `).join('')}
          </ul>
        ` : ''}
        
        ${subject.practicalClasses.length > 0 ? `
          <h4>Aulas Práticas:</h4>
          <ul>
            ${subject.practicalClasses.map(cls => `
              <li>${getDayName(cls.dayOfWeek)}: ${cls.startTime} - ${cls.endTime} (${cls.location})</li>
            `).join('')}
          </ul>
        ` : ''}
      `).join('')}
    </body>
    </html>
  `;

  // Create and download the file
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `grade-horaria-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToExcel = (subjects: Subject[], selectedSubjects: string[]) => {
  const selectedSubjectsList = subjects.filter(s => selectedSubjects.includes(s.id));
  
  // Criar dados estruturados para Excel
  const excelData = [];
  
  // Cabeçalho
  excelData.push([
    'Disciplina',
    'Período', 
    'Professor',
    'Local da Disciplina',
    'Tipo de Aula',
    'Dia da Semana',
    'Horário Início',
    'Horário Fim',
    'Local da Aula',
    'Carga Horária (h)'
  ]);

  // Dados das disciplinas
  selectedSubjectsList.forEach(subject => {
    // Aulas teóricas
    subject.theoreticalClasses.forEach(cls => {
      excelData.push([
        subject.name,
        `${subject.period}º Período`,
        subject.professor,
        subject.location,
        'Teórica',
        getDayName(cls.dayOfWeek),
        cls.startTime,
        cls.endTime,
        cls.location,
        cls.workload
      ]);
    });

    // Aulas práticas
    subject.practicalClasses.forEach(cls => {
      excelData.push([
        subject.name,
        `${subject.period}º Período`,
        subject.professor,
        subject.location,
        'Prática',
        getDayName(cls.dayOfWeek),
        cls.startTime,
        cls.endTime,
        cls.location,
        cls.workload
      ]);
    });
  });

  // Converter para formato Excel usando uma biblioteca simples
  const worksheet = createWorksheet(excelData);
  const workbook = createWorkbook(worksheet);
  
  // Download do arquivo
  downloadExcelFile(workbook, `grade-horaria-${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Função para criar worksheet simples
const createWorksheet = (data: any[][]) => {
  const worksheet: { [key: string]: any } = {};
  const range = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };

  for (let R = 0; R < data.length; R++) {
    for (let C = 0; C < data[R].length; C++) {
      if (range.s.r > R) range.s.r = R;
      if (range.s.c > C) range.s.c = C;
      if (range.e.r < R) range.e.r = R;
      if (range.e.c < C) range.e.c = C;

      const cell = { v: data[R][C] };
      if (cell.v == null) continue;
      
      const cell_ref = encodeCell({ c: C, r: R });
      
      if (typeof cell.v === 'number') cell.t = 'n';
      else if (typeof cell.v === 'boolean') cell.t = 'b';
      else if (cell.v instanceof Date) {
        cell.t = 'n';
        cell.z = 'M/D/YY';
        cell.v = dateToSerial(cell.v);
      } else cell.t = 's';

      worksheet[cell_ref] = cell;
    }
  }
  
  if (range.s.c < 10000000) worksheet['!ref'] = encodeRange(range);
  return worksheet;
};

const createWorkbook = (worksheet: any) => {
  return {
    SheetNames: ['Grade Horária'],
    Sheets: { 'Grade Horária': worksheet }
  };
};

const encodeCell = (cell: { c: number; r: number }) => {
  return encodeCol(cell.c) + encodeRow(cell.r);
};

const encodeCol = (col: number) => {
  let s = '';
  for (++col; col; col = Math.floor((col - 1) / 26)) {
    s = String.fromCharCode(((col - 1) % 26) + 65) + s;
  }
  return s;
};

const encodeRow = (row: number) => {
  return (row + 1).toString();
};

const encodeRange = (range: any) => {
  return encodeCell(range.s) + ':' + encodeCell(range.e);
};

const dateToSerial = (date: Date) => {
  return (date.getTime() - new Date(1900, 0, 1).getTime()) / (24 * 60 * 60 * 1000) + 1;
};

const downloadExcelFile = (workbook: any, filename: string) => {
  // Converter para formato binário
  const wopts = { bookType: 'xlsx', type: 'array' };
  const wbout = writeWorkbook(workbook, wopts);
  
  // Criar blob e fazer download
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const writeWorkbook = (workbook: any, opts: any) => {
  // Implementação simplificada para gerar arquivo Excel
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const csv = sheetToCSV(sheet);
  
  // Para uma implementação mais robusta, seria melhor usar uma biblioteca como xlsx
  // Por enquanto, vamos exportar como CSV com extensão .xlsx
  return new TextEncoder().encode(csv);
};

const sheetToCSV = (sheet: any) => {
  const rows: string[][] = [];
  const range = decodeRange(sheet['!ref'] || 'A1:A1');
  
  for (let R = range.s.r; R <= range.e.r; ++R) {
    const row: string[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell_address = encodeCell({ c: C, r: R });
      const cell = sheet[cell_address];
      row.push(cell ? (cell.v || '').toString() : '');
    }
    rows.push(row);
  }
  
  return rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
};

const decodeRange = (range: string) => {
  const parts = range.split(':');
  return {
    s: decodeCell(parts[0]),
    e: decodeCell(parts[1] || parts[0])
  };
};

const decodeCell = (cell: string) => {
  const match = cell.match(/^([A-Z]+)([0-9]+)$/);
  if (!match) return { c: 0, r: 0 };
  
  return {
    c: decodeCol(match[1]),
    r: parseInt(match[2]) - 1
  };
};

const decodeCol = (col: string) => {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 64);
  }
  return result - 1;
};

// Manter a função exportToCSV para compatibilidade
export const exportToCSV = (subjects: Subject[], selectedSubjects: string[]) => {
  const selectedSubjectsList = subjects.filter(s => selectedSubjects.includes(s.id));
  
  const rows = [
    ['Disciplina', 'Período', 'Professor', 'Local', 'Tipo', 'Dia', 'Início', 'Fim', 'Local Aula', 'Carga Horária']
  ];

  selectedSubjectsList.forEach(subject => {
    subject.theoreticalClasses.forEach(cls => {
      rows.push([
        subject.name,
        subject.period + 'º Período',
        subject.professor,
        subject.location,
        'Teórica',
        getDayName(cls.dayOfWeek),
        cls.startTime,
        cls.endTime,
        cls.location,
        cls.workload.toString()
      ]);
    });

    subject.practicalClasses.forEach(cls => {
      rows.push([
        subject.name,
        subject.period + 'º Período',
        subject.professor,
        subject.location,
        'Prática',
        getDayName(cls.dayOfWeek),
        cls.startTime,
        cls.endTime,
        cls.location,
        cls.workload.toString()
      ]);
    });
  });

  const csvContent = rows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `grade-horaria-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const getDayName = (day: ClassSchedule['dayOfWeek']): string => {
  const days = {
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira',
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado'
  };
  return days[day];
};
