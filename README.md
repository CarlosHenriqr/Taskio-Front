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
│   └── plans/        # Planos e upgrade (TCC)
├── types/            # Tipos alinhados ao backend
└── router/           # React Router
```

## Perfis e rotas

| Perfil | Prefixo | Funcionalidades |
|--------|---------|-----------------|
| Público | `/`, `/login`, `/cadastro/*` | Landing, auth, registro |
| Empresa | `/empresa/*` | Vagas, candidatos, notificações |
| Freelancer | `/freelancer/*` | Busca, candidaturas, perfil |

## Scripts

- `npm run dev` — desenvolvimento (porta 5173)
- `npm run build` — build de produção
- `npm run preview` — preview do build

## Deploy (Cloudflare Pages)

Backend em produção: [Taskio-API no Render](https://taskio-api-6vta.onrender.com) (`https://taskio-api-6vta.onrender.com`).

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

### 3. URL da API no build

O Vite precisa de `VITE_API_URL` **durante o build**. Este repo já define em:

- `.env.production` (commitado)
- `wrangler.toml` → `[vars]`

Opcional no Dashboard (**Variables and secrets**): mesma URL, se quiser sobrescrever sem commit.

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://taskio-api-6vta.onrender.com` |

> Se o log do Pages mostrar `Build environment variables: (none found)`, ignore — o `.env.production` do repo garante a URL no bundle.

### 4. SPA (rotas `/login`, `/empresa/*`, etc.)

Não use `_redirects` com `/* /index.html 200` — o Cloudflare rejeita como loop infinito.  
Sem `404.html` na raiz do `dist`, o Pages já trata o projeto como SPA e serve `index.html` nas rotas do React Router ([docs](https://developers.cloudflare.com/pages/configuration/serving-pages/)).

### 5. CORS no backend (Render)

No serviço **taskio-api** (Render) → **Environment**:

| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://task-io-7d3.pages.dev` |

Salve e aguarde o redeploy do backend.

### 6. Assets e headers

- `public/_headers` — headers de segurança e cache de assets
- `wrangler.toml` — output dir e referência de config

### 7. Deploy

Domínio customizado opcional em **Custom domains**.

## Design System

Tokens em `src/styles.css`: paleta OKLCH (teal + amber), tipografia Space Grotesk / Plus Jakarta Sans / JetBrains Mono, backgrounds mesh/dot-grid/noise e variantes semânticas (`primary`, `success`, `warning`, `destructive`).

Componentes reutilizáveis em `src/components/taskio/ui.tsx`: `Btn`, `Card`, `Badge`, `StatCard`, `EmptyState`, `Field`, inputs.
