import { useCallback, useMemo, useState } from "react";
import { courseModules, lessonIds } from "../data/course";
import { type AnswerMap, scoreQuiz } from "../lib/quiz";
import {
  createEmptyProgress,
  getCourseStats,
  getLessonStatus,
  mergeQuizResult
} from "../lib/progress";
import {
  clearProgressStorage,
  loadProgressFromStorage,
  saveProgressToStorage
} from "../lib/storage";
import type { Lesson, ProgressState } from "../types/course";

export function useProgress() {
  const initial = useMemo(() => loadProgressFromStorage(), []);
  const [progress, setProgress] = useState<ProgressState>(initial.progress);
  const [persistent, setPersistent] = useState(initial.persistent);

  const commit = useCallback((next: ProgressState) => {
    setProgress(next);
    setPersistent(saveProgressToStorage(next));
  }, []);

  const saveQuizAttempt = useCallback(
    (lesson: Lesson, answers: AnswerMap) => {
      const score = scoreQuiz(lesson.quiz, answers);
      const next = mergeQuizResult(
        progress,
        lesson.id,
        score.correctAnswers,
        score.totalQuestions,
        score.percent
      );
      commit(next);
      return score;
    },
    [commit, progress]
  );

  const resetProgress = useCallback(() => {
    clearProgressStorage();
    const empty = createEmptyProgress();
    setProgress(empty);
    setPersistent(saveProgressToStorage(empty));
  }, []);

  return {
    progress,
    persistent,
    stats: getCourseStats(courseModules, progress),
    statusForLesson: (lessonId: string) => getLessonStatus(lessonId, lessonIds, progress),
    saveQuizAttempt,
    resetProgress
  };
}
