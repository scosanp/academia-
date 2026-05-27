export type LessonStatus = "available" | "completed" | "locked";

export type QuizQuestion = {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
};

export type Lesson = {
  id: string;
  moduleId: string;
  title: string;
  durationMinutes: number;
  theory: string[];
  examples: string[];
  practiceTask: string;
  keyTakeaway: string;
  quiz: QuizQuestion[];
};

export type CourseModule = {
  id: string;
  order: number;
  title: string;
  description: string;
  durationLabel: string;
  lessons: Lesson[];
};

export type KnowledgeCategory =
  | "Основы ИИ"
  | "ChatGPT"
  | "Промпты"
  | "Безопасность"
  | "Инструменты"
  | "Рабочие сценарии";

export type KnowledgeCard = {
  id: string;
  title: string;
  category: KnowledgeCategory;
  summary: string;
  example: string;
};

export type QuizResult = {
  lessonId: string;
  attempts: number;
  bestPercent: number;
  lastPercent: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  lastAttemptAt: string;
};

export type ProgressState = {
  completedLessonIds: string[];
  quizResults: Record<string, QuizResult>;
  lastActivityAt: string | null;
};
