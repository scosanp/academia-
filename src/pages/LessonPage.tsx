import { Link, useParams } from "react-router-dom";
import { getLessonById, getModuleByLessonId } from "../data/course";
import { useProgress } from "../hooks/useProgress";
import { StorageNotice } from "../components/StorageNotice";

export function LessonPage() {
  const { lessonId } = useParams();
  const lesson = lessonId ? getLessonById(lessonId) : undefined;
  const module = lesson ? getModuleByLessonId(lesson.id) : undefined;
  const { persistent, statusForLesson } = useProgress();

  if (!lesson || !module) {
    return (
      <section className="page-section">
        <div className="empty-state">
          <h1>Урок не найден</h1>
          <p>Возможно, ссылка устарела или урок был перемещен.</p>
          <Link className="glass-button" to="/course">
            Вернуться к курсу
          </Link>
        </div>
      </section>
    );
  }

  const status = statusForLesson(lesson.id);
  if (status === "locked") {
    return (
      <section className="page-section">
        <StorageNotice persistent={persistent} />
        <div className="empty-state">
          <span className="eyebrow">Урок заблокирован</span>
          <h1>{lesson.title}</h1>
          <p>Этот урок откроется после прохождения предыдущего теста на 70% или выше.</p>
          <Link className="glass-button" to="/course">
            Открыть список уроков
          </Link>
        </div>
      </section>
    );
  }

  return (
    <article className="page-section lesson-page">
      <StorageNotice persistent={persistent} />
      <div className="page-heading">
        <span className="eyebrow">{module.title} · {lesson.durationMinutes} мин</span>
        <h1>{lesson.title}</h1>
      </div>

      <section className="lesson-block">
        <h2>Теория</h2>
        {lesson.theory.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <section className="lesson-block">
        <h2>Примеры промптов</h2>
        <div className="prompt-list">
          {lesson.examples.map((example) => (
            <p key={example}>{example}</p>
          ))}
        </div>
      </section>

      <section className="lesson-block lesson-block--split">
        <div>
          <h2>Мини-практика</h2>
          <p>{lesson.practiceTask}</p>
        </div>
        <div className="takeaway">
          <span className="eyebrow">Главная мысль урока</span>
          <p>{lesson.keyTakeaway}</p>
        </div>
      </section>

      <div className="lesson-actions">
        <Link className="glass-button glass-button--primary" to={`/quiz/${lesson.id}`}>
          Перейти к тесту
        </Link>
        <Link className="glass-button glass-button--quiet" to="/course">
          К списку уроков
        </Link>
      </div>
    </article>
  );
}
