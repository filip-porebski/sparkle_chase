Contributing to SparkleChase

Thank you for your interest in contributing! This guide helps you get productive quickly.

Getting Started
- Node.js 18+
- npm 9+

Setup
1. Install deps: `npm ci`
2. Run dev app: `npm run dev`
3. Type-check: `npm run type-check`
4. Lint: `npm run lint`
5. Build: `npm run build`

Code Style
- TypeScript strict mode is enabled; prefer strong types.
- Linting is enforced with ESLint; formatting with Prettier.
- Keep functions small and purposeful; avoid deep nesting when possible.

Testing
- UI tests live under `tests/` and use Playwright (renderer-focused).
- After building (`npm run build`), run Python-based tests per `tests/README.md`.

Commits & PRs
- Keep changes focused and scoped.
- Reference issues in commit messages and PR descriptions.
- Include screenshots/GIFs for UI changes when helpful.

Security
- Please report vulnerabilities privately. See SECURITY.md.

License
- By contributing, you agree your contributions are licensed under the repository’s MIT license.

