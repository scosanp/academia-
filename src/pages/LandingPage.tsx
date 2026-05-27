import { Link } from "react-router-dom";
import { courseModules, totalDurationMinutes } from "../data/course";
import { useProgress } from "../hooks/useProgress";
import { ProgressBar } from "../components/ProgressBar";

const outcomes = [
  "Писать структурированные промпты под реальные задачи",
  "Проверять ответы ИИ и снижать риск ошибок",
  "Использовать ChatGPT для текстов, обучения, документов и анализа",
  "Собрать личную библиотеку промптов и рабочий AI-процесс"
];

const flow = [
  "Изучаете короткую теорию",
  "Смотрите пример плохого и сильного промпта",
  "Делаете мини-практику",
  "Проходите тест и открываете следующий урок"
];

export function LandingPage() {
  const { stats } = useProgress();
  const hours = Math.round(totalDurationMinutes / 60);
  const heroImage = `${import.meta.env.BASE_URL}hero-ai-course.png`;

  return (
    <>
      <section className="hero-section">
        <div className="hero-section__content">
          <span className="eyebrow">Интерактивный курс для новичков</span>
          <h1>AI Start: ChatGPT и промпты с нуля</h1>
          <p>
            Линейный курс на русском языке: от базового понимания ИИ до личного набора
            промптов, проверки фактов и рабочих сценариев.
          </p>
          <div className="hero-actions">
            <Link className="glass-button glass-button--primary" to="/course">
              Начать обучение
            </Link>
            <Link className="glass-button glass-button--quiet" to="/knowledge">
              Открыть базу знаний
            </Link>
          </div>
          <div className="hero-metrics" aria-label="Сводка курса">
            <span>{courseModules.length} модулей</span>
            <span>30 уроков</span>
            <span>{hours} часов практики</span>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <img src={heroImage} alt="" />
        </div>
      </section>

      <section className="section-grid section-grid--two">
        <div>
          <span className="eyebrow">Ценность курса</span>
          <h2>Не набор трюков, а понятная система работы с ИИ</h2>
        </div>
        <div className="glass-panel">
          <p>
            Курс помогает перейти от случайных запросов к управляемому процессу: ставить задачу,
            давать контекст, просить проверку, улучшать ответ и применять результат в работе.
          </p>
          <ProgressBar value={stats.coursePercent} label="Ваш текущий прогресс" />
        </div>
      </section>

      <section className="content-band">
        <div className="section-heading">
          <span className="eyebrow">Структура курса</span>
          <h2>От первого диалога до финального AI-процесса</h2>
        </div>
        <div className="module-strip">
          {courseModules.map((module) => (
            <article className="module-chip" key={module.id}>
              <span>{String(module.order).padStart(2, "0")}</span>
              <strong>{module.title}</strong>
              <small>{module.lessons.length} урока</small>
            </article>
          ))}
        </div>
      </section>

      <section className="section-grid section-grid--two">
        <div className="list-block">
          <span className="eyebrow">Что вы научитесь делать</span>
          <h2>Практика вместо магического мышления</h2>
          <ul className="check-list">
            {outcomes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="list-block">
          <span className="eyebrow">Как проходит обучение</span>
          <h2>Короткий цикл в каждом уроке</h2>
          <ol className="step-list">
            {flow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
