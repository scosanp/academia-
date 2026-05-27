import { Link } from "react-router-dom";
import type { Lesson, LessonStatus, QuizResult } from "../types/course";

type LessonCardProps = {
  lesson: Lesson;
  status: LessonStatus;
  result?: QuizResult;
};

const statusLabel: Record<LessonStatus, string> = {
  available: "Доступен",
  completed: "Пройден",
  locked: "Заблокирован"
};

export function LessonCard({ lesson, status, result }: LessonCardProps) {
  const isLocked = status === "locked";
  const actionLabel = status === "completed" ? "Повторить" : "Открыть";

  return (
    <article className={`lesson-card lesson-card--${status}`}>
      <div className="lesson-card__top">
        <span className="eyebrow">{lesson.durationMinutes} мин</span>
        <span className={`status status--${status}`}>{statusLabel[status]}</span>
      </div>
      <h3>{lesson.title}</h3>
      <p>{lesson.keyTakeaway}</p>
      {result ? (
        <span className="lesson-card__score">Лучший тест: {result.bestPercent}%</span>
      ) : (
        <span className="lesson-card__score">Тест еще не пройден</span>
      )}
      {isLocked ? (
        <button className="glass-button glass-button--disabled" type="button" disabled>
          Сначала пройдите предыдущий урок
        </button>
      ) : (
        <Link className="glass-button" to={`/lesson/${lesson.id}`}>
          {actionLabel}
        </Link>
      )}
    </article>
  );
}
