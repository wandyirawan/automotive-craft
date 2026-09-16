# AutomotiveCraft

AI Design Brief Assistant — full-stack workspace untuk membuat design brief otomatis
berbasis percakapan AI. Dibangun sebagai submission untuk assessment *lmesh Full-Stack
Technical Assessment*.

## Stack

- **Monorepo:** [Nx](https://nx.dev) 23 (pnpm workspace)
- **API:** [NestJS](https://nestjs.com) 11 + Fastify 5, TypeScript (NodeNext)
- **Web:** React 19 + [TanStack Router](https://tanstack.com/router) + Vite 8 + Tailwind CSS 4
- **Database & ORM:** PostgreSQL 17 + [Prisma](https://prisma.io) 7 (driver adapter `@prisma/adapter-pg`)
- **AI:** provider OpenAI-compatible via satu adapter (`openai-compatible.provider.ts`),
  di-switch lewat environment variable (OpenRouter / Gemini / Ollama)

## Struktur

```
apps/
  api/        NestJS + Fastify backend (port 3000)
  web/        React + Vite frontend (port 4200 dev / 4300 preview)
  api-e2e/    e2e tests untuk api
apps/api/prisma/
  schema.prisma    2 model: User, Project (conversation disimpan JSONB)
  seed.ts          seed user demo
apps/api/src/generated/prisma/   Prisma client (di-generate, di-commit)
DECISIONS.md       Architecture Decision Record (ADR)
```

## Prasyarat

- Node.js 22+ (di-manage via mise)
- pnpm 10+
- Docker (untuk PostgreSQL lokal)

## Setup

```sh
# 1. Install dependencies
pnpm install

# 2. Siapkan environment
cp .env.example .env
# edit .env — set SESSION_SECRET dan AI_API_KEY (lihat bagian Environment)

# 3. Jalankan PostgreSQL via docker compose
docker compose up -d

# 4. Generate Prisma client & jalankan migrasi + seed
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

`SESSION_SECRET` harus string acak panjang, mis.:

```sh
openssl rand -hex 32
```

## Menjalankan aplikasi

```sh
# Terminal 1 — API (http://localhost:3000)
npx nx serve api

# Terminal 2 — Web (http://localhost:4200)
npx nx serve web
```

Frontend memanggil API lewat path relatif `/api/v1` (same-origin, cookie session
`httpOnly` + `sameSite: strict`), jadi tidak perlu mengatur URL API saat dev.

## Build

```sh
npx nx build api      # output: dist/apps/api
npx nx build web      # output: dist/apps/web
```

## Environment

Semua variabel ada di `.env` (root). Lihat `.env.example` untuk template.

| Variabel        | Keterangan                                                        |
| --------------- | ----------------------------------------------------------------- |
| `PORT`          | Port API (default `3000`)                                         |
| `SESSION_SECRET`| Secret untuk sign cookie session (generate: `openssl rand -hex 32`)|
| `DATABASE_URL`  | Connection string PostgreSQL (default `postgresql://postgres:***@localhost:5432/automotive_craft`) |
| `AI_PROVIDER`   | Nama provider AI (`openrouter`, `gemini`, `ollama`, ...)          |
| `AI_BASE_URL`   | Base URL endpoint OpenAI-compatible                               |
| `AI_API_KEY`    | API key provider                                                  |
| `AI_MODEL`      | Nama model (mis. `meta-llama/llama-3.1-8b-instruct:free`)         |

## API

Semua endpoint diawali `/api/v1`. Autentikasi memakai **session cookie** (bukan JWT):

| Method | Path                     | Publik? | Keterangan                |
| ------ | ------------------------ | ------- | ------------------------- |
| POST   | `/api/v1/auth/login`     | Ya      | Login (email + password)  |
| POST   | `/api/v1/auth/logout`    | Tidak   | Logout                    |
| GET    | `/api/v1/auth/me`        | Tidak   | Profil user terautentikasi|

Route yang tidak ber-label publik ditolak dengan `401` oleh global guard
(`APP_GUARD`) kecuali diberi decorator `@Public()`.

## Database & Prisma

- 2 model: `User` dan `Project`. Tidak ada tabel `Message` — percakapan
  disimpan sebagai kolom JSONB `conversation` (default `[]`) di row `Project`.
  Detail rasional di `DECISIONS.md` bagian 3.
- Generator Prisma menulis client ke `apps/api/src/generated/prisma` (di-commit,
  bukan di-gitignore) karena generator Prisma 7 dipakai bersama driver adapter.
- Run via `prisma.config.ts` (bukan `schema.prisma` block): schema, path migrasi,
  dan seed dikonfigurasi di sana.

```sh
npx prisma generate        # generate client
npx prisma migrate dev      # buat/terapkan migrasi
npx prisma studio           # browse data
npx prisma db seed          # isi user demo (lihat apps/api/prisma/seed.ts)
```

## Catatan build (Prisma 7 + webpack)

Build API membutuhkan konfigurasi khusus di `apps/api/webpack.config.js` karena
Prisma 7 meng-generate client bergaya ESM yang bermasalah saat di-bundle webpack
(Nx):

- `optimization.concatenateModules` dimatikan (Nx menghardcode `true`) agar
  re-export `export * as $Enums` tidak gagal build.
- Generated Prisma client + `@prisma/client/runtime/*` + `@prisma/adapter-pg`
  di-**externalize** (`mergeExternals: true`) dan generated client di-copy ke
  `dist` sebagai asset, lalu di-load natively oleh `tsx` saat serve
  (`runtimeArgs: ["--require", "tsx/cjs"]` di `project.json`).

## Nx

Task dijalankan dengan `npx nx <target> <project>`. Target utama: `build`,
`serve`, `test`, `lint`. `npx nx graph` untuk visualisasi dependency.
