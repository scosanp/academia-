import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getLessonById, lessonIds } from "../data/course";
import { QuizOption } from "../components/QuizOption";
import { StorageNotice } from "../components/StorageNotice";
import { useProgress } from "../hooks/useProgress";
import type { AnswerMap, QuizScore } from "../lib/quiz";

export function QuizPage() {
  const { lessonId } = useParams();
  const lesson = lessonId ? getLessonById(lessonId) : undefined;
  const { persistent, saveQuizAttempt, statusForLesson } = useProgress();
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [score, setScore] = useState<QuizScore | null>(null);

  const nextLessonId = useMemo(() => {
    if (!lesson) {
      return null;
    }

    const index = lessonIds.indexOf(lesson.id);
    return index >= 0 ? lessonIds[index + 1] || null : null;
  }, [lesson]);

  if (!lesson) {
    return (
      <section className="page-section">
        <div className="empty-state">
          <h1>Тест не найден</h1>
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
          <span className="eyebrow">Тест заблокирован</span>
          <h1>{lesson.title}</h1>
          <p>Сначала пройдите предыдущий урок и его тест.</p>
          <Link className="glass-button" to="/course">
            Открыть курс
          </Link>
        </div>
      </section>
    );
  }

  const question = lesson.quiz[questionIndex];
  const selectedIndex = answers[question.id];
  const isLastQuestion = questionIndex === lesson.quiz.length - 1;

  const selectAnswer = (index: number) => {
    if (answers[question.id] !== undefined) {
      return;
    }

    setAnswers((current) => ({ ...current, [question.id]: index }));
  };

  const goNext = () => {
    if (selectedIndex === undefined) {
      return;
    }

    if (isLastQuestion) {
      setScore(saveQuizAttempt(lesson, answers));
      return;
    }

    setQuestionIndex((current) => current + 1);
  };

  const restart = () => {
    setQuestionIndex(0);
    setAnswers({});
    setScore(null);
  };

  if (score) {
    const passed = score.percent >= 70;

    return (
      <section className="page-section">
        <StorageNotice persistent={persistent} />
        <div className={`result-panel ${passed ? "result-panel--pass" : "result-panel--fail"}`}>
          <span className="eyebrow">Результат теста</span>
          <h1>{score.percent}%</h1>
          <p>
            Верных ответов: {score.correctAnswers} из {score.totalQuestions}.{" "}
            {passed
              ? "Урок засчитан, следующий шаг открыт."
              : "Нужно 70% или выше. Повторите урок и попробуйте еще раз."}
          </p>
          <div className="hero-actions">
            {passed && nextLessonId ? (
              <Link className="glass-button glass-button--primary" to={`/lesson/${nextLessonId}`}>
                Следующий урок
              </Link>
            ) : null}
            <button className="glass-button" type="button" onClick={restart}>
              Пройти тест повторно
            </button>
            <Link className="glass-button glass-button--quiet" to="/progress">
              Открыть прогресс
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-section quiz-page">
      <StorageNotice persistent={persistent} />
      <div className="page-heading">
        <span className="eyebrow">
          Вопрос {questionIndex + 1} из {lesson.quiz.length}
        </span>
        <h1>{lesson.title}</h1>
      </div>

      <div className="quiz-card">
        <h2>{question.question}</h2>
        <div className="quiz-options">
          {question.options.map((option, index) => (
            <QuizOption
              key={option}
              question={question}
              option={option}
              index={index}
              selectedIndex={selectedIndex}
              onSelect={selectAnswer}
            />
          ))}
        </div>

        {selectedIndex !== undefined ? (
          <div className="feedback" role="status">
            <strong>
              {selectedIndex === question.correctIndex ? "Верно" : "Неверно"}
            </strong>
            <p>{question.explanation}</p>
          </div>
        ) : null}

        <button
          className="glass-button glass-button--primary"
          type="button"
          onClick={goNext}
          disabled={selectedIndex === undefined}
        >
          {isLastQuestion ? "Завершить тест" : "Следующий вопрос"}
        </button>
      </div>
    </section>
  );
}
