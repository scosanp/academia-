# AGENTS.md

## Project rules

- All user-facing UI text must be in Russian.
- Use TypeScript for application code.
- Keep course content data-driven in `src/data`.
- Do not store API keys, tokens, secrets, or private data in the repository.
- Preserve GitHub Pages compatibility. Routing should work after static deployment.
- Before opening a Pull Request, run: `npm run lint`, `npm test`, `npm run build`.
- For quiz logic, every question must have exactly four answer options and exactly one correct answer.
- The passing score for a lesson is 70%.
- For educational content, avoid unsupported claims and phrase time-sensitive product features as potentially varying by plan, region, or date.

## Review guidelines

- Check accessibility: keyboard navigation, focus states, labels, readable contrast.
- Treat broken course progression, incorrect quiz scoring, failed builds, or data loss as P1 issues.
- Treat typos in headings, buttons, test feedback, and Russian UI text as P2 issues.
- Keep new UI consistent with the brutalist glass design direction.
