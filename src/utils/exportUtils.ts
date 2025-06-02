
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
