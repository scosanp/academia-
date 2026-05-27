import type { CourseModule, LessonStatus, ProgressState, QuizResult } from "../types/course";

export const PASSING_SCORE = 70;

export const createEmptyProgress = (): ProgressState => ({
  completedLessonIds: [],
  quizResults: {},
  lastActivityAt: null
});

export function normalizeProgress(value: unknown): ProgressState {
  if (!value || typeof value !== "object") {
    return createEmptyProgress();
  }

  const candidate = value as Partial<ProgressState>;
  const completedLessonIds = Array.isArray(candidate.completedLessonIds)
    ? candidate.completedLessonIds.filter((id): id is string => typeof id === "string")
    : [];

  const quizResults: Record<string, QuizResult> = {};
  const rawResults =
    candidate.quizResults && typeof candidate.quizResults === "object" ? candidate.quizResults : {};

  Object.entries(rawResults).forEach(([lessonId, result]) => {
    if (!result || typeof result !== "object") {
      return;
    }

    const item = result as Partial<QuizResult>;
    quizResults[lessonId] = {
      lessonId,
      attempts: Number(item.attempts || 0),
      bestPercent: Number(item.bestPercent || 0),
      lastPercent: Number(item.lastPercent || 0),
      correctAnswers: Number(item.correctAnswers || 0),
      totalQuestions: Number(item.totalQuestions || 0),
      passed: Boolean(item.passed),
      lastAttemptAt: String(item.lastAttemptAt || new Date().toISOString())
    };
  });

  return {
    completedLessonIds: Array.from(new Set(completedLessonIds)),
    quizResults,
    lastActivityAt:
      typeof candidate.lastActivityAt === "string" ? candidate.lastActivityAt : null
  };
}

export function flattenLessonIds(modules: CourseModule[]) {
  return modules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
}

export function isLessonCompleted(progress: ProgressState, lessonId: string) {
  return progress.completedLessonIds.includes(lessonId);
}

export function getLessonStatus(
  lessonId: string,
  orderedLessonIds: string[],
  progress: ProgressState
): LessonStatus {
  if (isLessonCompleted(progress, lessonId)) {
    return "completed";
  }

  const index = orderedLessonIds.indexOf(lessonId);
  if (index <= 0) {
    return "available";
  }

  return isLessonCompleted(progress, orderedLessonIds[index - 1]) ? "available" : "locked";
}

export function mergeQuizResult(
  progress: ProgressState,
  lessonId: string,
  correctAnswers: number,
  totalQuestions: number,
  percent: number,
  attemptedAt = new Date().toISOString()
): ProgressState {
  const previous = progress.quizResults[lessonId];
  const passed = percent >= PASSING_SCORE || Boolean(previous?.passed);
  const completedLessonIds = passed
    ? Array.from(new Set([...progress.completedLessonIds, lessonId]))
    : progress.completedLessonIds.filter((id) => id !== lessonId);

  return {
    completedLessonIds,
    quizResults: {
      ...progress.quizResults,
      [lessonId]: {
        lessonId,
        attempts: (previous?.attempts || 0) + 1,
        bestPercent: Math.max(previous?.bestPercent || 0, percent),
        lastPercent: percent,
        correctAnswers,
        totalQuestions,
        passed,
        lastAttemptAt: attemptedAt
      }
    },
    lastActivityAt: attemptedAt
  };
}

export function getNextLessonId(orderedLessonIds: string[], progress: ProgressState) {
  return orderedLessonIds.find((lessonId) => !isLessonCompleted(progress, lessonId)) || null;
}

export function getCourseStats(modules: CourseModule[], progress: ProgressState) {
  const orderedLessonIds = flattenLessonIds(modules);
  const totalLessons = orderedLessonIds.length;
  const completedLessons = orderedLessonIds.filter((lessonId) =>
    isLessonCompleted(progress, lessonId)
  ).length;
  const completedModules = modules.filter((module) =>
    module.lessons.every((lesson) => isLessonCompleted(progress, lesson.id))
  ).length;
  const results = orderedLessonIds
    .map((lessonId) => progress.quizResults[lessonId])
    .filter(Boolean);
  const averageBestScore =
    results.length === 0
      ? 0
      : Math.round(results.reduce((sum, result) => sum + result.bestPercent, 0) / results.length);

  return {
    totalLessons,
    completedLessons,
    totalModules: modules.length,
    completedModules,
    coursePercent: totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100),
    averageBestScore,
    nextLessonId: getNextLessonId(orderedLessonIds, progress),
    finalStatus:
      completedLessons === totalLessons
        ? "Курс завершен"
        : completedLessons === 0
          ? "Курс еще не начат"
          : "Курс в процессе"
  };
}
