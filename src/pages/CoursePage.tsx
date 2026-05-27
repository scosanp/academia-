import { courseModules } from "../data/course";
import { useProgress } from "../hooks/useProgress";
import { LessonCard } from "../components/LessonCard";
import { ProgressBar } from "../components/ProgressBar";
import { StorageNotice } from "../components/StorageNotice";

export function CoursePage() {
  const { persistent, progress, stats, statusForLesson } = useProgress();

  return (
    <section className="page-section">
      <StorageNotice persistent={persistent} />
      <div className="page-heading">
        <span className="eyebrow">Линейное прохождение</span>
        <h1>Курс</h1>
        <p>
          Уроки открываются последовательно. Чтобы перейти дальше, пройдите тест урока на 70% или
          выше.
        </p>
      </div>

      <div className="glass-panel progress-panel">
        <ProgressBar value={stats.coursePercent} label="Прогресс курса" />
        <div className="stat-row">
          <span>{stats.completedLessons} из {stats.totalLessons} уроков</span>
          <span>{stats.completedModules} из {stats.totalModules} модулей</span>
          <span>Средний тест: {stats.averageBestScore}%</span>
        </div>
      </div>

      <div className="course-list">
        {courseModules.map((module) => (
          <section className="module-section" key={module.id}>
            <div className="module-section__heading">
              <span className="module-number">{String(module.order).padStart(2, "0")}</span>
              <div>
                <h2>{module.title}</h2>
                <p>{module.description}</p>
                <small>{module.durationLabel}</small>
              </div>
            </div>
            <div className="lesson-grid">
              {module.lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  status={statusForLesson(lesson.id)}
                  result={progress.quizResults[lesson.id]}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
