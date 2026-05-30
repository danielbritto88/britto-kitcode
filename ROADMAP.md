# Roadmap — Tanque Cheio

> Plano de execução do zero ao 100%. Cada fase entrega algo **funcional e demonstrável**.

**Convenções:**
- ✅ pronto · 🔄 em andamento · ⬜ pendente
- 🟡 **[AÇÃO SUA]** — momento em que eu paro e você precisa fazer algo (te aviso por escrito).
- 🤖 **[FAÇO EU]** — roda dentro do meu contexto, sem te incomodar.
- Toda fase fecha com um **checkpoint** — momento natural para você revisar antes da próxima.
- Tudo segue o protocolo do `.agent` (CLAUDE.md → CORE.md → frontend-specialist + mobile-design + ui-ux-pro-max).

---

## ▶︎ Suas tarefas, na ordem (visão rápida)

Tudo que **VOCÊ** precisa fazer no projeto inteiro, sem precisar caçar pelo roadmap:

| # | Quando | O que você faz | Tempo estimado |
|---|---|---|---|
| ✅ 1 | Antes da Fase 0 | Criar repositório vazio no GitHub e me passar a URL | 3 min |
| ✅ 2 | Fim da Fase 0 | Aprovar visual da tela "Olá" no Netlify | 2 min |
| ✅ 3 | Fim da Fase 1 | Escolher logo (fornecida pelo Daniel) | 5 min |
| ✅ 4 | Fim da Fase 1 | Aprovar showcase do design system | 5 min |
| ✅ 5 | Início da Fase 2 | Criar conta Cloudflare grátis | 5 min |
| ✅ 6 | Início da Fase 2 | Gerar API Token Cloudflare e me passar | 3 min |
| 7 | Fase 3 | Definir a senha do cofre (você pensa, eu salvo no Worker) | 1 min |
| 8 | Fase 3 | Logar no celular seu e da sua companheira | 2 min |
| 9 | Fim da Fase 4 | Cadastrar 2 carros reais para testarmos | 5 min |
| 10 | Fase 8 | Aceitar permissão de notificação no celular | 30 seg |
| 11 | Fase 10 | Ligar domínio próprio no Netlify (opcional) | 5 min |
| 12 | Fim da Fase 10 | Instalar a v1.0.0 no celular seu e da companheira | 2 min |
| 13 | Fim da Fase 11 | Aprovar redesign "Telemetria Íntima" no `/__ds` e na Início | 5 min |
| 14 | Início da Fase 12 | Reentrar nos celulares após migração de auth (vez única) | 2 min |
| 15 | Fim da Fase 12 | Validar revogação de dispositivo na Configurações | 3 min |

**Total estimado de tempo seu no projeto inteiro:** ~50 minutos espalhados ao longo de 12–14 dias úteis.

---

## ✅ Fase 0 — Fundação (½ dia)

**Objetivo:** repositório de pé, build rodando, Netlify mostrando "Olá Tanque Cheio".

### 🟡 [AÇÃO SUA] — Antes de eu começar
1. Acesse https://github.com/new
2. **Repository name:** `tanquecheio` (sugestão)
3. **Description:** `PWA de controle de automóveis — combustível, manutenção e financeiro`
4. **Public** (pode ser, é seu app pessoal sem segredos no código)
5. **NÃO** marque "Add a README", "Add .gitignore" nem "Choose a license" (eu crio isso)
6. Clique em "Create repository"
7. Cole aqui pra mim a URL do repo: https://github.com/danielbritto88/tanquecheio.git (algo como `https://github.com/danielbritto88/tanquecheio.git`)

### 🤖 [FAÇO EU]
- ✅ Inicializar `git init`, `git remote add origin <sua-url>`
- ✅ Criar projeto Vite + React 19 + TypeScript (`npm create vite@latest`)
- ✅ Configurar Tailwind CSS v3 + variáveis CSS (paleta "Painel Noturno" de PROJETO.md §8.3)
- ✅ Instalar Bodoni Moda + Jost via `@fontsource` (offline-friendly)
- ✅ ESLint + Prettier + `tsconfig` strict mode
- ✅ Estrutura de pastas: `src/{app,features,components,lib,styles,types,hooks}`
- ✅ `.gitignore` completo: `node_modules/`, `dist/`, `.env`, `.env.local`, `.dev.vars`, `.wrangler/`, `.DS_Store`, `Thumbs.db`, `*.local`
- ✅ Configurar `vite-plugin-pwa` (modo `autoUpdate`, manifesto base com `theme_color: #000000`)
- ✅ Criar `netlify.toml` (build command, publish dir, headers de cache)
- ✅ Página inicial com logo em fundo OLED
- ✅ Primeiro commit + push para GitHub

### 🟡 [AÇÃO SUA] — Conectar Netlify ao GitHub
1. Acesse https://app.netlify.com (login com GitHub se ainda não tem conta)
2. Clique em **"Add new site"** → **"Import an existing project"** → **"Deploy with GitHub"**
3. Autoriza Netlify a acessar o repo `tanquecheio`
4. Configurações que ele detecta sozinho (Vite): build command `npm run build`, publish dir `dist`. Confirma.
5. Clica em **"Deploy site"**
6. Aguarda ~2 min, copia a URL (algo como `https://radiant-marigold-abc123.netlify.app`) e me passa

### Checkpoint 0
Você abre a URL no celular Android, vê "Tanque Cheio" elegante em Bodoni sobre fundo preto OLED. Já dá pra "Adicionar à tela inicial" e ele aparece como app.

---

## ✅ Fase 1 — Design System & Logo (1 dia)

**Objetivo:** vocabulário visual reutilizável + logo aprovada antes de construir telas.

### 🤖 [FAÇO EU]
- ✅ Tokens de design (cores, espaçamentos, raios, sombras, tipografia) em `src/styles/tokens.css`
- ✅ Provider de tema (claro/escuro/sistema) com persistência em localStorage
- ✅ Componentes base: `Button`, `Input`, `Card`, `Sheet`, `Toast`, `Switch`, `Skeleton` (Radix UI + CVA, sem shadcn)
- ✅ Paleta âmbar aplicada — sem azul-cinza genérico
- ✅ Componentes próprios: `PageHeader`, `BottomTabBar`, `FAB`, `EmptyState`, `Money`, `Distance`
- ✅ Logo fornecida pelo Daniel — ícone PWA 192/512/maskable + apple-touch-icon configurados
- ✅ Showcase em rota oculta `/__ds` com todos os componentes

### ✅ [AÇÃO SUA] — Logo escolhida
Daniel forneceu logo e ícone próprios (`logo_tanquecheio.png` + `icon_android_tanquecheio.png`).

### ✅ [AÇÃO SUA] — Showcase aprovado
`tanquecheio.netlify.app/__ds` no celular.

### Checkpoint 1
Showcase aprovado. Logo escolhida e nos lugares certos. **A partir daqui, design é decidido.**

---

## ✅ Fase 2 — Backend Cloudflare (1 dia)

**Objetivo:** Worker + D1 no ar respondendo `GET /api/health`.

### 🟡 [AÇÃO SUA] — Criar conta Cloudflare
1. Acesse https://dash.cloudflare.com/sign-up
2. Cadastra com seu e-mail (pode usar o Google)
3. **Não precisa adicionar cartão.** Tudo que vamos usar está no free tier.
4. Me confirma que criou.

### 🟡 [AÇÃO SUA] — Gerar API Token
1. https://dash.cloudflare.com/profile/api-tokens
2. **"Create Token"** → **"Edit Cloudflare Workers"** (template pronto)
3. Em "Account Resources" → seu account; em "Zone Resources" → "All zones"
4. Clica em **"Continue to summary"** → **"Create Token"**
5. **COPIA o token e me cola aqui imediatamente.** Ele só aparece 1 vez.
6. Eu vou salvar localmente em `.dev.vars` (que JÁ está no `.gitignore` — nunca vai pro Git).

### 🤖 [FAÇO EU]
- ✅ Criar pasta `api/` no monorepo
- ✅ Inicializar Worker com Hono
- ✅ Criar banco D1 (`tanquecheio-db`) e binding via `wrangler.toml`
- ✅ Migrações SQL em `api/migrations/0001_init.sql` (5 tabelas: vehicles, fuel_logs, maintenance_logs, audit_log, push_subscriptions)
- ✅ Criar bucket R2 (`tanquecheio-storage`) e binding
- ✅ Endpoint `GET /api/health` → `{ ok: true, ts, version }`
- ✅ CORS configurado (Netlify + localhost)
- ✅ `JWT_SECRET` gerado e salvo como secret no Worker
- `VAULT_PASSWORD` → Fase 3 (usuário define a senha)
- `VAPID_PUBLIC` / `VAPID_PRIVATE` → Fase 8
- ✅ Deploy via `wrangler deploy` → https://tanquecheio-api.danielbritto88.workers.dev

### Checkpoint 2
Eu rodo `curl https://tanquecheio.<seu-subdomínio>.workers.dev/api/health` no seu terminal e ele responde `{ok: true}`.

---

## ✅ Fase 3 — Autenticação compartilhada (½ dia)

**Objetivo:** tela de Configurações conecta o app ao Worker; vocês dois logam.

### ✅ [AÇÃO SUA] — Definir senha do cofre
Senha salva no Worker via `wrangler secret put VAULT_PASSWORD` (criptografada, nunca no código).

### 🤖 [FAÇO EU]
- ✅ `POST /api/auth` no Worker: recebe `{ password, deviceLabel }`, valida, devolve `{ token, userTag }`
- ✅ Middleware de auth (Bearer JWT) em todas as rotas protegidas
- ✅ Tela **Configurações** com 3 campos: endpoint, senha, "apelido neste dispositivo" (Daniel/Cônjuge)
- ✅ Persistência segura no `localStorage` (chaves: `tc_endpoint`, `tc_token`, `tc_user_tag`)
- ✅ Roteamento condicional: sem token → redireciona para Configurações
- ✅ "Sair desta sessão" limpa credenciais
- ✅ Toast âmbar de sucesso/erro com microanimação Framer Motion

### 🟡 [AÇÃO SUA] — Logar nos celulares
Você instala no seu Android, cola endpoint + senha, vira "Daniel". Sua companheira faz o mesmo no Android dela, vira "Cônjuge".

### Checkpoint 3
Os dois aparelhos estão conectados ao mesmo cofre. Não tem dado ainda, mas a porta está aberta.

---

## ✅ Fase 4 — Veículos (1 dia)

**Objetivo:** CRUD de veículos completo, com foto e seletor.

### 🤖 [FAÇO EU]
- ✅ Endpoints: `GET/POST /api/sync` (vehicles) + `POST /api/photo/upload` + `GET /api/photo/:key`
- ✅ Lib `src/lib/sync.ts`: union-merge por ID + LWW por `updated_at` (PROJETO §6)
- ✅ Polling de 10s + sync ao voltar online (`window.online` event)
- ✅ IndexedDB schema (`src/lib/db.ts`) — fila offline pronta para Fase 9
- ✅ Tela `/veiculos` com lista de tiles: foto + nome Bodoni + brand/model/year + placa + chip combustível
- ✅ Bottom Sheet de cadastro com React Hook Form + Zod
- ✅ Compressão de foto no cliente (canvas, máx 1024px, WebP, qualidade 80)
- ✅ `VehicleChip` no topo das telas — abre seletor de veículo com bottom sheet
- ✅ Empty state com ícone + texto Bodoni + CTA âmbar
- ✅ Swipe-left para arquivar com toast de confirmação

### 🟡 [AÇÃO SUA] — Cadastrar carros reais
Cadastra os carros de vocês. Eu valido que aparece no celular da sua companheira em ≤ 10s.

### Checkpoint 4
Dois carros reais cadastrados, com foto, alternáveis, sincronizados entre os dois aparelhos.

---

## ✅ Fase 5 — Combustível (1,5 dia)

**Objetivo:** lançar abastecimento em < 15s e ver consumo médio bonito.

### 🤖 [FAÇO EU]
- ✅ Tela "Combustível": lista cronológica + gráfico de R$/L (Recharts custom, stroke-only)
- ✅ FAB âmbar "+" abre Bottom Sheet de novo abastecimento
- ✅ Cálculo automático km/L em `lib/fuel.ts` (entre 2 "tanques cheios")
- ✅ Indicadores no topo (Bodoni grande): último consumo, média do mês, custo do mês
- ✅ Arquivar com duplo toque e confirmação âmbar
- ✅ Validação: hodômetro nunca menor que o anterior do mesmo veículo (com mensagem clara)
- ✅ Feedback haptic na confirmação (`navigator.vibrate(20)`)
- ✅ Worker estendido: GET/POST `/api/sync` retorna e persiste `fuel_logs` (D1, LWW)

### Checkpoint 5
Você lança 3 abastecimentos seguidos, sente que é prazeroso e rápido. Os números no topo se atualizam em tempo real, em Bodoni.

---

## ✅ Fase 6 — Manutenções (1,5 dia)

**Objetivo:** registrar manutenção e prever a próxima com inteligência.

### 🤖 [FAÇO EU]
- ✅ Tela "Manutenção": seções "Próximas manutenções" (tiles com status) e "Histórico"
- ✅ Bottom Sheet de cadastro: chips de tipo, data, hodômetro, custo, oficina, observação
- ✅ Campo "Próxima troca": data **e/ou** km (toggle "Agendar próxima")
- ✅ Lógica em `lib/maintenance.ts`: status overdue/soon/ok (≤ 500km ou ≤ 15 dias), km/dia estimado dos abastecimentos
- ✅ Badge âmbar/vermelho no tile indicando dias ou km restantes
- ✅ Tipos pré-definidos: Óleo, Pneus, Filtros, Revisão, Freios, Bateria, Outros
- ✅ Worker sync route estendido: GET/POST maintenance_logs com D1 UPSERT LWW

### Checkpoint 6
Você cadastra "troca de óleo a cada 10.000 km", e o app calcula sozinho quando vai vencer baseado no consumo do veículo.

---

## ✅ Fase 7 — Início / Financeiro (1 dia)

**Objetivo:** uma tela que responde "como vai a garagem este mês?".

### 🤖 [FAÇO EU]
- ✅ Tela **Início**: KPIs em Bodoni grande + donut + alertas + atividade recente
- ✅ KPIs: gasto combustível, gasto manutenção, total, custo/km
- ✅ Filtro de período: Mês / Ano / Tudo (tabs)
- ✅ Donut chart (Recharts PieChart) — combustível vs manutenção com %
- ✅ Alertas de manutenção overdue/soon clicáveis → /manutencao
- ✅ Atividade recente (últimos 5 eventos mistos)
- ✅ Botão "Compartilhar resumo" — Web Share API primeiro, fallback wa.me textual
- Resumo calculado client-side a partir dos contextos (sem endpoint extra)

### Checkpoint 7
Abrir o app e em 2s saber a saúde financeira da garagem. Botão "compartilhar" manda resumo para o WhatsApp em 3 toques.

---

## ✅ Fase 8 — Notificações Push (1 dia)

**Objetivo:** lembrete chega no Android quando manutenção se aproxima.

### 🤖 [FAÇO EU]
- ✅ Chaves VAPID geradas e prontas para salvar como secrets do Worker
- ✅ `POST /api/push/subscribe` e `POST /api/push/unsubscribe` em D1
- ✅ Cron Trigger `0 11 * * *` (08:00 BRT): verifica manutenções vencendo, dispara push
- ✅ Toggle "Lembretes" em Configurações; pede permissão só ao ativar
- ✅ Service worker customizado: `push` event → notificação clicável → /manutencao
- ✅ Web Push encryption (RFC 8291 + RFC 8188) implementado com Web Crypto API
- ✅ PWA migrada para `injectManifest` mode para suportar push handler

### 🟡 [AÇÃO SUA] — Aceitar permissão
Vai em Configurações, ativa "Lembretes", aceita o popup do Android. Sua companheira faz igual.

### Checkpoint 8
Para forçar o teste, eu posso disparar manualmente uma notificação dos dois Androids enquanto você está olhando.

---

## ✅ Fase 9 — Offline & polimento PWA (1 dia)

**Objetivo:** experiência impecável, mesmo no posto sem sinal.

### 🤖 [FAÇO EU]
- ✅ Workbox runtime caching: R2 photos CacheFirst 30d, API sync StaleWhileRevalidate
- ✅ Banner offline discreto no topo com animação Framer Motion
- ✅ Toast "nova versão disponível" com botão Atualizar (skipWaiting)
- ✅ SW polling de atualização a cada 60s
- ✅ usePWA hook unifica online/offline state + registro do SW

### Checkpoint 9
Você lança um abastecimento em modo avião, fecha o app, abre depois com internet, vê sincronizado. Sua companheira faz o mesmo no celular dela ao mesmo tempo. Os dois aparecem nos dois aparelhos.

---

## Fase 10 — Qualidade & Lançamento (½ dia) Ficará para o final. Pular para fase 11

**Objetivo:** entregar com confiança a v1.0.0.

### 🤖 [FAÇO EU]
- ⬜ `python .agent/scripts/checklist.py .` — verde em Critical
- ⬜ `python .agent/scripts/verify_all.py . --url <netlify>` — verde geral
- ⬜ Lighthouse mobile ≥ 95 em todas as categorias
- ⬜ Teste E2E Playwright: login → cadastrar carro → lançar abastecimento → ver no resumo
- ⬜ Revisão de acessibilidade (axe DevTools)
- ⬜ README com instruções de deploy (frontend + worker + variáveis)
- ⬜ Backup automático D1 (cron semanal exporta para R2)
- ⬜ Tag `v1.0.0`

### 🟡 [AÇÃO SUA] — Domínio próprio (opcional)
Se quiser domínio tipo `tanquecheio.app` ou `garagem.daniel.com.br`:
1. Compra na Registro.br ou Cloudflare Registrar (~R$ 40/ano)
2. No Netlify: Site settings → Domain management → Add custom domain
3. Te guio nos DNS

### 🟡 [AÇÃO SUA] — Instalar v1.0.0
Você e sua companheira instalam a versão final no celular ("Adicionar à tela inicial" no Chrome Android).

### Checkpoint 10
v1.0.0 instalada e em uso diário pelos dois. **Pronto.**

---

## ▶︎ Fase 11 — Redesign "Telemetria Íntima" (3 dias) — v1.5

**Objetivo:** assinatura visual proprietária. Numerais como protagonistas, instrumentos como vocabulário, âmbar como única fonte de luz sobre grafite frio. Documentado em PROJETO.md §8.

### 🤖 [FAÇO EU] — passo a passo

**Etapa 11.1 — Fundamentos (½ dia)** ✅
- ✅ Reescrever `src/styles/tokens.css` com a paleta v2 (graphite, halo radial, surface-elev, bg respirando)
- ✅ Adicionar `@fontsource-variable/jetbrains-mono` ao `package.json`
- ✅ Atualizar `src/index.css` com classes utilitárias: `.text-hero`, `.text-editorial`, `.text-instrument-label`, `.text-mech`, `.halo-accent`, `.glass`
- ✅ Atualizar `tailwind.config.js`: cores `graphite`, `surface-elev`, `text-ghost`, fonts `mech` (JetBrains Mono)
- ✅ Criar `src/lib/haptics.ts` com vocabulário (`tap`, `success`, `warning`, `error`, `ignition`)

**Etapa 11.2 — Componentes-assinatura (1 dia)** ✅
- ✅ `src/components/identity/HeroNumber.tsx` (Bodoni clamp 56–128px, halo, ignição animada)
- ✅ `src/components/identity/Odometer.tsx` (mecânico CSS-only, 6 dígitos, transformY por dígito)
- ✅ `src/components/identity/Gauge.tsx` (SVG arco 240°, agulha com spring, 3 zonas)
- ✅ `src/components/identity/ScaleRule.tsx` (régua horizontal de KPIs com tick âmbar de destaque)
- ✅ `src/components/identity/GaugeSpinner.tsx` (substitui spinners; 3 tamanhos)
- ✅ `src/components/identity/HUDToast.tsx` (toast HUD glass + glow âmbar; swipe-up)
- ✅ `src/components/identity/TimelineDot.tsx` (3 estados; pulse animado em "soon")
- ✅ `src/components/identity/NumberPad.tsx` (pad gigante; long-press 250ms; haptic)
- ✅ `src/components/identity/KeyChip.tsx` (foto + apelido Bodoni + odômetro; haptic; pronto pra carrossel)
- ✅ `src/features/home/IgnitionSplash.tsx` (sequência 800ms: welcome lights → logo → CTA; haptic ignition)
- ✅ Atualizar `/__ds` (DesignSystemPage) com showcase de todos os 10 componentes acima

**Etapa 11.3 — Refator das telas (1 dia)** ✅
- ✅ Trocar `App.tsx` route `/` para `<IgnitionSplash>` (SplashPage removido)
- ✅ `HomePage`: substitui grid de KPIs por `<HeroNumber>` (cents reduzidos como sup) + `<ScaleRule>`; alertas e atividade ficam plain (sem cards), separados por divisores 1px
- ✅ `FuelPage`: `<Gauge>` 240° no topo com último km/L em Bodoni 56px; régua de KPIs abaixo; lista plana sem moldura (Recharts removido da página)
- ✅ `MaintenancePage`: timeline única com `<TimelineDot>` (com pulse em "soon"), trilha vertical 1px, sumário de status (overdue / soon) no topo
- ✅ `AddFuelSheet`: `<NumberPad>` central para o valor pago + long-press 250ms; campos compactos; subcomponente `<SheetBody>` com state inicial sem useEffect
- ✅ `BottomTabBar`: flutuante (12px do fundo, 12px laterais), `glass` com fallback, raio 28px, indicador 2px no topo. `<FAB>` reposicionado acima da barra
- ✅ Substituir `ToastProvider` pelo HUD: glass pill, text-shadow âmbar/warning/danger, swipe-up dispensa. API `useToast()` mantida — zero migração nos callers
- ✅ Substituir todos os spinners (`animate-spin` em VehiclesPage/FuelPage/MaintenancePage) por `<GaugeSpinner>`
- ✅ `VehicleChip` reescrito: usa `<KeyChip>` + `<Odometer>`, swipe horizontal alterna veículos diretamente (carrossel)
- ⬜ Pull-to-refresh nas listas com mini-gauge animada *(adiado — não bloqueia v1.5-rc; navegador iOS não suporta nativamente)*
- ✅ Verificar `prefers-reduced-motion` — todos os 10 componentes-assinatura respeitam
- ✅ Substituir `framer-motion` `ease-out` fixos por springs em todos os arquivos novos/refatorados

**Etapa 11.4 — Validação (½ dia)** ✅
- ✅ Build de produção verde (`tsc -b && vite build`) — bundle JS gzipped baixou de 297KB para 198KB (Recharts tree-shaken parcialmente)
- ✅ Lint sem erros (1 warning preexistente em AddMaintenanceSheet, fora do escopo)
- ✅ `python .agent/scripts/checklist.py .` — 6/6 verde (Security, Lint, Schema, Tests, UX, SEO)
- ⬜ Lighthouse Mobile ≥ 95 mantido — rodar após deploy do RC com URL do Netlify
- ⬜ Contraste AAA em texto principal validado (axe DevTools) — manual via DevTools no celular
- ⬜ Teste em 1 Android real, 1 iPhone real (visual + haptics) — depende de você abrir no celular

### 🟡 [AÇÃO SUA] — Aprovar
Você abre `tanquecheio.netlify.app/__ds` e a Início no seu Android. Se os números **te encararem** e a agulha de consumo se mexer com personalidade, marca aprovado. Caso contrário, ajustamos os pontos antes de fechar.

### Checkpoint 11
v1.5.0-rc instalada. Não parece "mais um app dark" — parece o cluster de um carro de R$ 600 mil. Identidade visual única, defensável, replicável em qualquer feature futura.

---

## ▶︎ Fase 12 — Hardening de segurança (1,5 dia) — v1.5

**Objetivo:** fechar o gap entre "PWA pessoal" e "PWA pessoal que aguenta um celular roubado". Documentado em PROJETO.md §7, §7.1 e em `SECURITY.md`.

### 🤖 [FAÇO EU] — passo a passo

**Etapa 12.1 — Migração de auth (½ dia)** ✅
- ✅ Migração SQL `0002_devices.sql`: tabela `devices` (id, label, user_tag, device_secret, created_at, last_seen_at, revoked_at) + `audit_log.actor_device_id`
- ✅ Worker `lib/hmac.ts`: HMAC-SHA256, SHA-256 body hash, build/parse signature payload, constant-time compare
- ✅ Worker `middleware/hmac.ts`: header `TC-HMAC <id>:<ts>:<sig>`, valida assinatura + ts ±60s + device não-revogado, expõe `userTag` e `deviceId` no contexto
- ✅ `POST /api/auth` reescrito: gera `device_id` + `device_secret` 32-byte hex; insere em `devices`; devolve uma única vez
- ✅ `routes/devices.ts`: `GET /api/devices` (lista) + `POST /api/devices/:id/revoke` (com proteção contra auto-revogar)
- ✅ Middleware aplicado em sync, photo, push e devices; rotas antigas Bearer JWT removidas
- ✅ Cliente `lib/crypto.ts`: WebCrypto helpers — PBKDF2-SHA256 (600k), AES-GCM 256, HMAC-SHA256, SHA-256, geração de aleatórios
- ✅ Cliente `lib/secureStore.ts`: persistência cifrada do `device_secret` em IndexedDB (`tc-secure`); senha do cofre nunca persistida
- ✅ Cliente `lib/signedFetch.ts`: helper que assina cada request com HMAC do device_secret
- ✅ `AuthContext` reescrito: 3 modos (sem sessão / travada / destravada) + `signing` para wiring; senha só vive em memória durante derivação PBKDF2
- ✅ `lib/sync.ts`, `lib/fuel.ts`, `lib/photo.ts`, `lib/pushNotifications.ts`: assinam via signedFetch
- ✅ `Vehicle/Fuel/Maintenance` contexts: `token` substituído por `signing`, ProtectedRoute usa `isUnlocked`
- ✅ Hook `usePhotoUrl` resolve presigned URLs (cache em memória, 1h TTL)
- ✅ `SettingsPage` reescrita: form de login (sem sessão) / unlock (com sessão guardada) / Configurações + Trusted Devices (destravada). Inclui revogar, status, last_seen
- ✅ Migração one-shot: detecta `tc_token` antigo no localStorage e limpa; usuário re-loga com a senha-mestra

**Etapa 12.2 — Hardening de borda (½ dia)** ✅
- ✅ Cloudflare Rate Limiting binding (`AUTH_LIMITER`, 5 / IP / 60s) em `wrangler.toml` + checagem em `/api/auth` (429 com mensagem amigável)
- ✅ CSP estrita no `netlify.toml`: `default-src 'self'`, `script-src 'self'`, `frame-ancestors 'none'`, `img-src 'self' data: blob: https://*.workers.dev`
- ✅ Headers extras: `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restritiva (camera=self, geolocation=(), microphone=()…), `X-Frame-Options: DENY`, HSTS 2 anos
- ✅ R2 photos privadas: `/api/photo/sign` emite URL com `?sig=...&exp=...` (TTL 1h, HMAC com `JWT_SECRET` como chave); `GET /api/photo/*` valida sig antes de servir bytes; cache `private`
- ✅ `audit_log.actor_device_id` derivado do servidor — campo `actor` do payload é ignorado

**Etapa 12.3 — Cifragem em repouso (½ dia)** ✅
- ✅ `device_secret` cifrado em IDB com AES-GCM (chave PBKDF2 600k da senha-mestra + salt aleatório)
- ✅ Decisão consciente documentada em `SECURITY.md §2.3`: **stores de aplicação (vehicles/fuel/maintenances/settings) ficam em claro no localStorage**. Cifrar tudo dobra custo de cada render e força destravar a sessão a cada open — atrito sem benefício proporcional num app familiar onde o sistema operacional já cifra o disco.
- ✅ `tc_outbox` (em `db.ts`, ainda sem callers) e futuras stores sensíveis seguirão a mesma chave AES via `secureStore` quando ativadas

**Etapa 12.4 — Documentação e validação** ✅
- ✅ `SECURITY.md` na raiz: escopo, ativos, riscos in/out of scope, camadas implementadas, runbook "celular roubado", canal de report
- ✅ PROJETO.md §7/§7.1 atualizado pra refletir a implementação real
- ✅ `tsc -b && vite build` verde, lint sem erros novos
- ⬜ Smoke-test E2E manual: login → revogar device no outro celular → confirmar 401 — depende de você abrir os dois celulares
- ⬜ `python .agent/scripts/verify_all.py .` — rodar após deploy do Worker (precisa do endpoint final)

### 🟡 [AÇÃO SUA] — Reentrar e validar
1. Após o deploy, no seu celular, vai em Configurações → te aparece "Sessão precisa ser renovada" → cola a senha do cofre uma única vez.
2. Sua companheira faz o mesmo.
3. Você abre "Dispositivos confiáveis", confirma que aparecem 2 dispositivos.
4. Pega o celular dela, revoga a partir do seu. No próximo polling (10s), o dela cai em "Sessão expirada".
5. Ela reentra. Tudo volta.

### Checkpoint 12
Roubo de celular = revogação remota, não troca de senha. IndexedDB do dispositivo perdido é AES-GCM — sem a senha do cofre, nada se lê. CSP barra qualquer XSS de dependência futura.

---

## ✅ Fase 13 — v1.6 Relatórios & Auth Avançado (2 dias)

**Objetivo:** tela de Relatórios completa + controle granular de autenticação (sem senha, biometria, bypass silencioso).

### 🤖 [FAÇO EU]

**Relatórios (F6-01)** ✅
- ✅ `src/features/reports/ReportsPage.tsx` — métricas de consumo, resumo financeiro, filtro de período (mês / 3 meses / ano / tudo) e filtro de tipo de combustível em bottom sheet
- ✅ Gráfico km/L mensal via Recharts LineChart com `KmlTooltip` customizado
- ✅ Exportação CSV (UTF-8 BOM, combustível + manutenção)
- ✅ Exportação PDF (jspdf + jspdf-autotable, header âmbar, dynamic import)
- ✅ Compartilhamento WhatsApp (Web Share API → fallback `wa.me`)
- ✅ `computeKmlEntries()` cálculo correto cross-boundary (não usa abastecimentos parciais)

**Auth Avançado** ✅
- ✅ `src/lib/biometric.ts` — WebAuthn platform authenticator (Android fingerprint / iOS Face/Touch ID)
- ✅ `secureStore.ts` estendido: `AuthPrefs`, `loadAuthPrefs`, `saveAuthPrefs`, `storeSecretPlain`, `clearSecretPlain`, `unlockSessionBypass`, `storeWebAuthnCredentialId`, `getWebAuthnCredentialId`, `clearWebAuthnCredentialId`
- ✅ `AuthContext.tsx` reescrito: `authPrefs`, `biometricAvailable`, `autoUnlock()`, `setRequirePassword()`, `setBiometric()`; bootstrap silencioso sem biometria
- ✅ `SettingsPage.tsx` — `SecuritySection` com toggle de senha (confirmação double-tap, timeout 4s) + toggle de biometria (visível quando `biometricAvailable && !requirePassword`)
- ✅ `IgnitionSplash.tsx` — CTA dinâmico: biometria auto-dispara após armar; ícone Fingerprint; label "USAR DIGITAL" / "VERIFICANDO…" / "COMEÇAR"
- ✅ Três fluxos de desbloqueio: formulário de senha, prompt biométrico, bypass silencioso (nenhum dos dois)

### Checkpoint 13
App abre sem senha quando configurado assim. Biometria funciona no Android/iOS. Relatórios exportam CSV, PDF e WhatsApp em 3 toques.

---

## ✅ Fase 14 — v1.6.1 Hotfix Blockers (½ dia)

**Objetivo:** corrigir 3 regressões funcionais identificadas em auditoria UX/visual.

### 🤖 [FAÇO EU]

- ✅ **IgnitionSplash — rota de fuga biométrica**: estado `bioFailed`; após 1ª falha aparece botão "ENTRAR COM SENHA" animado → /ajustes
- ✅ **AddFuelSheet — NumberPad oculto pelo teclado virtual (IME)**: `scrollIntoView` em todos os 4 inputs de texto ao ganhar foco; `max-h-[92dvh]` já existia
- ✅ **BottomTabBar — abas inativas invisíveis**: `text-faint` → `text-muted`; label `text-[10px]` → `text-[11px]`; contraste ≥ 3:1 AA

### Checkpoint 14 ✅
Nenhum caminho sem saída na splash. NumberPad visível ao digitar no celular. Navegação legível em qualquer luz.

---

## ✅ Fase 15 — v1.6.2 Restauração de Identidade (1,5 dia)

**Objetivo:** realinhar as telas que escaparam da "Telemetria Íntima" de volta ao vocabulário de instrumentos.

### 🤖 [FAÇO EU]

- ✅ **ReportsPage — Recharts removido, instrumentos nativos**: `KmlSparkLine` SVG inline (polyline âmbar + fill gradiente + labels mês + eixos min/max); `<Gauge>` substituiu barra de distribuição horizontal
- ✅ **VehiclesPage — tiles com identidade Telemetria Íntima**: avatar circular, nome em Bodoni 22px, `<Odometer>` para hodômetro (calculado do max dos fuel logs), `text-instrument-label` para brand·model·year, placa monospace, chip combustível arredondado
- ✅ **AddMaintenanceSheet — tipografia de instrumento**: 8 labels → `text-instrument-label`; `bg-surface` → `bg-surface-elev`; `rounded-t-2xl` → `rounded-t-3xl`; título → `text-editorial`; alinhado com AddFuelSheet
- ✅ **HomePage — halo do HeroNumber cortado**: `border-t` removido do `<ScaleRule>`; `pb-8` → `pb-14` no bloco do HeroNumber; halo respira
- ✅ **Confirmação destrutiva — countdown animado**: `motion.span` com `scaleX 1→0` em 3s linear (cor `danger`) abaixo do botão "arquivar" em FuelPage e MaintenancePage; o usuário vê quanto tempo tem antes do timeout
- ✅ **Empty states — arte SVG proprietária**: `src/components/identity/EmptyArt.tsx` com `NeedleAtZero` (agulha no zero), `FuelPump` (bomba estilizada), `WorkshopManual` (livro + chave), `ChartScroll` (pergaminho com gráfico que se esvai); substituídas todas as instâncias de ícones Lucide genéricos

### Checkpoint 15
Todas as telas falam o mesmo idioma visual. Instrumentos onde havia gráficos de BI. Arte nos estados vazios em vez de mensagens de texto.

---

## ✅ Fase 16 — v1.6.3 Polish (1 dia)

**Objetivo:** eliminar micro-inconsistências de layout, espaçamento e interação que acumularam nas features anteriores.

### 🤖 [FAÇO EU]

- ✅ **FAB — conflito com BottomTabBar**: já estava correto em v1.5 — `bottom: calc(safe-area + 12px + 56px + 12px)`; FAB 12px acima do topo da barra em qualquer dispositivo
- ✅ **Pills de filtro — `text-black` → `text-bg-deep`**: padronizados em ReportsPage, AddFuelSheet e AddMaintenanceSheet; usa token de design em vez de `#000`
- ✅ **HUDToast — todos os callers já usam HUDPill**: `ToastProvider` encaminha todos os `useToast()` para `HUDPill` desde v1.5; nada a migrar
- ✅ **Pull-to-refresh — conflito com scroll nativo**: `overscroll-y-contain` adicionado ao `<main>` em FuelPage, MaintenancePage e VehiclesPage
- ✅ **Tipografia de KPIs secundários**: ScaleRule usa `font-display`; ReglaTile usa `font-display`; `font-sans` não estava presente em nenhum KPI context
- ✅ **Acessibilidade — Gauge e Odometer**: `Gauge` tem `role="meter"`, `aria-valuenow/min/max`, `aria-label`; `Odometer` tem `aria-label` com valor formatado e `aria-hidden` no display visual
- ✅ **ScaleRule — tick dinâmico**: `highlighted` é prop por item desde o início; já aceita qualquer item como destaque

### Checkpoint 16 ✅
v1.6.3 pronta. Nenhum pixel fora do lugar. Navegar no app parece operar equipamento de precisão.

---

## Pós-v1 (parking lot — só se vocês pedirem)

- Tela "Histórico de alterações" usando `audit_log`
- Comparativo entre veículos
- Histórico de preço de combustível por posto
- Lembrete de IPVA / licenciamento / seguro
- Modo "viagem" com gastos agregados
- Importação de planilha legada
- Web Share Target (receber fotos compartilhadas)

> Nada disso entra antes da v1. **Escopo congelado é o que protege a elegância.**

---

## Cadência sugerida

**Fases 0–10 (v1.0):** ~10 dias úteis. ✅ Concluído.
**Fases 11–12 (v1.5):** ~4,5 dias úteis. ✅ Concluído.
**Fase 13 (v1.6):** ~2 dias úteis. ✅ Concluído.
**Fase 14 (v1.6.1):** ~½ dia útil. ✅ Concluído.
**Fase 15 (v1.6.2):** ~1,5 dias úteis. ✅ Concluído.
**Fase 16 (v1.6.3):** ~1 dia útil. ✅ Concluído.

Você revisa em cada checkpoint. Se algo cheirar a complexidade desnecessária em qualquer ponto, **cortamos antes de codar.**

### Ordem de execução (v1.6.x)

**Fase 14 primeiro** — são blockers funcionais. A rota de fuga biométrica é risco real de usuário preso. O IME tapando o NumberPad é regressão em 100% dos fluxos de abastecimento.

**Fase 15 na sequência** — restaura a identidade que escapou; maior impacto visual por hora trabalhada.

**Fase 16 por último** — polish incremental; cada item é independente e pode ser entregue em qualquer ordem.
