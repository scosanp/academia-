import { Link } from "react-router-dom";
import { allLessons } from "../data/course";
import { ProgressBar } from "../components/ProgressBar";
import { StorageNotice } from "../components/StorageNotice";
import { useProgress } from "../hooks/useProgress";

export function ProgressPage() {
  const { persistent, progress, resetProgress, stats } = useProgress();
  const nextLesson = stats.nextLessonId
    ? allLessons.find((lesson) => lesson.id === stats.nextLessonId)
    : null;
  const results = allLessons
    .map((lesson) => ({ lesson, result: progress.quizResults[lesson.id] }))
    .filter((item) => item.result);

  const handleReset = () => {
    if (window.confirm("Сбросить весь прогресс курса? Это действие нельзя отменить.")) {
      resetProgress();
    }
  };

  return (
    <section className="page-section">
      <StorageNotice persistent={persistent} />
      <div className="page-heading">
        <span className="eyebrow">{stats.finalStatus}</span>
        <h1>Прогресс</h1>
        <p>Здесь видно, сколько уроков и модулей завершено, какой средний результат тестов и что проходить дальше.</p>
      </div>

      <div className="progress-dashboard">
        <div className="glass-panel">
          <ProgressBar value={stats.coursePercent} label="Курс завершен" />
          <div className="stat-grid">
            <div>
              <strong>{stats.completedLessons}/{stats.totalLessons}</strong>
              <span>уроков</span>
            </div>
            <div>
              <strong>{stats.completedModules}/{stats.totalModules}</strong>
              <span>модулей</span>
            </div>
            <div>
              <strong>{stats.averageBestScore}%</strong>
              <span>средний тест</span>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <span className="eyebrow">Рекомендация</span>
          {nextLesson ? (
            <>
              <h2>{nextLesson.title}</h2>
              <p>{nextLesson.keyTakeaway}</p>
              <Link className="glass-button glass-button--primary" to={`/lesson/${nextLesson.id}`}>
                Продолжить
              </Link>
            </>
          ) : (
            <>
              <h2>Курс завершен</h2>
              <p>Пора применить библиотеку промптов в реальной задаче и улучшить ее по опыту.</p>
              <Link className="glass-button" to="/knowledge">
                Повторить базу знаний
              </Link>
            </>
          )}
        </div>
      </div>

      <section className="results-list">
        <div className="section-heading">
          <span className="eyebrow">История тестов</span>
          <h2>Лучшие результаты по урокам</h2>
        </div>
        {results.length === 0 ? (
          <p className="muted">Пока нет сохраненных результатов. Первый тест появится здесь после прохождения.</p>
        ) : (
          <div className="knowledge-grid knowledge-grid--compact">
            {results.map(({ lesson, result }) => (
              <article className="knowledge-card" key={lesson.id}>
                <h3>{lesson.title}</h3>
                <p>Лучший результат: {result?.bestPercent}%</p>
                <small>Попыток: {result?.attempts}</small>
              </article>
            ))}
          </div>
        )}
      </section>

      <button className="glass-button glass-button--danger" type="button" onClick={handleReset}>
        Сбросить прогресс
      </button>
    </section>
  );
}
