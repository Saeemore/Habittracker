# AI-Based Habit Tracker: Intelligent Behavioral Assistant

AI-Based Habit Tracker helps people build and maintain positive habits through personalized nudges, automatic habit detection, streak tracking, and AI-powered insights.

---

## 🚀 Project Overview
**Title:** AI-Based Habit Tracker: Intelligent Behavioral Assistant  
**Description:** Intelligent habit tracking and behaviour-change assistant using machine learning for adaptive nudges, automatic habit detection, and personalised insights.

---

## ✨ Features
- ✅ Habit creation, scheduling, and recurring rules  
- 📲 Automatic habit detection (optional device events / manual input pipelines)  
- 🔔 Intelligent nudges and reminders (adaptive timing)  
- 📊 Habit streaks, progress graphs, and analytics  
- 🤖 AI-generated habit suggestions and insights  
- 🔒 Offline-first support and privacy-focused design  

---

## 🛠 Tech Stack
- **Frontend:** React + TypeScript (Vite or Next.js)  
- **Backend:** Node.js + TypeScript (Express / Fastify)  
- **Database:** MongoDB
- **ML / AI:** Python (scikit-learn, PyTorch/TensorFlow) or hosted LLM APIs  
- **Auth:** JWT / OAuth2 (Google, Apple)  
- **Deployment:** Docker, GitHub Actions, Kubernetes / cloud hosting  

---

## 📂 Repository Structure
```

ai-habit-tracker/
├─ .github/
│  ├─ workflows/                # CI / CD workflows
│  ├─ ISSUE_TEMPLATE/           # issue templates
│  └─ PULL_REQUEST_TEMPLATE.md
├─ backend/                     # API + business logic
│  ├─ src/
│  ├─ tests/
│  ├─ Dockerfile
│  └─ package.json
├─ frontend/                    # React/Next.js app
│  ├─ src/
│  ├─ public/
│  ├─ tests/
│  └─ package.json
├─ ml/                          # ML models + notebooks
│  ├─ experiments/
│  ├─ notebooks/
│  └─ requirements.txt
├─ infra/                       # Deployment configs (k8s, terraform, helm)
├─ scripts/                     # Helper scripts (db seed, migrations)
├─ docs/                        # Design docs, API spec, architecture diagrams
├─ .env.example
├─ docker-compose.yml
├─ README.md
├─ CONTRIBUTING.md
└─ LICENSE

````

---

## ⚡ Quick Start (Development)

1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/ai-habit-tracker.git
   cd ai-habit-tracker
````

2. Copy `.env.example` to `.env` and fill in values:

   ```bash
   cp .env.example .env
   ```

3. Start local services with Docker Compose:

   ```bash
   docker-compose up --build
   ```

4. Run backend:

   ```bash
   cd backend
   pnpm install
   pnpm dev
   ```

5. Run frontend:

   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

---

## 🧪 Testing

* **Backend:** Jest unit + integration tests (with test containers for DB).
* **Frontend:** React Testing Library + Playwright for E2E.

Run all tests:

```bash
pnpm test
```

---

## 🔄 CI / CD

* **Linting:** ESLint + Prettier
* **Testing:** Jest + Playwright
* **Build:** Docker images for backend & frontend
* **Deployments:** GitHub Actions workflows (to container registry / k8s)

---

## 👨‍💻 Contributing

We welcome contributions! Please check out [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines on branching, commit messages, and PRs.

* Branch workflow:

  * `main` → production
  * `dev` → development
  * `feature/<desc>` → feature branches
* Commit messages use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

---

## 🔒 Privacy & Security

* User habit data is **private** and encrypted at rest.
* ML training uses **only anonymized / opt-in data**.
* No third-party data sharing without consent.
* See [`docs/privacy.md`](docs/privacy.md) for details.

---

## 📜 License

This project is licensed under the **MIT License**.
See [`LICENSE`](LICENSE) for more information.

---

````

---

## 📄 `.gitignore`
```gitignore
# Node
node_modules/
dist/
.env
.DS_Store
.vscode/
.idea/
coverage/

# Python / ML
__pycache__/
*.pyc
.venv/

# Logs
logs
*.log

# Docker
docker-compose.override.yml
````

---

## 📄 `.env.example`

```bash
# Database


# Auth
JWT_SECRET=changeme
OAUTH_GOOGLE_CLIENT_ID=
OAUTH_GOOGLE_CLIENT_SECRET=

# Environment
NODE_ENV=development
PORT=5000
```

---

## 📄 `CONTRIBUTING.md`

```markdown
# Contributing Guide

Thanks for your interest in contributing! 🚀

## Branch Workflow
- `main` → production  
- `dev` → development  
- `feature/<short-desc>` → new features  

## Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
- `feat(ui): add habit calendar`
- `fix(api): correct auth middleware`
- `docs(readme): update project overview`

## PR Process
1. Fork and create your branch from `dev`.
2. Write/update tests for your changes.
3. Ensure lint passes: `pnpm lint`.
4. Submit PR to `dev` branch.
```

---

## 📄 `LICENSE`

```text
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 📄 `docker-compose.yml`

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:15
    container_name: habit_pg
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: habit_tracker
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7
    container_name: habit_redis
    ports:
      - "6379:6379"

  backend:
    build: ./backend
    container_name: habit_backend
    env_file: .env
    ports:
      - "5000:5000"
    depends_on:
      - postgres
      - redis

  frontend:
    build: ./frontend
    container_name: habit_frontend
    env_file: .env
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  pgdata:
```

---

## 📄 `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [ dev, main ]
  pull_request:
    branches: [ dev ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install deps (backend)
        run: cd backend && npm install

      - name: Lint (backend)
        run: cd backend && npm run lint

      - name: Test (backend)
        run: cd backend && npm test

      - name: Install deps (frontend)
        run: cd frontend && npm install

      - name: Lint (frontend)
        run: cd frontend && npm run lint

      - name: Test (frontend)
        run: cd frontend && npm test
```
