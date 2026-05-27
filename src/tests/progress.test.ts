import { describe, expect, it } from "vitest";
import { courseModules, lessonIds } from "../data/course";
import {
  createEmptyProgress,
  getCourseStats,
  getLessonStatus,
  mergeQuizResult,
  PASSING_SCORE
} from "../lib/progress";

describe("progress logic", () => {
  it("locks lessons until the previous lesson is completed", () => {
    const progress = createEmptyProgress();

    expect(getLessonStatus(lessonIds[0], lessonIds, progress)).toBe("available");
    expect(getLessonStatus(lessonIds[1], lessonIds, progress)).toBe("locked");
  });

  it("saves passed quiz and unlocks the next lesson", () => {
    const progress = mergeQuizResult(createEmptyProgress(), lessonIds[0], 3, 4, 75);

    expect(progress.completedLessonIds).toContain(lessonIds[0]);
    expect(progress.quizResults[lessonIds[0]].bestPercent).toBeGreaterThanOrEqual(PASSING_SCORE);
    expect(getLessonStatus(lessonIds[1], lessonIds, progress)).toBe("available");
  });

  it("keeps best score when a repeated attempt is lower", () => {
    const first = mergeQuizResult(createEmptyProgress(), lessonIds[0], 4, 4, 100);
    const second = mergeQuizResult(first, lessonIds[0], 2, 4, 50);

    expect(second.quizResults[lessonIds[0]].attempts).toBe(2);
    expect(second.quizResults[lessonIds[0]].bestPercent).toBe(100);
    expect(second.completedLessonIds).toContain(lessonIds[0]);
  });

  it("calculates course stats from completed lessons and tests", () => {
    const progress = mergeQuizResult(createEmptyProgress(), lessonIds[0], 4, 4, 100);
    const stats = getCourseStats(courseModules, progress);

    expect(stats.completedLessons).toBe(1);
    expect(stats.totalLessons).toBe(30);
    expect(stats.averageBestScore).toBe(100);
  });
});
