import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <section className="page-section">
      <div className="empty-state">
        <span className="eyebrow">404</span>
        <h1>Страница не найдена</h1>
        <p>Такого раздела нет. Вернитесь к курсу или откройте базу знаний.</p>
        <div className="hero-actions">
          <Link className="glass-button glass-button--primary" to="/course">
            К курсу
          </Link>
          <Link className="glass-button glass-button--quiet" to="/knowledge">
            База знаний
          </Link>
        </div>
      </div>
    </section>
  );
}
