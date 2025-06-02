
export interface ClassGroup {
  id: string;
  name: string;
  period: string;
  subjects: string[]; // IDs das disciplinas
}

export interface SubjectWithClass {
  subjectId: string;
  classId: string;
}
