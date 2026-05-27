import type { QuizQuestion } from "../types/course";

export type AnswerMap = Record<string, number>;

export type QuizScore = {
  correctAnswers: number;
  totalQuestions: number;
  percent: number;
};

export type QuizOptionState = "default" | "correct" | "incorrect";

export function scoreQuiz(questions: QuizQuestion[], answers: AnswerMap): QuizScore {
  const totalQuestions = questions.length;
  const correctAnswers = questions.reduce((sum, question) => {
    return answers[question.id] === question.correctIndex ? sum + 1 : sum;
  }, 0);

  return {
    correctAnswers,
    totalQuestions,
    percent: totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100)
  };
}

export function getOptionState(
  question: QuizQuestion,
  optionIndex: number,
  selectedIndex: number | undefined
): QuizOptionState {
  if (selectedIndex === undefined) {
    return "default";
  }

  if (optionIndex === question.correctIndex) {
    return "correct";
  }

  if (optionIndex === selectedIndex) {
    return "incorrect";
  }

  return "default";
}
