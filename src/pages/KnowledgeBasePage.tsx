import { useMemo, useState } from "react";
import { knowledgeBase, knowledgeCategories } from "../data/knowledgeBase";
import type { KnowledgeCategory } from "../types/course";

type CategoryFilter = KnowledgeCategory | "Все";

export function KnowledgeBasePage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("Все");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return knowledgeBase.filter((card) => {
      const matchesCategory = category === "Все" || card.category === category;
      const haystack = `${card.title} ${card.summary} ${card.example}`.toLowerCase();
      const matchesQuery = normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <section className="page-section">
      <div className="page-heading">
        <span className="eyebrow">42 материала</span>
        <h1>Информационная база</h1>
        <p>Термины, приемы, шаблоны и практические советы по ИИ, ChatGPT и промптам.</p>
      </div>

      <div className="knowledge-controls">
        <label>
          <span>Поиск</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Например: контекст, безопасность, таблицы"
          />
        </label>
        <div className="category-tabs" aria-label="Категории базы знаний">
          <button
            className={category === "Все" ? "is-active" : ""}
            type="button"
            onClick={() => setCategory("Все")}
          >
            Все
          </button>
          {knowledgeCategories.map((item) => (
            <button
              className={category === item ? "is-active" : ""}
              key={item}
              type="button"
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="knowledge-grid">
        {filtered.map((card) => (
          <article className="knowledge-card" key={card.id}>
            <span className="eyebrow">{card.category}</span>
            <h2>{card.title}</h2>
            <p>{card.summary}</p>
            <small>{card.example}</small>
          </article>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <h2>Ничего не найдено</h2>
          <p>Попробуйте другой термин или сбросьте фильтр категории.</p>
        </div>
      ) : null}
    </section>
  );
}
