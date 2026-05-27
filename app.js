const STORAGE_KEY = "rezumeprofi_state_v1";

const templates = [
  { id: "classic", name: "Классический" },
  { id: "executive", name: "Руководитель" },
  { id: "production", name: "Производство" },
  { id: "modern", name: "Современный" }
];

const steps = [
  "Личные данные",
  "Цель",
  "Опыт",
  "Навыки",
  "Образование",
  "Проверка"
];

const supportGoals = {
  write_from_zero: "Написать с нуля",
  improve_existing: "Улучшить готовое",
  adapt_for_job: "Подстроить под вакансию",
  career_consultation: "Карьерная консультация",
  other: "Другое"
};

const emptyResume = () => ({
  id: crypto.randomUUID(),
  mode: "quick",
  status: "draft",
  templateId: "classic",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {
    showAge: false,
    showSalary: false,
    showPhoto: false
  },
  personal: {
    fullName: "",
    city: "",
    phone: "",
    email: "",
    age: ""
  },
  target: {
    position: "",
    specialization: "",
    schedule: "",
    salary: ""
  },
  experience: [
    {
      company: "",
      position: "",
      period: "",
      responsibilities: "",
      achievements: "",
      tools: ""
    }
  ],
  skills: {
    hard: "",
    soft: "",
    tools: "",
    languages: ""
  },
  education: {
    institution: "",
    field: "",
    year: "",
    certificates: ""
  },
  generated: null,
  rawUpload: "",
  warnings: []
});

const state = loadState();
let activeStep = Number(sessionStorage.getItem("rezumeprofi_step") || 0);
let deepAnswers = JSON.parse(sessionStorage.getItem("rezumeprofi_deep_answers") || "[]");
let deepMessages = JSON.parse(sessionStorage.getItem("rezumeprofi_deep_messages") || "[]");
let extractedResume = null;
let toastTimer = null;

function loadState() {
  const fallback = {
    resumes: [],
    manualReviews: [],
    supportRequests: [],
    activeResumeId: null
  };

  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function xmlEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function splitList(value) {
  return String(value || "")
    .split(/[\n,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function getActiveResume() {
  if (!state.activeResumeId && state.resumes.length) {
    state.activeResumeId = state.resumes[0].id;
  }

  return state.resumes.find((resume) => resume.id === state.activeResumeId) || null;
}

function setActiveResume(resume) {
  const index = state.resumes.findIndex((item) => item.id === resume.id);
  resume.updatedAt = new Date().toISOString();

  if (index >= 0) {
    state.resumes[index] = resume;
  } else {
    state.resumes.unshift(resume);
  }

  state.activeResumeId = resume.id;
  saveState();
}

function ensureResume(mode = "quick") {
  const current = getActiveResume();
  if (current) {
    current.mode = mode;
    setActiveResume(current);
    return current;
  }

  const resume = emptyResume();
  resume.mode = mode;
  setActiveResume(resume);
  return resume;
}

function navigate(route) {
  window.location.hash = route;
}

function currentRoute() {
  const hash = window.location.hash.replace("#", "");
  return hash || "home";
}

function toast(message) {
  const node = document.querySelector("#toast");
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("show"), 3200);
}

function appShell(content) {
  const route = currentRoute();
  const nav = [
    ["home", "Главная"],
    ["builder/quick", "Быстрый режим"],
    ["builder/deep", "Чат"],
    ["builder/upload", "Загрузка"],
    ["dashboard", "Мои резюме"],
    ["admin", "Админка"]
  ];

  return `
    <div class="app-shell">
      <header class="topbar">
        <div class="topbar-inner">
          <a class="brand" href="#home" aria-label="РезюмеПрофи">
            <span class="brand-mark" aria-hidden="true">Р</span>
            <span>РезюмеПрофи</span>
          </a>
          <nav class="nav" aria-label="Основная навигация">
            ${nav
              .map(([href, label]) => {
                const active = route === href || route.startsWith(`${href}/`);
                return `<a href="#${href}" ${active ? 'aria-current="page"' : ""}>${label}</a>`;
              })
              .join("")}
            <a class="button button-primary" href="#support/personal">Сопровождение</a>
          </nav>
        </div>
      </header>
      <main id="app-main">${content}</main>
      <footer class="footer">
        <div class="section">
          <div>РезюмеПрофи, бесплатный MVP-прототип</div>
          <nav class="nav" aria-label="Правовые страницы">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
            <a href="#consent">Consent</a>
          </nav>
        </div>
      </footer>
    </div>
  `;
}

function renderHome() {
  return appShell(`
    <section class="hero">
      <div class="section">
        <div>
          <h1>Сделаем современное резюме из вашего опыта</h1>
          <p>Ответьте на простые вопросы о работе, навыках и достижениях. Сервис соберет аккуратный документ для отправки работодателю.</p>
          <div class="hero-actions">
            <a class="button button-primary" href="#builder/quick">Сделать быстрое резюме</a>
            <a class="button button-blue" href="#builder/deep">Сделать подробное резюме</a>
            <a class="button button-ghost" href="#support/personal">Получить личное сопровождение</a>
          </div>
        </div>
        <div class="hero-panel" aria-label="Пример рабочего экрана">
          <div class="hero-panel-head">
            <strong>Черновик резюме</strong>
            <span class="status-dot" aria-hidden="true"></span>
          </div>
          <div class="mini-builder">
            <div class="mini-row">
              <span class="mini-label">Должность</span>
              <span class="mini-value">Начальник смены</span>
            </div>
            <div class="mini-row">
              <span class="mini-label">Опыт</span>
              <span class="mini-value">12 лет, производство и команда</span>
            </div>
            <div class="mini-row">
              <span class="mini-label">Результат</span>
              <span class="mini-value">Четкие обязанности, навыки, PDF и DOCX</span>
            </div>
          </div>
          <div class="resume-paper-small">
            <div class="paper-lines" aria-hidden="true">
              <span class="paper-line short"></span>
              <span class="paper-line medium"></span>
              <span class="paper-line"></span>
              <span class="paper-line medium"></span>
              <span class="paper-line"></span>
              <span class="paper-line short"></span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="band">
      <div class="section">
        <div class="section-head">
          <div>
            <h2>Для кого</h2>
            <p class="section-lead">Опыт можно описать современно, спокойно и без сложных терминов.</p>
          </div>
          <a class="button button-dark" href="#builder/upload">Загрузить старое резюме</a>
        </div>
        <div class="grid grid-4">
          ${[
            ["Давно не обновляли резюме", "Поможем собрать опыт в понятную структуру."],
            ["Сложно описать работу", "Можно писать простыми словами, текст будет аккуратно оформлен."],
            ["Нужен файл сегодня", "Быстрый режим доведет до экспорта за несколько минут."],
            ["Нужна помощь человека", "Оставьте заявку на созвон или ручную проверку."]
          ]
            .map(([title, text]) => `<article class="card"><h3>${title}</h3><p>${text}</p></article>`)
            .join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-head">
        <div>
          <h2>Как меняются формулировки</h2>
          <p class="section-lead">Факты остаются вашими, меняется только подача.</p>
        </div>
      </div>
      <div class="grid grid-3">
        ${[
          ["Следил за работой смены", "Координировал работу смены, контролировал выполнение плана и соблюдение сроков."],
          ["Работал с клиентами", "Консультировал клиентов, обрабатывал обращения и поддерживал повторные продажи."],
          ["Делал документы", "Готовил и проверял рабочую документацию, снижая количество ошибок в передаче данных."]
        ]
          .map(
            ([before, after]) => `
              <article class="card example">
                <div class="example-before">${before}</div>
                <div class="example-after">${after}</div>
              </article>
            `
          )
          .join("")}
      </div>
    </section>

    <section class="band">
      <div class="section">
        <div class="grid grid-3">
          <article class="card">
            <h3>Быстрый мастер</h3>
            <p>Карточки с основными полями, автосохранение и живой предпросмотр.</p>
          </article>
          <article class="card">
            <h3>Подробный чат</h3>
            <p>Помощник задает короткие вопросы и помогает вспомнить результаты.</p>
          </article>
          <article class="card">
            <h3>Проверка человеком</h3>
            <p>Заявка на ручную проверку и отдельная заявка на личное сопровождение.</p>
          </article>
        </div>
      </div>
    </section>
  `);
}

function renderBuilder(mode) {
  const resume = ensureResume(mode);
  const isQuick = mode === "quick";
  const title = isQuick ? "Быстрое резюме" : "Подробное резюме";

  if (!isQuick) {
    return renderDeepBuilder(resume);
  }

  return appShell(`
    <section class="builder-layout">
      ${renderSidebar(activeStep, resume)}
      <section class="workspace">
        <h1 class="builder-title">${title}</h1>
        <p class="muted">Данные сохраняются в браузере после каждого шага.</p>
        ${renderQuickStep(resume)}
      </section>
      <aside class="preview-panel" aria-label="Живой предпросмотр">
        ${renderResumePreview(resume, true)}
      </aside>
    </section>
  `);
}

function renderSidebar(stepIndex, resume) {
  return `
    <aside class="sidebar">
      <strong>Прогресс</strong>
      <ol class="progress-list">
        ${steps
          .map(
            (step, index) => `
              <li class="${index === stepIndex ? "active" : ""}">
                <span class="progress-index">${index + 1}</span>
                <span>${step}</span>
              </li>
            `
          )
          .join("")}
      </ol>
      <div class="actions">
        <a class="button button-light" href="#support/personal">Нужна помощь?</a>
        <a class="button button-dark" href="#resume/${resume.id}">К предпросмотру</a>
      </div>
    </aside>
  `;
}

function renderQuickStep(resume) {
  const step = activeStep;
  const controls = `
    <div class="actions" style="margin-top: 20px;">
      <button class="button button-light" data-action="prev-step" ${step === 0 ? "disabled" : ""}>Назад</button>
      <button class="button button-primary" data-action="${step === steps.length - 1 ? "generate-resume" : "next-step"}">
        ${step === steps.length - 1 ? "Собрать резюме" : "Дальше"}
      </button>
    </div>
  `;

  const fields = [
    personalFields(resume),
    targetFields(resume),
    experienceFields(resume),
    skillsFields(resume),
    educationFields(resume),
    reviewFields(resume)
  ][step];

  return `${fields}${controls}`;
}

function personalFields(resume) {
  return `
    <div class="field-grid">
      ${input("ФИО", "personal.fullName", resume.personal.fullName, "Например, Иван Петров")}
      ${input("Город", "personal.city", resume.personal.city, "Москва")}
      ${input("Телефон", "personal.phone", resume.personal.phone, "+7 ...")}
      ${input("Email", "personal.email", resume.personal.email, "name@mail.ru")}
      ${input("Возраст", "personal.age", resume.personal.age, "Необязательно", "number")}
      <label class="checkbox-label">
        <input type="checkbox" data-field="settings.showAge" ${resume.settings.showAge ? "checked" : ""}>
        Показывать возраст в резюме
      </label>
    </div>
  `;
}

function targetFields(resume) {
  return `
    <div class="field-grid">
      ${input("Желаемая должность", "target.position", resume.target.position, "Например, мастер участка")}
      ${input("Сфера", "target.specialization", resume.target.specialization, "Производство, офис, продажи")}
      ${input("Формат и график", "target.schedule", resume.target.schedule, "Полный день, сменный график")}
      ${input("Желаемая зарплата", "target.salary", resume.target.salary, "Необязательно")}
      <label class="checkbox-label">
        <input type="checkbox" data-field="settings.showSalary" ${resume.settings.showSalary ? "checked" : ""}>
        Показывать зарплату
      </label>
    </div>
  `;
}

function experienceFields(resume) {
  const exp = resume.experience[0] || {};
  return `
    <div class="field-grid">
      ${input("Компания", "experience.0.company", exp.company || "", "Последнее место работы")}
      ${input("Должность", "experience.0.position", exp.position || "", "Ваша роль")}
      ${input("Период", "experience.0.period", exp.period || "", "2018-2026")}
      ${textarea("Обязанности", "experience.0.responsibilities", exp.responsibilities || "", "Что делали каждый день")}
      ${textarea("Достижения", "experience.0.achievements", exp.achievements || "", "Что получилось улучшить, ускорить, наладить")}
      ${textarea("Инструменты и оборудование", "experience.0.tools", exp.tools || "", "Программы, станки, документы, системы")}
    </div>
  `;
}

function skillsFields(resume) {
  return `
    <div class="field-grid">
      ${textarea("Профессиональные навыки", "skills.hard", resume.skills.hard, "Контроль качества, продажи, документооборот")}
      ${textarea("Личные качества", "skills.soft", resume.skills.soft, "Ответственность, внимательность, спокойная коммуникация")}
      ${textarea("Программы и инструменты", "skills.tools", resume.skills.tools, "1С, Excel, CRM, оборудование")}
      ${textarea("Языки", "skills.languages", resume.skills.languages, "Русский, английский базовый")}
    </div>
  `;
}

function educationFields(resume) {
  return `
    <div class="field-grid">
      ${input("Учебное заведение", "education.institution", resume.education.institution, "Необязательно")}
      ${input("Специальность", "education.field", resume.education.field, "Необязательно")}
      ${input("Год окончания", "education.year", resume.education.year, "2008")}
      ${textarea("Курсы и сертификаты", "education.certificates", resume.education.certificates, "Охрана труда, 1С, управление персоналом")}
    </div>
  `;
}

function reviewFields(resume) {
  return `
    <div class="notice">Проверьте данные перед генерацией. Если чего-то не хватает, можно вернуться назад.</div>
    <div class="grid grid-2" style="margin-top: 16px;">
      <article class="card">
        <h3>${escapeHtml(resume.personal.fullName || "ФИО не указано")}</h3>
        <p>${escapeHtml(resume.target.position || "Должность не указана")}</p>
      </article>
      <article class="card">
        <h3>Контакты</h3>
        <p>${escapeHtml([resume.personal.phone, resume.personal.email, resume.personal.city].filter(Boolean).join(", ") || "Контакты не указаны")}</p>
      </article>
      <article class="card">
        <h3>Опыт</h3>
        <p>${escapeHtml((resume.experience[0] && resume.experience[0].responsibilities) || "Опыт не заполнен")}</p>
      </article>
      <article class="card">
        <h3>Навыки</h3>
        <p>${escapeHtml(resume.skills.hard || "Навыки не заполнены")}</p>
      </article>
    </div>
  `;
}

function input(label, field, value, placeholder = "", type = "text") {
  return `
    <div class="field">
      <label for="${field}">${label}</label>
      <input id="${field}" type="${type}" data-field="${field}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}">
    </div>
  `;
}

function textarea(label, field, value, placeholder = "") {
  return `
    <div class="field full">
      <label for="${field}">${label}</label>
      <textarea id="${field}" data-field="${field}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(value)}</textarea>
    </div>
  `;
}

function setByPath(target, path, value) {
  const parts = path.split(".");
  let current = target;
  parts.forEach((part, index) => {
    const isLast = index === parts.length - 1;
    if (isLast) {
      current[part] = value;
      return;
    }
    if (!(part in current)) {
      current[part] = Number.isFinite(Number(parts[index + 1])) ? [] : {};
    }
    current = current[part];
  });
}

function renderDeepBuilder(resume) {
  if (!deepMessages.length) {
    deepMessages = [
      {
        role: "bot",
        text: "На какую должность вы хотите претендовать и в какой сфере?"
      }
    ];
    saveDeepSession();
  }

  return appShell(`
    <section class="builder-layout">
      ${renderSidebar(1, resume)}
      <section class="workspace">
        <h1 class="builder-title">Подробное резюме</h1>
        <p class="muted">Пишите свободно. После нескольких ответов помощник соберет черновик.</p>
        <div class="chat-box" data-chat-box>
          ${deepMessages.map((message) => `<div class="message ${message.role}">${escapeHtml(message.text)}</div>`).join("")}
        </div>
        <div class="field" style="margin-top: 16px;">
          <label for="deep-answer">Ваш ответ</label>
          <textarea id="deep-answer" data-deep-answer placeholder="Напишите простыми словами"></textarea>
        </div>
        <div class="actions" style="margin-top: 14px;">
          <button class="button button-primary" data-action="deep-send">Отправить</button>
          <button class="button button-blue" data-action="deep-generate">Собрать черновик</button>
          <a class="button button-light" href="#support/personal">Хочу поговорить со специалистом</a>
        </div>
      </section>
      <aside class="preview-panel" aria-label="Живой предпросмотр">
        ${renderResumePreview(resume, true)}
      </aside>
    </section>
  `);
}

function saveDeepSession() {
  sessionStorage.setItem("rezumeprofi_deep_answers", JSON.stringify(deepAnswers));
  sessionStorage.setItem("rezumeprofi_deep_messages", JSON.stringify(deepMessages));
}

function nextDeepQuestion(count) {
  const questions = [
    "Расскажите о последнем месте работы: компания, должность, период и основные задачи.",
    "Какие результаты можно показать: команда, объемы, сроки, деньги, клиенты или качество?",
    "Какие навыки, программы, инструменты или оборудование важно указать?",
    "Какое образование, курсы или допуски стоит добавить?"
  ];

  return questions[Math.min(count, questions.length - 1)];
}

function applyDeepAnswers(resume) {
  const text = deepAnswers.join("\n");
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  resume.mode = "deep";
  resume.target.position = resume.target.position || findAfter(text, /(должность|позиция|хочу|претендую)[:\s-]+([^\n,.]+)/i) || "";
  resume.experience[0].responsibilities = resume.experience[0].responsibilities || lines.slice(0, 4).join("\n");
  resume.experience[0].achievements = resume.experience[0].achievements || lines.filter((line) => /\d|улучш|сократ|увелич|команд|клиент/i.test(line)).join("\n");
  resume.skills.hard = resume.skills.hard || lines.filter((line) => /навык|умею|работал|програм|оборуд|1с|excel|crm/i.test(line)).join("\n");
  generateResume(resume);
}

function findAfter(text, pattern) {
  const match = text.match(pattern);
  return match ? match[2].trim() : "";
}

function renderUpload() {
  const resume = ensureResume("upload");
  const extractedHtml = extractedResume
    ? `
      <div class="notice" style="margin-top: 16px;">Проверьте извлеченные данные перед созданием черновика.</div>
      <div class="grid grid-2" style="margin-top: 16px;">
        <article class="card"><h3>ФИО</h3><p>${escapeHtml(extractedResume.personal.fullName || "Не найдено")}</p></article>
        <article class="card"><h3>Должность</h3><p>${escapeHtml(extractedResume.target.position || "Не найдено")}</p></article>
        <article class="card"><h3>Контакты</h3><p>${escapeHtml([extractedResume.personal.phone, extractedResume.personal.email].filter(Boolean).join(", ") || "Не найдено")}</p></article>
        <article class="card"><h3>Навыки</h3><p>${escapeHtml(extractedResume.skills.hard || "Нужно проверить")}</p></article>
      </div>
      <div class="actions" style="margin-top: 16px;">
        <button class="button button-primary" data-action="confirm-extraction">Подтвердить и собрать</button>
        <button class="button button-light" data-action="reset-extraction">Загрузить другой файл</button>
      </div>
    `
    : "";

  return appShell(`
    <section class="builder-layout">
      ${renderSidebar(5, resume)}
      <section class="workspace">
        <h1 class="builder-title">Загрузка старого резюме</h1>
        <p class="muted">TXT читается полностью. PDF и DOCX в прототипе проходят mock-разбор с обязательным подтверждением.</p>
        <div class="upload-zone">
          <strong>Выберите файл резюме</strong>
          <p class="muted">Поддерживаемые форматы: PDF, DOCX, TXT. Максимальный размер для прототипа - 10 МБ.</p>
          <input type="file" data-upload accept=".txt,.pdf,.docx,.doc,.rtf,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
        </div>
        ${extractedHtml}
      </section>
      <aside class="preview-panel" aria-label="Живой предпросмотр">
        ${renderResumePreview(resume, true)}
      </aside>
    </section>
  `);
}

async function handleUpload(file) {
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) {
    toast("Файл больше 10 МБ.");
    return;
  }

  let text = "";
  if (file.name.toLowerCase().endsWith(".txt")) {
    text = await file.text();
  } else {
    text = `Файл ${file.name}. В статическом прототипе текст PDF/DOCX разбирается mock-провайдером. Проверьте поля вручную.`;
  }

  extractedResume = mockExtractResume(text, file.name);
  render();
  toast("Данные извлечены. Проверьте блоки.");
}

function mockExtractResume(text, filename) {
  const resume = emptyResume();
  resume.mode = "upload";
  resume.rawUpload = text;
  resume.personal.fullName = findLine(text, /фио|имя|name/i) || "";
  resume.personal.email = (text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [""])[0];
  resume.personal.phone = (text.match(/(?:\+7|8)?[\s(-]*\d{3}[\s)-]*\d{3}[\s-]?\d{2}[\s-]?\d{2}/) || [""])[0];
  resume.target.position = findLine(text, /должность|позиция|цель|position/i) || "";
  resume.personal.city = findLine(text, /город|city/i) || "";
  resume.experience[0].responsibilities = sliceAfter(text, /опыт|experience|обязанности/i) || text.slice(0, 500);
  resume.skills.hard = sliceAfter(text, /навыки|skills/i).slice(0, 350);
  resume.education.institution = findLine(text, /образование|education/i) || "";
  resume.warnings = [
    filename.toLowerCase().endsWith(".txt")
      ? "Проверьте перенос обязанностей и навыков."
      : "Для PDF/DOCX в прототипе используется mock-разбор. Заполните спорные поля вручную."
  ];
  return resume;
}

function findLine(text, pattern) {
  const line = text.split(/\n+/).find((item) => pattern.test(item));
  if (!line) return "";
  return line.replace(pattern, "").replace(/^[:\s-]+/, "").trim();
}

function sliceAfter(text, pattern) {
  const index = text.search(pattern);
  return index >= 0 ? text.slice(index).split(/\n\n+/)[0].trim() : "";
}

function generateResume(resume) {
  const exp = resume.experience[0] || {};
  const responsibilities = splitList(exp.responsibilities);
  const achievements = splitList(exp.achievements);
  const hardSkills = splitList(resume.skills.hard);
  const tools = splitList([resume.skills.tools, exp.tools].filter(Boolean).join("\n"));
  const missing = [];

  if (!resume.personal.fullName) missing.push("Укажите ФИО.");
  if (!resume.target.position && !exp.position) missing.push("Укажите желаемую должность.");
  if (!responsibilities.length) missing.push("Добавьте хотя бы 2-3 обязанности.");
  if (!hardSkills.length && !tools.length) missing.push("Добавьте навыки или инструменты.");

  const targetTitle = resume.target.position || exp.position || "Специалист";
  const companyPart = exp.company ? ` в ${exp.company}` : "";
  const resultPart = achievements.length
    ? ` Есть подтвержденные результаты: ${achievements.slice(0, 2).join("; ")}.`
    : "";

  resume.generated = {
    summary: `${targetTitle} с практическим опытом${companyPart}. Умеет организовывать рабочие процессы, аккуратно вести задачи и поддерживать стабильный результат.${resultPart}`.trim(),
    target_position: targetTitle,
    skills: [...hardSkills, ...tools].slice(0, 14),
    experience: [
      {
        company: exp.company || "",
        position: exp.position || targetTitle,
        period: exp.period || "",
        responsibilities: responsibilities.length
          ? responsibilities.map(improveBullet)
          : ["Опишите основные задачи, чтобы помощник аккуратно оформил этот блок."],
        achievements: achievements.map(improveAchievement),
        tools
      }
    ],
    education: [resume.education.institution, resume.education.field, resume.education.year].filter(Boolean).join(", "),
    certificates: splitList(resume.education.certificates),
    recommendations: buildRecommendations(resume, missing),
    missing_questions: missing,
    warnings: resume.warnings || []
  };
  resume.status = missing.length ? "needs_info" : "generated";
  setActiveResume(resume);
  toast("Черновик резюме собран.");
}

function improveBullet(value) {
  const cleaned = value.replace(/^[-*•\s]+/, "").trim();
  if (!cleaned) return "";
  if (/^(управлял|контролировал|обеспечивал|координировал|вел|готовил|организовывал|работал)/i.test(cleaned)) {
    return cleaned;
  }
  return `Выполнял: ${cleaned}`;
}

function improveAchievement(value) {
  const cleaned = value.replace(/^[-*•\s]+/, "").trim();
  if (!cleaned) return "";
  return /\d/.test(cleaned) ? cleaned : `Улучшал рабочие процессы: ${cleaned}`;
}

function buildRecommendations(resume, missing) {
  const recommendations = [];
  if (missing.length) recommendations.push("Заполните недостающие поля, чтобы резюме выглядело сильнее.");
  if (!resume.experience[0]?.achievements) recommendations.push("Добавьте 1-2 результата: сроки, объемы, команда, качество или клиенты.");
  if (!resume.skills.tools) recommendations.push("Укажите программы, оборудование или документы, с которыми работали.");
  return recommendations;
}

function renderResumeRoute() {
  const resume = getActiveResume();
  if (!resume) {
    return appShell(`
      <section class="section">
        <div class="empty-state">
          <h1 class="builder-title">Резюме пока нет</h1>
          <p>Начните с быстрого мастера или загрузите старый файл.</p>
          <div class="actions" style="justify-content: center; margin-top: 16px;">
            <a class="button button-primary" href="#builder/quick">Быстрый режим</a>
            <a class="button button-light" href="#builder/upload">Загрузка</a>
          </div>
        </div>
      </section>
    `);
  }

  return appShell(`
    <section class="builder-layout">
      <aside class="sidebar">
        <strong>Шаблон</strong>
        <div class="chips" style="margin-top: 12px;">
          ${templates
            .map(
              (template) => `
                <button class="chip ${resume.templateId === template.id ? "active" : ""}" data-action="template" data-template="${template.id}">
                  ${template.name}
                </button>
              `
            )
            .join("")}
        </div>
        <div style="margin-top: 18px;">
          <label class="checkbox-label"><input type="checkbox" data-field="settings.showAge" ${resume.settings.showAge ? "checked" : ""}>Возраст</label>
          <label class="checkbox-label"><input type="checkbox" data-field="settings.showSalary" ${resume.settings.showSalary ? "checked" : ""}>Зарплата</label>
          <label class="checkbox-label"><input type="checkbox" data-field="settings.showPhoto" ${resume.settings.showPhoto ? "checked" : ""}>Фото</label>
        </div>
        <div class="actions" style="margin-top: 18px;">
          <button class="button button-primary" data-action="generate-resume">Обновить текст</button>
          <button class="button button-light" data-action="copy-text">Копировать TXT</button>
          <button class="button button-light" data-action="download-txt">Скачать TXT</button>
          <button class="button button-light" data-action="download-pdf">Скачать PDF</button>
          <button class="button button-light" data-action="download-docx">Скачать DOCX</button>
          <button class="button button-blue" data-action="manual-review">На ручную проверку</button>
          <a class="button button-dark" href="#support/personal">Созвониться</a>
          <button class="button button-danger" data-action="delete-resume">Удалить</button>
        </div>
      </aside>
      <section class="workspace">
        <h1 class="builder-title">Редактирование</h1>
        <p class="muted">Изменения сразу попадают в предпросмотр.</p>
        ${personalFields(resume)}
        <hr>
        ${targetFields(resume)}
        <hr>
        ${experienceFields(resume)}
        <hr>
        ${skillsFields(resume)}
        <hr>
        ${educationFields(resume)}
      </section>
      <aside class="preview-panel" aria-label="Предпросмотр резюме">
        ${renderResumePreview(resume, false)}
      </aside>
    </section>
  `);
}

function renderResumePreview(resume, compact) {
  const generated = resume.generated || {};
  const exp = (generated.experience && generated.experience[0]) || resume.experience[0] || {};
  const skills = generated.skills?.length ? generated.skills : splitList([resume.skills.hard, resume.skills.tools].filter(Boolean).join("\n"));
  const contacts = [
    resume.personal.city,
    resume.personal.phone,
    resume.personal.email,
    resume.settings.showAge && resume.personal.age ? `${resume.personal.age} лет` : "",
    resume.settings.showSalary && resume.target.salary ? resume.target.salary : ""
  ].filter(Boolean);

  return `
    <div class="resume-sheet template-${escapeHtml(resume.templateId)}">
      <h1>${escapeHtml(resume.personal.fullName || "Ваше имя")}</h1>
      <div class="resume-meta">${escapeHtml([generated.target_position || resume.target.position || exp.position || "Желаемая должность", ...contacts].filter(Boolean).join(" • "))}</div>
      ${resume.settings.showPhoto ? '<div class="notice" style="display: inline-block; padding: 6px 10px; margin-bottom: 8px;">Фото будет добавлено в полной версии</div>' : ""}
      <h2>О себе</h2>
      <p>${escapeHtml(generated.summary || "Краткое описание появится после генерации резюме.")}</p>
      <h2>Опыт</h2>
      <p><strong>${escapeHtml(exp.position || resume.target.position || "Должность")}</strong>${exp.company ? `, ${escapeHtml(exp.company)}` : ""}${exp.period ? `, ${escapeHtml(exp.period)}` : ""}</p>
      ${renderList(exp.responsibilities || splitList(resume.experience[0]?.responsibilities), compact ? 3 : 8)}
      ${(exp.achievements || []).length ? `<h2>Достижения</h2>${renderList(exp.achievements, compact ? 2 : 6)}` : ""}
      <h2>Навыки</h2>
      ${renderList(skills, compact ? 5 : 14)}
      <h2>Образование</h2>
      <p>${escapeHtml(generated.education || [resume.education.institution, resume.education.field, resume.education.year].filter(Boolean).join(", ") || "Можно добавить позже.")}</p>
      ${generated.recommendations?.length && !compact ? `<h2>Рекомендации</h2>${renderList(generated.recommendations, 5)}` : ""}
    </div>
  `;
}

function renderList(items, limit) {
  const list = Array.isArray(items) ? items.filter(Boolean) : splitList(items);
  if (!list.length) return "<p>Блок пока не заполнен.</p>";
  return `<ul>${list.slice(0, limit).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function resumeToText(resume) {
  const generated = resume.generated || {};
  const exp = (generated.experience && generated.experience[0]) || resume.experience[0] || {};
  const skills = generated.skills?.length ? generated.skills : splitList([resume.skills.hard, resume.skills.tools].filter(Boolean).join("\n"));
  const lines = [
    resume.personal.fullName || "Ваше имя",
    generated.target_position || resume.target.position || exp.position || "",
    [resume.personal.city, resume.personal.phone, resume.personal.email].filter(Boolean).join(", "),
    "",
    "О себе",
    generated.summary || "",
    "",
    "Опыт",
    [exp.position, exp.company, exp.period].filter(Boolean).join(", "),
    ...(exp.responsibilities || splitList(resume.experience[0]?.responsibilities)).map((item) => `- ${item}`),
    ...(exp.achievements?.length ? ["", "Достижения", ...exp.achievements.map((item) => `- ${item}`)] : []),
    "",
    "Навыки",
    ...skills.map((item) => `- ${item}`),
    "",
    "Образование",
    generated.education || [resume.education.institution, resume.education.field, resume.education.year].filter(Boolean).join(", "),
    "",
    "Рекомендации",
    ...(generated.recommendations || []).map((item) => `- ${item}`)
  ];
  return lines.filter((line, index, array) => line || array[index - 1]).join("\n");
}

function downloadBlob(filename, type, content) {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function printResume(resume) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    toast("Разрешите всплывающее окно для печати PDF.");
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html lang="ru">
      <head>
        <meta charset="utf-8">
        <title>${escapeHtml(resume.personal.fullName || "Резюме")}</title>
        <link rel="stylesheet" href="styles.css">
        <style>
          body { background: #fff; padding: 0; }
          .print-wrap { max-width: 820px; margin: 0 auto; padding: 24px; }
          .resume-sheet { box-shadow: none; min-height: auto; }
        </style>
      </head>
      <body>
        <main class="print-wrap">${renderResumePreview(resume, false)}</main>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 300);
}

function safeFilename(resume, ext) {
  const base = (resume.personal.fullName || "resume").toLowerCase().replace(/[^a-zа-я0-9]+/gi, "-").replace(/^-|-$/g, "");
  return `${base || "resume"}.${ext}`;
}

function renderDashboard() {
  const rows = state.resumes
    .map(
      (resume) => `
        <tr>
          <td><strong>${escapeHtml(resume.personal.fullName || "Без имени")}</strong><br><span class="muted">${escapeHtml(resume.target.position || resume.generated?.target_position || "Должность не указана")}</span></td>
          <td>${escapeHtml(resume.status)}</td>
          <td>${formatDate(resume.updatedAt)}</td>
          <td>
            <button class="button button-light" data-action="open-resume" data-id="${resume.id}">Открыть</button>
          </td>
        </tr>
      `
    )
    .join("");

  return appShell(`
    <section class="section">
      <div class="section-head">
        <div>
          <h1 class="page-title">Мои резюме</h1>
          <p class="section-lead">Черновики и готовые версии сохраняются на этом устройстве.</p>
        </div>
        <a class="button button-primary" href="#builder/quick">Новое резюме</a>
      </div>
      ${
        rows
          ? `<div class="table-wrap"><table><thead><tr><th>Резюме</th><th>Статус</th><th>Обновлено</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`
          : '<div class="empty-state">Пока нет резюме.</div>'
      }
    </section>
  `);
}

function renderSupport() {
  const resume = getActiveResume();

  return appShell(`
    <section class="section">
      <div class="section-head">
        <div>
          <h1 class="page-title">Личное сопровождение</h1>
          <p class="section-lead">Оставьте контакт, цель и удобное время для связи.</p>
        </div>
      </div>
      <form class="card" data-support-form>
        <div class="field-grid">
          ${formInput("Имя", "name", "", "Ваше имя")}
          ${formInput("Телефон", "phone", "", "+7 ...")}
          ${formInput("Email", "email", "", "name@mail.ru")}
          ${formSelect("Как связаться", "preferredContact", [["phone", "Телефон"], ["telegram", "Telegram"], ["whatsapp", "WhatsApp"], ["email", "Email"]])}
          ${formInput("Telegram", "telegramUsername", "", "@username")}
          ${formInput("Удобное время", "preferredTime", "", "Сегодня после 18:00")}
          ${formSelect("Цель", "goal", Object.entries(supportGoals))}
          ${formTextarea("Комментарий", "comment", "", "Что важно учесть")}
          <label class="checkbox-label field full">
            <input type="checkbox" name="consentAccepted" required>
            Согласен на обработку персональных данных
          </label>
        </div>
        <input type="hidden" name="resumeId" value="${escapeHtml(resume?.id || "")}">
        <div class="actions" style="margin-top: 16px;">
          <button class="button button-primary" type="submit">Отправить заявку</button>
          <a class="button button-light" href="#consent">Текст согласия</a>
        </div>
      </form>
    </section>
  `);
}

function formInput(label, name, value, placeholder = "") {
  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}">
    </div>
  `;
}

function formTextarea(label, name, value, placeholder = "") {
  return `
    <div class="field full">
      <label for="${name}">${label}</label>
      <textarea id="${name}" name="${name}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(value)}</textarea>
    </div>
  `;
}

function formSelect(label, name, options) {
  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <select id="${name}" name="${name}">
        ${options.map(([value, text]) => `<option value="${escapeHtml(value)}">${escapeHtml(text)}</option>`).join("")}
      </select>
    </div>
  `;
}

function handleSupportSubmit(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  if (!data.phone && !data.email) {
    toast("Укажите телефон или email.");
    return;
  }

  state.supportRequests.unshift({
    id: crypto.randomUUID(),
    ...data,
    consentAccepted: data.consentAccepted === "on",
    status: "new",
    createdAt: new Date().toISOString()
  });
  saveState();
  toast("Заявка на сопровождение отправлена.");
  navigate("admin");
}

function createManualReview(resume) {
  const name = resume.personal.fullName || prompt("Как вас зовут?") || "Без имени";
  const contact = resume.personal.phone || resume.personal.email || prompt("Телефон или email для связи");
  if (!contact) {
    toast("Нужен контакт для заявки.");
    return;
  }

  state.manualReviews.unshift({
    id: crypto.randomUUID(),
    resumeId: resume.id,
    name,
    contact,
    comment: "Заявка создана из предпросмотра резюме.",
    status: "new",
    createdAt: new Date().toISOString()
  });
  saveState();
  toast("Заявка на ручную проверку создана.");
}

function renderAdmin() {
  return appShell(`
    <section class="section">
      <div class="section-head">
        <div>
          <h1 class="page-title">Админ-панель</h1>
          <p class="section-lead">Заявки и статусы прототипа хранятся на этом устройстве.</p>
        </div>
      </div>
      <div class="grid grid-3">
        <article class="card"><h3>${state.resumes.length}</h3><p>Резюме</p></article>
        <article class="card"><h3>${state.manualReviews.length}</h3><p>Ручная проверка</p></article>
        <article class="card"><h3>${state.supportRequests.length}</h3><p>Сопровождение</p></article>
      </div>
      <div class="route-tabs" style="margin-top: 26px;">
        <button class="active" type="button">Ручная проверка</button>
      </div>
      ${renderAdminTable("manual")}
      <div class="route-tabs" style="margin-top: 26px;">
        <button class="active" type="button">Сопровождение</button>
      </div>
      ${renderAdminTable("support")}
    </section>
  `);
}

function renderAdminTable(type) {
  const list = type === "manual" ? state.manualReviews : state.supportRequests;
  const statuses = type === "manual"
    ? ["new", "in_review", "needs_info", "edited", "completed", "cancelled"]
    : ["new", "contacted", "call_scheduled", "in_work", "completed", "cancelled"];

  if (!list.length) {
    return '<div class="empty-state">Заявок пока нет.</div>';
  }

  const rows = list
    .map(
      (item) => `
        <tr>
          <td><strong>${escapeHtml(item.name || "Без имени")}</strong><br><span class="muted">${escapeHtml(item.contact || item.phone || item.email || "")}</span></td>
          <td>${escapeHtml(item.comment || supportGoals[item.goal] || "")}</td>
          <td>${formatDate(item.createdAt)}</td>
          <td>
            <select data-action="status" data-kind="${type}" data-id="${item.id}">
              ${statuses.map((status) => `<option value="${status}" ${item.status === status ? "selected" : ""}>${status}</option>`).join("")}
            </select>
          </td>
        </tr>
      `
    )
    .join("");

  return `<div class="table-wrap"><table><thead><tr><th>Контакт</th><th>Комментарий</th><th>Дата</th><th>Статус</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderLegal(type) {
  const data = {
    privacy: {
      title: "Политика обработки данных",
      text: [
        "Сервис использует данные для создания резюме, хранения черновика и обработки заявок на проверку или сопровождение.",
        "В прототипе данные сохраняются в браузере пользователя. Не вводите лишние персональные данные, если они не нужны для резюме.",
        "Пользователь может удалить резюме на странице предпросмотра."
      ]
    },
    terms: {
      title: "Пользовательское соглашение",
      text: [
        "Прототип помогает подготовить текст и файл резюме, но не гарантирует трудоустройство.",
        "AI-помощник не должен выдумывать факты. Пользователь проверяет итоговый документ перед отправкой работодателю.",
        "Платежи и подписки в MVP не реализованы."
      ]
    },
    consent: {
      title: "Согласие на обработку персональных данных",
      text: [
        "Отправляя форму, пользователь соглашается на обработку ФИО, контактов и сведений о профессиональном опыте.",
        "Цели обработки: подготовка резюме, обратная связь, ручная проверка и личное сопровождение.",
        "Согласие можно отозвать, удалив данные прототипа в браузере или обратившись к владельцу сервиса."
      ]
    }
  }[type];

  return appShell(`
    <section class="section">
      <h1 class="page-title">${data.title}</h1>
      <div class="grid" style="margin-top: 24px;">
        ${data.text.map((paragraph) => `<article class="card"><p>${paragraph}</p></article>`).join("")}
      </div>
    </section>
  `);
}

function crc32(buffer) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = Array.from({ length: 256 }, (_, index) => {
      let c = index;
      for (let k = 0; k < 8; k += 1) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      }
      return c >>> 0;
    });
  }

  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = (crc >>> 8) ^ table[(crc ^ buffer[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function u16(value) {
  return [value & 0xff, (value >>> 8) & 0xff];
}

function u32(value) {
  return [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];
}

function concatBytes(parts) {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(size);
  let offset = 0;
  parts.forEach((part) => {
    out.set(part, offset);
    offset += part.length;
  });
  return out;
}

function createZip(files) {
  const encoder = new TextEncoder();
  const locals = [];
  const centrals = [];
  let offset = 0;

  files.forEach((file) => {
    const name = encoder.encode(file.name);
    const data = typeof file.content === "string" ? encoder.encode(file.content) : file.content;
    const crc = crc32(data);
    const local = new Uint8Array([
      ...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0)
    ]);
    locals.push(local, name, data);

    const central = new Uint8Array([
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0), ...u16(0),
      ...u16(0), ...u16(0), ...u32(0), ...u32(offset)
    ]);
    centrals.push(central, name);
    offset += local.length + name.length + data.length;
  });

  const centralSize = centrals.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array([
    ...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length),
    ...u32(centralSize), ...u32(offset), ...u16(0)
  ]);

  return concatBytes([...locals, ...centrals, end]);
}

function createDocxBlob(resume) {
  const paragraphs = resumeToText(resume).split("\n").map((line) => {
    const style = line && !line.startsWith("-") && line.length < 40 ? '<w:pStyle w:val="Heading2"/>' : "";
    return `<w:p><w:pPr>${style}</w:pPr><w:r><w:t xml:space="preserve">${xmlEscape(line)}</w:t></w:r></w:p>`;
  });
  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>${paragraphs.join("")}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/></w:sectPr></w:body>
    </w:document>`;

  const zip = createZip([
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`
    },
    {
      name: "word/document.xml",
      content: documentXml
    }
  ]);

  return new Blob([zip], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
}

function createPdfBlob(resume) {
  const text = resumeToText(resume).replace(/[()\\]/g, "\\$&").split("\n");
  const lines = [];
  text.forEach((line) => {
    if (!line) {
      lines.push("");
      return;
    }
    const chunks = line.match(/.{1,86}(\s|$)/g) || [line];
    chunks.forEach((chunk) => lines.push(chunk.trim()));
  });

  const content = [
    "BT",
    "/F1 11 Tf",
    "50 790 Td",
    "14 TL",
    ...lines.slice(0, 52).map((line) => (line ? `(${line}) Tj T*` : "T*")),
    "ET"
  ].join("\n");

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

function bindEvents() {
  document.querySelectorAll("[data-field]").forEach((node) => {
    node.addEventListener("input", () => {
      const resume = getActiveResume();
      if (!resume) return;
      const value = node.type === "checkbox" ? node.checked : node.value;
      setByPath(resume, node.dataset.field, value);
      setActiveResume(resume);

      if (currentRoute().startsWith("resume")) {
        const preview = document.querySelector(".preview-panel");
        if (preview) {
          preview.innerHTML = renderResumePreview(resume, false);
        }
      }
    });

    node.addEventListener("change", () => {
      const resume = getActiveResume();
      if (!resume) return;
      const value = node.type === "checkbox" ? node.checked : node.value;
      setByPath(resume, node.dataset.field, value);
      setActiveResume(resume);
      const preview = document.querySelector(".preview-panel");
      if (preview) {
        preview.innerHTML = renderResumePreview(resume, currentRoute().startsWith("builder"));
      }
    });
  });

  document.querySelectorAll("[data-action]").forEach((node) => {
    node.addEventListener("click", async (event) => {
      const action = node.dataset.action;
      const resume = getActiveResume();

      if (action === "next-step") {
        activeStep = Math.min(steps.length - 1, activeStep + 1);
        sessionStorage.setItem("rezumeprofi_step", String(activeStep));
        render();
      }

      if (action === "prev-step") {
        activeStep = Math.max(0, activeStep - 1);
        sessionStorage.setItem("rezumeprofi_step", String(activeStep));
        render();
      }

      if (action === "generate-resume" && resume) {
        generateResume(resume);
        navigate(`resume/${resume.id}`);
      }

      if (action === "deep-send") {
        const inputNode = document.querySelector("[data-deep-answer]");
        const value = inputNode.value.trim();
        if (!value) {
          toast("Напишите ответ.");
          return;
        }
        deepAnswers.push(value);
        deepMessages.push({ role: "user", text: value });
        deepMessages.push({ role: "bot", text: nextDeepQuestion(deepAnswers.length) });
        saveDeepSession();
        render();
      }

      if (action === "deep-generate" && resume) {
        applyDeepAnswers(resume);
        navigate(`resume/${resume.id}`);
      }

      if (action === "confirm-extraction" && extractedResume) {
        generateResume(extractedResume);
        navigate(`resume/${extractedResume.id}`);
        extractedResume = null;
      }

      if (action === "reset-extraction") {
        extractedResume = null;
        render();
      }

      if (action === "template" && resume) {
        resume.templateId = node.dataset.template;
        setActiveResume(resume);
        render();
      }

      if (action === "copy-text" && resume) {
        await navigator.clipboard.writeText(resumeToText(resume));
        toast("Текст скопирован.");
      }

      if (action === "download-txt" && resume) {
        downloadBlob(safeFilename(resume, "txt"), "text/plain;charset=utf-8", resumeToText(resume));
      }

      if (action === "download-pdf" && resume) {
        printResume(resume);
      }

      if (action === "download-docx" && resume) {
        downloadBlob(safeFilename(resume, "docx"), "application/vnd.openxmlformats-officedocument.wordprocessingml.document", createDocxBlob(resume));
      }

      if (action === "manual-review" && resume) {
        createManualReview(resume);
      }

      if (action === "delete-resume" && resume) {
        state.resumes = state.resumes.filter((item) => item.id !== resume.id);
        state.activeResumeId = state.resumes[0]?.id || null;
        saveState();
        toast("Резюме удалено.");
        navigate("dashboard");
      }

      if (action === "open-resume") {
        state.activeResumeId = node.dataset.id;
        saveState();
        navigate(`resume/${node.dataset.id}`);
      }
    });
  });

  document.querySelectorAll('select[data-action="status"]').forEach((node) => {
    node.addEventListener("change", () => {
      const list = node.dataset.kind === "manual" ? state.manualReviews : state.supportRequests;
      const item = list.find((entry) => entry.id === node.dataset.id);
      if (item) {
        item.status = node.value;
        saveState();
        toast("Статус обновлен.");
      }
    });
  });

  const upload = document.querySelector("[data-upload]");
  if (upload) {
    upload.addEventListener("change", (event) => handleUpload(event.target.files[0]));
  }

  const supportForm = document.querySelector("[data-support-form]");
  if (supportForm) {
    supportForm.addEventListener("submit", (event) => {
      event.preventDefault();
      handleSupportSubmit(supportForm);
    });
  }
}

function render() {
  const route = currentRoute();
  const app = document.querySelector("#app");
  const content = route.startsWith("builder/quick")
    ? renderBuilder("quick")
    : route.startsWith("builder/deep")
      ? renderBuilder("deep")
      : route.startsWith("builder/upload")
        ? renderUpload()
        : route.startsWith("resume")
          ? renderResumeRoute()
          : route === "dashboard"
            ? renderDashboard()
            : route === "support/personal"
              ? renderSupport()
              : route === "admin"
                ? renderAdmin()
                : ["privacy", "terms", "consent"].includes(route)
                  ? renderLegal(route)
                  : renderHome();

  app.innerHTML = content;
  bindEvents();
  window.scrollTo(0, 0);

  const chat = document.querySelector("[data-chat-box]");
  if (chat) {
    chat.scrollTop = chat.scrollHeight;
  }
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);
