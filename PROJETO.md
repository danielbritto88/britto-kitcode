# Tanque Cheio

> Controle pessoal de automóveis — manutenções, combustível e finanças.
> PWA Android-first, elegante, premium e à prova de offline a dois.

> **v1.5 (entregue)** — redesign **"Telemetria Íntima"** + hardening de segurança.
> Mudanças concentradas em §7 (auth endurecida via HMAC), §7.1 (hardening de borda + cifragem seletiva), §8 (UX/Visual reescrito) e §12 (critérios atualizados). O escopo funcional (§2) permanece congelado. Threat model documentado em `SECURITY.md`.

---

## 0. Como este documento se relaciona com o `.agent`

Este projeto roda sobre o **Antigravity Kit** instalado em `.agent/`. O Claude Code carrega `CLAUDE.md` na raiz, que aponta para `.agent/rules/CORE.md`. Toda decisão técnica seguiu o protocolo:

- **Agente principal:** `frontend-specialist` (PWA = web technology, React + service worker)
- **Skill secundária:** `mobile-design` (UX touch-first, thumb zone, 48dp targets — Android é prioridade)
- **Workflow consultado:** `/ui-ux-pro-max` (paleta, tipografia e estilo escolhidos por busca, não por chute)
- **Validação obrigatória antes de "pronto":** `python .agent/scripts/checklist.py .` e `verify_all.py`

Toda futura sessão repete esse processo automaticamente.

---

## 1. Visão e princípios

App familiar. Você e sua companheira. Dois Androids principais (e um iPhone eventual de visita). Nada de menus profundos. Nada de configurações que ninguém entende.

**Não-negociáveis:**

1. **Simples por padrão.** Se um recurso precisa de explicação, ele não entra.
2. **Premium na execução.** Tipografia editorial, espaçamento generoso, microinterações de aplicativo nativo.
3. **Android-first** (≥ 90% do uso). iOS suportado como bônus, sem regressões.
4. **Offline a dois sem perda.** Vocês podem cadastrar simultaneamente sem internet — nada se descarta.
5. **Bateria respeitada.** OLED puro `#000000`, animações GPU, polling econômico.
6. **Identidade própria (v1.5).** O app não pode parecer "mais um SaaS dark". Tem que **comunicar carro** em cada tela.

---

## 2. Funcionalidades (escopo congelado)

### 2.1 Veículos
- Cadastrar (apelido, marca/modelo, ano, placa, foto, cor, combustível padrão, hodômetro inicial).
- Editar e **arquivar** (não excluir — histórico é sagrado).
- Trocar entre veículos via chip persistente no topo.

### 2.2 Combustível
- Lançar abastecimento: data, posto (opcional), litros, valor total, hodômetro, tipo, **tanque cheio? (sim/não)**.
- Cálculo automático: **R$/litro**, **km rodados**, **km/litro** (entre dois "tanque cheio" consecutivos).
- Histórico cronológico + média móvel.

### 2.3 Manutenções
- Lançar: tipo (óleo, pneus, filtros, revisão, freios, outros), data, hodômetro, custo, oficina, observação.
- **Próxima troca** por data **e/ou** km (ex.: óleo a cada 10.000 km **ou** 6 meses — o que vier antes).
- Lembretes automáticos quando faltar ≤ 500 km **ou** ≤ 15 dias.

### 2.4 Financeiro / Início
- Dashboard único: gasto do mês, do ano, custo/km, distribuição combustível vs manutenção.
- Filtro por veículo e período (mês, ano, tudo).
- Exportar PDF (um botão, sem submenu) e compartilhar via WhatsApp (Web Share API).

### 2.5 Notificações
- Push Web (PWA) para manutenções vencendo. Permissão pedida só ao ativar o lembrete.
- Badge no ícone do app quando houver pendência (Badging API).

### 2.6 Configurações (uma única tela)
- **Conexão Cloudflare**: endpoint do Worker + senha do cofre (este é o "login").
- **Dispositivos confiáveis** (v1.5): lista os celulares vinculados ao cofre, permite revogar individualmente.
- Tema (claro/escuro/sistema). Padrão: escuro OLED.
- Moeda e unidades (BRL/km/L como padrão).
- "Sair desta sessão" (limpa credenciais locais).

**Fora do escopo (intencional):** múltiplas contas individuais, OAuth, integrações bancárias, OCR de notas, GPS, comunidade, gamificação.

---

## 3. Stack de tecnologia

### Decisão guiada pelo já validado
Sua referência (`controle-financeiro`) já provou em produção: **Vite + React 19 + Tailwind + Framer Motion + lucide-react + vite-plugin-pwa**, com Context API + localStorage + polling. Mantemos a base e adicionamos só o que o escopo novo exige.

| Camada | Escolha | Motivo |
|---|---|---|
| Build | **Vite 7** | Mesma do controle-financeiro |
| Framework | **React 19 + TypeScript (strict)** | TS protege refatorações; controle-financeiro era JS, mas o escopo aqui justifica |
| Estilo | **Tailwind CSS v3** + variáveis CSS | Familiar; v4 ainda muda conventions |
| Componentes | **Radix UI primitives** + componentes próprios da identidade Telemetria Íntima | Acessível por baixo, identidade por cima |
| Ícones | **Lucide** + ícones SVG inline próprios (agulha, hodômetro, gauge) | Lucide para genérico; SVG para identidade |
| Animação | **Framer Motion** (springs por padrão) | Microinterações físicas, não keyframed |
| Estado | **Context API** + reducers | Mesmo padrão que você já validou |
| Persistência local | **localStorage** + **IndexedDB** (`idb`) **com AES-GCM (v1.5)** | Compatibilidade + segurança em repouso |
| Formulários | **React Hook Form + Zod** | Validação tipada, schema único |
| Gráficos | **Recharts** + componentes SVG próprios (`<Gauge>`, `<Odometer>`) | Recharts apenas para linhas; instrumentos são autorais |
| Datas | **date-fns** | Mesma do controle-financeiro |
| PDF | **jspdf + jspdf-autotable** | Mesmo da sua referência |
| Compartilhamento | **Web Share API** + fallback `wa.me` + (futuro) PNG via Canvas | Manda PDF/CSV/imagem pra WhatsApp nativo |
| PWA | **vite-plugin-pwa** (Workbox, modo `injectManifest`) | Push handler customizado |
| Roteamento | **React Router v6** | Padrão web |

**Tipografia (v1.5):** `@fontsource-variable/bodoni-moda` + `@fontsource-variable/jost` + `@fontsource-variable/jetbrains-mono` (mecânica). Tudo offline-first, sem chamada Google.

### Backend
| Camada | Escolha | Motivo |
|---|---|---|
| Runtime | **Cloudflare Workers** (Hono) | Edge global, free tier abundante |
| Banco | **Cloudflare D1** (SQLite) | Free 5GB, agregações reais |
| Storage de fotos | **Cloudflare R2** (presigned URLs, v1.5) | Free 10GB, sem egress fee, agora privado |
| Auth | **Senha do cofre + device tokens HMAC (v1.5)** | Substitui JWT; revogação por dispositivo |
| Rate limit | **Cloudflare Rate Limiting** em `/api/auth` | 5 tentativas / IP / 15min |

### Hospedagem
- **Frontend → Netlify** (build automático no `git push`, com headers CSP estritos).
- **Backend → Cloudflare** (deploy via `wrangler`).

### Qualidade
- ESLint + Prettier + TypeScript strict.
- Vitest (unidade) + Playwright (1 happy-path E2E antes de release).
- Lighthouse ≥ 95 obrigatório.
- Scripts do kit: `python .agent/scripts/checklist.py .` antes de PR; `verify_all.py` antes de deploy.

---

## 4. Arquitetura

```
┌─────────────────────────────┐
│  PWA React (Netlify CDN)    │
│  ├─ localStorage (estado)   │
│  ├─ IndexedDB (cifrado AES) │
│  └─ Service Worker (Workbox)│
└──────────────┬──────────────┘
               │ HTTPS + HMAC por request
               ▼
┌─────────────────────────────┐
│  Cloudflare Worker (Hono)   │
│  ├─ /api/auth   (rate-lim)  │
│  ├─ /api/sync   (GET + POST)│
│  ├─ /api/photo/upload + URL │
│  ├─ /api/devices/*          │
│  └─ /api/push/*             │
└──────────────┬──────────────┘
       ┌───────┴────────┐
       ▼                ▼
┌────────────┐    ┌──────────┐
│   D1 SQL   │    │  R2 priv │
│ (dados)    │    │ (fotos)  │
└────────────┘    └──────────┘
```

**Filosofia de dados:** local-first. Toda mutação grava em localStorage **imediatamente** (UI nunca espera rede). Sincronização acontece em background a cada 10s (polling, padrão do controle-financeiro) e com debounce de 2s após mudanças.

---

## 5. Modelo de dados

### Tabelas D1 (servidor)

```sql
vehicles      (id TEXT PK, nickname, make, model, year, plate, color,
               fuel_type, photo_key, odometer_initial,
               archived_at, created_at, updated_at)

fuel_logs     (id TEXT PK, vehicle_id, date, station, liters, total_cost,
               odometer, fuel_type, full_tank,
               created_at, created_by, updated_at)

maintenances  (id TEXT PK, vehicle_id, type, date, odometer, cost, workshop,
               note, next_due_date, next_due_km,
               created_at, created_by, updated_at)

settings      (id=1, currency, units, theme, push_subscriptions JSON)

audit_log     (id TEXT PK, entity, entity_id, action,
               actor_device_id, payload JSON, ts)

-- v1.5
devices       (id TEXT PK, label, user_tag,
               secret_hash TEXT,            -- HMAC-SHA256 do device_secret
               created_at, last_seen_at,
               revoked_at, kdf_salt TEXT)   -- salt para PBKDF2 do cliente
```

**IDs:** `crypto.randomUUID()` (gerados no cliente). Garante union sem colisão.

**`updated_at`** por entidade + **`audit_log`** para histórico completo de mudanças (a base do "nada se perde", ver §6).

**`actor_device_id`** (v1.5): derivado pelo servidor a partir do request autenticado, **nunca** do payload do cliente.

### Espelho local (localStorage / IndexedDB)
Mesma estrutura, JSON. Chaves prefixadas: `tc_vehicles`, `tc_fuel_logs`, `tc_maintenances`, `tc_settings`, `tc_audit`, `tc_outbox` (fila pendente).

**v1.5:** `tc_outbox`, `tc_audit` e `tc_device_secret` em IndexedDB cifrados com AES-GCM (chave derivada da senha do cofre via PBKDF2-SHA256, 600.000 iterações, salt vindo do servidor).

---

## 6. Sincronização "nada se perde" (a dois, offline)

> Esta é a parte mais delicada do app. Você foi explícito: **nenhuma atualização pode ser descartada**, mesmo se você e sua companheira editarem ao mesmo tempo, offline.

### Princípios

1. **IDs únicos no cliente** (UUID v4). Insert nunca colide.
2. **Union merge por ID** (estratégia validada no `controle-financeiro`). Server e local se fundem; nada some.
3. **Para edições do mesmo registro**: registramos **ambas as versões** no `audit_log` (histórico imutável) e aplicamos **last-write-wins por campo** com timestamp ao registro visível.
4. **Soft delete sempre** (`archived_at`). Nada é apagado de verdade.

### Algoritmo de merge

```
Quando o cliente faz GET /api/sync:
  serverState = {vehicles, fuel_logs, maintenances, audit_log_since_X}
  localState  = lê localStorage

  Para cada entidade (vehicles, fuel_logs, maintenances):
    mapById = Map()
    
    1. Adiciona TODOS os itens do servidor ao mapa
    2. Para cada item local:
       a. Se ID não existe no mapa → adiciona (insert local nunca sincronizado)
       b. Se ID existe → compara updated_at:
          - Se local.updated_at > server.updated_at → mantém local
          - Senão → mantém servidor
    3. Resultado = mapa.values()

  audit_log:
    Append-only. Cliente envia eventos novos; servidor devolve eventos faltantes.
    Toda edição (mesmo a "perdedora") está registrada aqui — nada se perde.
```

### Upload (POST /api/sync)

```
Cliente envia:
  - state atual (após merge local)
  - audit_events novos (gerados desde último upload)

Servidor:
  - Reaplica o mesmo merge contra o state em D1
  - Append nos audit_events (com actor_device_id derivado do token)
  - Devolve state final + last_sync_ts
```

### Cenário real

```
14:30 — sem internet — Daniel cadastra abastecimento R$ 250 (id=A)
14:31 — sem internet — Cônjuge cadastra abastecimento R$ 180 (id=B)
14:35 — Daniel volta online → sync envia A → server agora tem A
14:40 — Cônjuge volta online → sync recebe A, envia B → ambos têm A+B

Nenhum lance se perde. Os dois registros independentes coexistem.
```

```
Cenário raro de edição concorrente:
14:30 — ambos offline, ambos editam A: Daniel muda valor para R$ 260; Cônjuge muda posto.
14:35 — Daniel sincroniza primeiro → A.value=260, audit:[edit_value_by_daniel]
14:40 — Cônjuge sincroniza → A.station=novo, audit:[edit_value_by_daniel, edit_station_by_conjuge]

Resultado: ambas as edições preservadas. Audit log mostra as duas mãos.
```

### Tela "Histórico" (opcional, fase posterior)
A partir do `audit_log`, podemos exibir uma timeline de "quem alterou o quê e quando". Útil para confiança, debug e reverter manualmente.

### Fila offline (`tc_outbox`)
Mutações feitas offline entram numa fila em IndexedDB. Quando o navegador detecta `online`, processamos a fila em ordem FIFO contra `/api/sync`.

---

## 7. Autenticação compartilhada (cofre) — endurecida (v1.5)

Sem cadastro. Sem reset por e-mail. **Uma senha-mestra do cofre**, definida na variável `VAULT_PASSWORD` do Worker — mas a sessão de cada celular é um **device token independente**, revogável.

### Fluxo

1. Em **Configurações**, usuário cola endpoint do Worker + senha do cofre + apelido do dispositivo (`Daniel` / `Cônjuge`).
2. App envia `POST /api/auth { password, deviceLabel, userTag }`. Worker valida a senha (constant-time compare), gera:
   - `device_id` (UUID)
   - `device_secret` (256-bit aleatório, devolvido **uma única vez** ao cliente)
   - `kdf_salt` (16 bytes aleatórios, persistidos em `devices.kdf_salt`)
   - persiste `secret_hash = HMAC-SHA256(JWT_SECRET, device_secret)` para verificação subsequente.
3. Cliente deriva `vault_key = PBKDF2-SHA256(senhaCofre, kdf_salt, 600_000 iter)` e cifra `device_secret` em IndexedDB com AES-GCM(`vault_key`). Senha original **não** persiste em lugar nenhum no cliente.
4. Cada request à API leva header de autenticação:
   ```
   Authorization: TC-HMAC <device_id>:<unix_ts>:<signature>
   signature = HMAC-SHA256(device_secret, METHOD + "\n" + PATH + "\n" + unix_ts + "\n" + sha256(body))
   ```
   Servidor rejeita: `unix_ts` fora de ±60s (replay), `device_id` revogado, ou assinatura inválida.
5. Tela **Dispositivos confiáveis** em Configurações lista todos os devices ativos (`label`, `userTag`, `last_seen_at`) e permite revogar cada um (`POST /api/devices/:id/revoke`).
6. Para nuking total: trocar `VAULT_PASSWORD` no Cloudflare → todas as derivações de chave anteriores ficam inválidas → reentrar em todos os dispositivos.

### Por que não JWT
JWT em localStorage = uma falha de XSS expõe a sessão completa por 30 dias. Com HMAC por request:
- O `device_secret` fica em IndexedDB cifrado, **não em localStorage**.
- Mesmo se vazar, é substituível: revoga 1 device, mantém os outros.
- Replay-protegido nativamente (timestamp + signature).
- Custo: ~3ms de WebCrypto por request — invisível.

---

## 7.1 Hardening adicional (v1.5)

| Frente | Implementação |
|---|---|
| **Rate limit** | Cloudflare Rate Limiting em `/api/auth` (5 tentativas / IP / 15min). Configurado via `wrangler.toml`. |
| **CSP estrita** | No `netlify.toml`: `default-src 'self'; img-src 'self' data: https://<r2-domain>; connect-src 'self' https://<worker-domain>; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`. |
| **R2 privado + presigned URLs** | Bucket sem acesso público. Cliente pede `GET /api/photo/:key` → Worker valida HMAC e devolve URL assinada (TTL 3600s). Cliente cacheia URL, não o objeto. |
| **`audit_log.actor_device_id` server-derived** | Worker ignora qualquer campo `actor` no payload — usa `device_id` autenticado como fonte da verdade. |
| **IndexedDB cifrado** | `tc_outbox`, `tc_audit`, `tc_device_secret` cifrados com AES-GCM via WebCrypto (`vault_key` derivada por PBKDF2). Stores em claro no IDB são apenas dados públicos do veículo (foto cacheada, settings de UI). |
| **Push subscriptions privadas** | Armazenadas com `device_id` ligado, nunca expostas em GETs. Apenas o cron do Worker as lê. |
| **Sanitização de campo livre** | `DOMPurify` em qualquer renderização HTML derivada de `station`/`workshop`/`note` — relevante quando entrar Canvas/satori para PNG de share. Hoje (jspdf-autotable não interpreta HTML) o risco é zero, mas o pipeline já fica pronto. |
| **Headers de segurança Netlify** | `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(self), geolocation=()`. Câmera é necessária para foto do veículo. |
| **Threat model documentado** | `SECURITY.md` na raiz do repo descreve escopo, não-objetivos, runbook de "celular roubado". |

### Fora do escopo de segurança (intencional)
- **2FA / MFA**: o app é familiar com 2 dispositivos confiáveis — adicionar fator extra é cerimônia desnecessária.
- **OAuth / SSO**: a senha do cofre é o login, ponto.
- **Server-side logging com PII**: violaria §11.
- **HSM / KMS para `JWT_SECRET`**: secret do Worker já vive no Cloudflare, isolado do código.

---

## 8. UX e Visual — "Telemetria Íntima" (v1.5)

> A v1.0 entregou um dark-mode-correto-mas-genérico. A v1.5 vai onde poucos apps vão: **transforma o app num instrumento**, não numa lista. Numerais são os atores; tudo o resto é cenário.

### 8.1 Conceito
**Telemetria Íntima.** Cluster de instrumentos de carro elétrico premium (Polestar 3, Lucid Air, Porsche Taycan) com calor doméstico de painel à noite. Não é dashboard SaaS. Não é fintech. É um **cluster de instrumentos**, com a luz quente do habitáculo.

**Princípios visuais não-negociáveis:**

1. **Números são o protagonista absoluto.** Jamais compartilham hierarquia com gráficos ou ícones na mesma área visual.
2. **Bodoni só em escala ≥ 56px.** Em corpo, vira "Times quebrado". Em escala de instrumento, vira assinatura.
3. **Uma fonte de luz por tela.** O âmbar marca o que importa **agora**. Tudo o mais vive em grafite.
4. **Geometria de instrumento.** Arcos, escalas, agulhas, hodômetros — não apenas cards retangulares.
5. **Profundidade por luz, não por sombra.** Halos radiais âmbar, não drop-shadows azuis-cinza.
6. **Movimento físico.** Springs Framer Motion, não `ease-out` keyframed.

### 8.2 Tipografia (regras estritas)

| Uso | Família | Peso / opsz | Escala | Exemplo |
|---|---|---|---|---|
| Número-herói da tela | **Bodoni Moda Variable** | 500, opsz 96 | clamp(56px, 18vw, 128px) | `R$ 1.847` no topo da Início |
| Marca / título editorial | Bodoni Moda Variable | 300, opsz 72 | 32–48px | "Garagem", "Combustível" |
| Corpo / UI | **Jost Variable** | 400 | 14–16px | tudo |
| Label de instrumento | Jost Variable | 600, uppercase, letter-spacing 0.16em | 10–11px | "GASTO DO MÊS", "MÉDIA" |
| Hodômetro / placa / IDs | **JetBrains Mono Variable** | 500, tabular | 14–22px | `48.291 km`, `BRA-2E19` |

**Numerais sempre** com `font-feature-settings: "tnum" 1, "lnum" 1, "ss01" 1`.

**Proibido:**
- Bodoni peso 400–500 entre 16–40px.
- Numerais não-tabulares.
- Mais de 2 escalas de Bodoni por tela.

### 8.3 Paleta — "Painel Noturno v2"

```css
/* Fundo — preto OLED com leve respiração; preto absoluto só no halo */
--bg:           #07070A
--bg-deep:      #000000   /* OLED puro para splash e halo */
--surface:      #0E0E12
--surface-2:    #16161C
--surface-elev: #1C1C24   /* sheets, modais, tab bar flutuante */
--border:       #21212A   /* divisores duros */
--border-soft:  #16161C   /* divisores invisíveis (apenas estrutura) */

/* Texto — pergaminho, nunca branco frio */
--text:         #F2EDE4
--text-muted:   #9E9890
--text-faint:   #5A5650
--text-ghost:   #38353F   /* placeholder de número Bodoni */

/* Luz primária — âmbar de instrumento */
--accent:       #E8A85C
--accent-bright:#F4BF7A   /* highlight da agulha viva */
--accent-soft:  rgba(232, 168, 92, 0.12)
--accent-halo:  radial-gradient(closest-side, rgba(232,168,92,.16), transparent 70%)

/* Acento secundário — grafite frio (NOVO em v1.5) */
--graphite:     #5C7A9E   /* dado neutro, métrica "ok" */
--graphite-soft:rgba(92, 122, 158, 0.10)

/* Semânticos */
--positive:     #7CB987
--warning:      #D9A441
--danger:       #C85B5B

/* Tema claro — "manual de oficina" */
.theme-light {
  --bg:           #EEE8DC
  --surface:      #F8F4EC
  --surface-2:    #E2DCCF
  --text:         #1F1B16
  --text-muted:   #5C5650
  --accent:       #A26521   /* âmbar tostado p/ contraste em fundo claro */
  --graphite:     #2E4A6B
}
```

> **Por que adicionar grafite frio?** Saturação warm dominante cansa o olho à noite — perde contraste perceptivo após 15min de uso. Grafite (#5C7A9E) carrega métricas que **não exigem ação**. Âmbar fica reservado para o que o usuário precisa olhar **agora**. Hierarquia de cor = hierarquia de atenção.

### 8.4 Layout (Android-first, revisado)

**Mobile (375–428px):**

- **Header — "Chave do carro":** tile horizontal compacto (56px alto). Foto circular do veículo (44px) + apelido em Bodoni 22 + odômetro mecânico (`<Odometer>`) em JetBrains Mono. Toque abre **carrossel horizontal** entre veículos (não dropdown).
- **HomePage — cluster:** número-herói no topo (`<HeroNumber>` clamp 80–112px) com halo âmbar radial. Abaixo, **régua horizontal** (`<ScaleRule>`) com 3 marcadores em Jost 11 uppercase: combustível, manutenção, custo/km. **Sem grid de KPIs.** Sem cards. Alertas e atividade vêm depois, separados por divisores 1px, sem moldura.
- **FuelPage — agulha de consumo:** `<Gauge>` SVG arco 240° no topo, agulha entre min/max histórico do veículo. Lista plana logo abaixo.
- **MaintenancePage — escada de status:** timeline vertical única, marcada por `<TimelineDot>` (ok=graphite, soon=accent pulsando, overdue=danger). Sem seções "Próximas" / "Histórico" — uma timeline só.
- **Bottom Tab Bar flutuante:** descolada da borda inferior por 12px, cantos `--radius-xl`, glass `backdrop-filter: blur(24px) saturate(180%)`, fallback `--surface-elev` quando o navegador não suportar. **FAB integrado** ao centro da tab bar (botão elevado +12px), não solto na tela.
- **Bottom Sheets** (não modais centralizados) para todos os formulários.
- **Pull-to-refresh** com mini-gauge subindo (substitui spinner).
- **Swipe-actions** em itens de lista (esquerda: editar; direita: arquivar).

**Safe areas:** `env(safe-area-inset-*)` em status bar, gesture bar, notch.

**Desktop (bônus):**
- Sidebar à esquerda, mesma estrutura. Hero number escalonado para 144px.

### 8.5 Componentes de identidade (v1.5)

Todos novos, ~80–150 linhas cada. Documentados no showcase `/__ds`.

- **`<HeroNumber value unit?>`** — número-herói da tela. Bodoni clamp(56px, 18vw, 128px), peso 500, opsz 96. Unidade em Jost 14 uppercase superscript. Halo `--accent-halo` opcional. Animação de "ignição" ao montar (opacity + scale 0.96→1, 600ms spring).
- **`<Odometer value digits=6>`** — hodômetro mecânico. JetBrains Mono. Cada dígito rola em transformY com cubic-bezier(0.65, 0, 0.35, 1) ao mudar. Background `--surface-2`, dígitos com `inset 0 -1px 0 rgba(0,0,0,.6)` para profundidade.
- **`<Gauge value min max label?>`** — arco SVG 240°, agulha que segue `value`. 3 zonas coloridas (graphite/accent/danger) parametrizáveis. Movimento via Framer Motion `spring (damping: 12, stiffness: 90)`.
- **`<ScaleRule items>`** — régua horizontal de marcadores (substitui grid de KPI). Cada item: label uppercase + valor em Jost médio + tick âmbar se for o "destaque" da régua.
- **`<IgnitionSplash>`** — substitui `SplashPage`. Sequência 800ms: (1) fundo OLED, (2) "welcome lights" — accent radial 0→60% opacity, (3) logo SVG inline traçado por `stroke-dashoffset`, (4) versão fade-in. Haptic `[10, 40, 10]` ao apertar "Começar".
- **`<GaugeSpinner>`** — substitui todos os spinners. Agulha pulsando entre 0 e redline em loop infinito.
- **`<HUDToast>`** — substitui Toast atual. Posição superior, **sem fundo**, apenas texto âmbar com `text-shadow: 0 0 24px var(--accent-soft)` e `backdrop-filter: blur(8px) saturate(140%)`. Some sozinho em 3.5s.
- **`<KeyChip vehicle>`** — substitui `VehicleChip`. Tile horizontal estilo "chave inteligente" com odômetro mini.
- **`<TimelineDot status>`** — usado em MaintenancePage. Ponto de 8px com halo de 16px. Cores: ok=graphite, soon=accent (pulsando), overdue=danger.
- **`<NumberPad>`** — pad numérico gigante para AddFuelSheet, estilo iOS calculator. Sem teclado nativo abrindo. Toques 56dp, separadores `--border-soft`.

### 8.6 Microinterações (revisadas)

**Vocabulário háptico** (centralizado em `lib/haptics.ts`):

| Nome | Padrão | Uso |
|---|---|---|
| `tap` | `vibrate(10)` | Confirmações leves (toggle, seleção) |
| `success` | `vibrate([10, 40, 10])` | Registro salvo |
| `warning` | `vibrate([40, 60, 40])` | Alerta visível |
| `error` | `vibrate(80)` | Falha de validação ou rede |
| `ignition` | `vibrate([10, 40, 10])` | Splash, login bem-sucedido |

**Movimento físico:** trocar todos os `ease-out` fixos por springs Framer Motion (`damping: 20, stiffness: 260, mass: 0.6`). Exceto `prefers-reduced-motion`, onde springs viram fades de 200ms.

**Gestos signature:**
- **Pull-to-refresh** → `<GaugeSpinner>` mini com agulha subindo conforme o gesto.
- **AddFuelSheet** → `<NumberPad>` ocupa 60% da altura. Botão "Confirmar" com **long-press 250ms** (gatilho de bomba) — evita toque acidental e premia gesto deliberado.
- **VehicleChip** → swipe horizontal entre veículos no header (carrossel de chaves).

**Toasts:** HUD no topo, conteúdo em Jost 13 com text-shadow âmbar, sem container. Auto-dismiss 3.5s ou swipe-up.

### 8.7 Estados vazios
Cada empty state ganha **uma ilustração de instrumento específica** (1.5px stroke, `--text-faint`, opacity 0.5):
- Veículos vazio → agulha em zero
- Combustível vazio → bomba estilizada
- Manutenção vazia → manual de oficina aberto
- Frase em Bodoni 22 peso 300. CTA âmbar pill (44dp altura).

### 8.8 Acessibilidade (mantida + adicionado)
- AAA em texto principal, AA mínimo no resto.
- Toques **≥ 48dp** (Android) / **44pt** (iOS).
- `prefers-reduced-motion`: springs viram fades, hodômetro vira contagem instantânea, agulha vai direto ao destino sem inércia.
- Numerais de instrumento com `aria-label` legível ("R$ 1.847,32", não "1847").
- Halos âmbar com `aria-hidden="true"`.
- Carrossel de chaves do veículo navegável por teclado (Arrow keys).

---

## 9. PWA (Android-first, iOS-friendly)

### Manifesto
- `display: standalone`
- `orientation: portrait-primary`
- `theme_color: #000000`, `background_color: #000000` (OLED splash)
- Ícones: 192, 512, **maskable** (Android), `apple-touch-icon` (iOS)
- `shortcuts`: "Novo abastecimento", "Nova manutenção" (atalho a partir do ícone no Android)

### Service Worker (Workbox `injectManifest`)
- App shell: cache-first
- API GET: stale-while-revalidate
- Fotos R2: CacheFirst 30d (URLs presigned são cacheadas pelo objeto, não pela URL)
- Mutações: fila em IndexedDB → flush quando voltar online
- Update: toast "nova versão disponível → atualizar" (sem auto-reload silencioso)
- Push handler customizado (RFC 8291/8188 via WebCrypto)

### Especificidades Android (Chrome)
- Prompt de instalação **customizado** (após 2ª visita, dispensável).
- Meta tag `theme-color` para a barra de status integrar ao app.
- Badging API para mostrar `n` pendências no ícone.
- Web Share Target API (futuro): receber notas/fotos compartilhadas.

### Especificidades iOS (Safari)
- `apple-mobile-web-app-capable: yes`
- `apple-mobile-web-app-status-bar-style: black-translucent`
- `apple-touch-icon` 180x180
- Splash screens para tamanhos comuns (iPhone 14/15 Pro)
- Aviso amigável se Safari não suportar Push Notifications na versão do iOS.
- Polyfill para `crypto.randomUUID` (já nativo no iOS 15.4+).
- **Glass do tab bar** com fallback `--surface-elev` (Safari ainda inconsistente em `backdrop-filter` no WebView).

---

## 10. Notificações Push

- **Web Push** com chaves VAPID, geradas no Worker.
- Inscrição **só** quando o usuário ativa "Lembrar manutenções" em Configurações (não no primeiro carregamento — UX-killer).
- **Cron Trigger** no Worker (1× por dia, 8h BRT): calcula manutenções vencendo, dispara push.
- Conteúdo: "Troca de óleo do Civic em 12 dias (≈ 480 km)".
- Click na notificação → abre o app na tela da manutenção específica (deep link).

> ⚠️ **iOS:** Push Web só funciona ≥ iOS 16.4 e exige PWA instalada. Documentar isso na tela de Configurações.

---

## 11. Privacidade & telemetria

- **Zero analytics de terceiros.** Sem GA, sem Plausible, sem Sentry.
- Logs do Worker apenas para erros HTTP (sem payload, sem PII).
- Os dados ficam **na sua conta Cloudflare**. Você é dono.

---

## 12. Critérios de "pronto" (v1.5.0)

### Funcional / qualidade
- [ ] Lighthouse mobile ≥ 95 em todas as categorias.
- [ ] Funciona offline em todas as telas principais.
- [ ] Instalável e funcional no Android (Chrome) e iPhone (Safari, iOS 16.4+).
- [ ] Notificações Push chegam nos dois Androids.
- [ ] Lançar abastecimento em < 15 segundos (medido).
- [ ] Sync de 100 itens em < 1s em 4G.
- [ ] Cenário "duas pessoas offline simultâneas" testado e validado.
- [ ] `python .agent/scripts/verify_all.py .` passa sem críticos.
- [ ] Zero configurações sem propósito.

### Design (v1.5)
- [ ] HomePage tem **um número-herói** dominante (≥ 80px) com halo âmbar.
- [ ] FuelPage tem **agulha analógica** funcional (não donut, não barra).
- [ ] MaintenancePage é uma **timeline única**, não duas seções.
- [ ] Header de todas as telas com `<KeyChip>` e odômetro mecânico animado.
- [ ] Tab bar **flutuante** com glass funcional no Android (e fallback no iOS).
- [ ] Splash com `<IgnitionSplash>` (sequência 800ms + haptic).
- [ ] Zero spinners — todos substituídos por `<GaugeSpinner>`.
- [ ] Toasts em formato HUD (sem fundo, com text-shadow âmbar).
- [ ] `prefers-reduced-motion` testado e suaviza tudo (zero perda de função).

### Segurança (v1.5)
- [ ] Login emite `device_id` + `device_secret`; sessão por HMAC, não JWT.
- [ ] Tela "Dispositivos confiáveis" lista e revoga devices.
- [ ] IndexedDB cifrado (AES-GCM, chave PBKDF2 600k).
- [ ] Rate limit em `/api/auth` (5/15min).
- [ ] CSP estrita ativa no Netlify.
- [ ] R2 privado; fotos via presigned URL (TTL 1h).
- [ ] `audit_log.actor_device_id` derivado do servidor.
- [ ] `SECURITY.md` com threat model e runbook de revogação.
