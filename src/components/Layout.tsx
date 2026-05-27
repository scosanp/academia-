import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/course", label: "Курс" },
  { to: "/knowledge", label: "База знаний" },
  { to: "/progress", label: "Прогресс" },
  { to: "/faq", label: "FAQ" }
];

export function Layout() {
  return (
    <div className="min-h-screen">
      <header className="site-header">
        <div className="site-header__inner">
          <NavLink className="brand" to="/" aria-label="AI Start">
            <span className="brand__mark" aria-hidden="true">
              AI
            </span>
            <span className="brand__text">AI Start</span>
          </NavLink>

          <nav className="main-nav" aria-label="Основная навигация">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => (isActive ? "main-nav__link is-active" : "main-nav__link")}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main id="main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div>
          <strong>AI Start: ChatGPT и промпты с нуля</strong>
          <p>Статический курс без backend и без API-ключей на фронтенде.</p>
        </div>
        <a className="glass-link" href="#/course">
          Продолжить обучение
        </a>
      </footer>
    </div>
  );
}
