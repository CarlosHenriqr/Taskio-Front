# Taskio — Frontend

Interface web da plataforma TASKIO (TCC). React + TypeScript + Tailwind CSS + Vite.

## Stack

- **React 19** + **TypeScript**
- **Vite 7** + **React Router 7**
- **TanStack Query** (dados da API)
- **Tailwind CSS 4** (Design System OKLCH)
- **Framer Motion** (animações)
- **Recharts** (dashboards)
- **Sonner** (toasts)
- **React Hook Form** + **Zod** (formulários)

## Início rápido

```bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm run dev
```

A API deve estar rodando em `http://localhost:3333` (repositório [Taskio-API](https://github.com/CarlosHenriqr/Taskio-API)).

## Variáveis de ambiente

| Variável | Descrição |
|----------|-----------|
| `VITE_API_URL` | URL base da API (padrão: proxy `/api` no dev) |

## Estrutura

```
frontend/src/
├── components/
│   ├── taskio/       # Design System (AppShell, Logo, UI primitives)
│   ├── layout/       # Rotas protegidas, transições
│   ├── feedback/     # Loading, erros
│   └── shared/       # JobCard, StatusBadge
├── contexts/         # AuthContext
├── lib/
│   ├── api/          # Cliente HTTP + endpoints
│   └── nav.ts        # Navegação por perfil
├── pages/
│   ├── public/       # Landing, login, cadastro, recuperar senha
│   ├── empresa/      # Dashboard, projetos, candidatos, notificações
│   ├── freelancer/   # Vagas, trabalhos, currículo, matching
│   └── admin/        # Moderação
├── types/            # Tipos alinhados ao backend
└── router/           # React Router
```

## Perfis e rotas

| Perfil | Prefixo | Funcionalidades |
|--------|---------|-----------------|
| Público | `/`, `/login`, `/cadastro/*` | Landing, auth, registro |
| Empresa | `/empresa/*` | Vagas, candidatos, notificações |
| Freelancer | `/freelancer/*` | Busca, candidaturas, perfil |
| Admin | `/admin/*` | Usuários e vagas |

## Scripts

- `npm run dev` — desenvolvimento (porta 5173)
- `npm run build` — build de produção
- `npm run preview` — preview do build

## Deploy (Cloudflare Pages)

Backend em produção: [Taskio-API no Render](https://taskio-api-0vtm.onrender.com) (`https://taskio-api-0vtm.onrender.com`).

### 1. Conectar o repositório

1. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Selecione [CarlosHenriqr/Taskio-Front](https://github.com/CarlosHenriqr/Taskio-Front)
3. Branch: `main`

### 2. Build settings

| Campo | Valor |
|-------|-------|
| **Framework preset** | Vite |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Node.js version** | `20` (`.node-version`) |

### 3. Variáveis de ambiente (Production)

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://taskio-api-0vtm.onrender.com` |

> O Vite lê `VITE_*` **no build**. Se mudar a URL da API, faça **Retry deployment** no Pages.

### 4. CORS no backend (Render)

No serviço **taskio-api** (Render) → **Environment**:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | URL do Cloudflare Pages (ex.: `https://taskio-front.pages.dev`) |

Salve e aguarde o redeploy do backend.

### 5. SPA e assets

- `public/_redirects` — rotas do React Router (`/login`, `/empresa/*`, etc.)
- `public/_headers` — headers de segurança e cache de assets
- `wrangler.toml` — referência para deploy via Wrangler CLI (opcional)

### 6. Deploy

Clique **Save and Deploy**. A URL será algo como `https://taskio-front.pages.dev`.

Domínio customizado opcional em **Custom domains**.

## Design System

Tokens em `src/styles.css`: paleta OKLCH (teal + amber), tipografia Space Grotesk / Plus Jakarta Sans / JetBrains Mono, backgrounds mesh/dot-grid/noise e variantes semânticas (`primary`, `success`, `warning`, `destructive`).

Componentes reutilizáveis em `src/components/taskio/ui.tsx`: `Btn`, `Card`, `Badge`, `StatCard`, `EmptyState`, `Field`, inputs.
