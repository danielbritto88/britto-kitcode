# AUDITORIA — Tanque Cheio

> Varredura completa do projeto em 20/05/2026 — 2 passes de análise
> Frontend: React 19 + TypeScript 6.0 + Vite 8 + PWA
> API: Cloudflare Workers + D1 + R2

---

## Resumo Geral

| Severidade | Frontend | API | Total |
|---|---|---|---|
| 🔴 Crítico | 3 | 4 | **7** |
| 🟠 Alto | 18 | 12 | **30** |
| 🟡 Médio | 34 | 23 | **57** |
| 🟢 Baixo | 8 | 1 | **9** |
| **Total** | **63** | **40** | **103** |

---

# PARTE 1 — FRONTEND (`src/`)

## 🔴 CRÍTICOS

### F-C1. Bug de precedência de operadores — cálculo de autonomia
- **Arquivo:** `src/features/home/HomePage.tsx:132-140`
- **Problema:** O operador `??` tem menor precedência que `*`. A expressão `.slice(-1)[0]?.liters ?? 0 * fuelStats.lastConsumption * tankPct` avalia o fallback como `0 * ...` = sempre 0.
- **Código:**
  ```tsx
  // ATUAL (ERRADO):
  .slice(-1)[0]?.liters ?? 0 * fuelStats.lastConsumption * tankPct
  // CORRETO:
  (.slice(-1)[0]?.liters ?? 0) * fuelStats.lastConsumption * tankPct
  ```
- **Impacto:** `autonomyKm` nunca mostra valor válido — sempre 0 ou null.

### F-C2. JSX: atributo `className` duplicado — erro de compilação
- **Arquivo:** `src/features/home/HomePage.tsx:173-174`
- **Problema:** O elemento `<header>` possui `className` declarado duas vezes. TypeScript rejeita (TS17001).
- **Código:**
  ```tsx
  <header
    className="px-5 pt-[max(env(safe-area-inset-top,0px),16px)] pb-4"
    className="px-5 pt-[max(env(safe-area-inset-top,0px),16px)] pb-4 bg-transparent"
  >
  ```
- **Impacto:** Erro de compilação. O build quebra.

### F-C3. `bytesToBase64` com spread — risco de stack overflow
- **Arquivo:** `src/lib/biometric.ts:72`
- **Problema:** `btoa(String.fromCharCode(...bytes))` usa spread operator em `Uint8Array`. Para arrays >~65000 elementos, excede o limite máximo de argumentos do motor JS e lança `RangeError: Maximum call stack size exceeded`.
- **Código:**
  ```tsx
  function bytesToBase64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes));  // spread perigoso
  }
  ```
- **Impacto:** Crash em runtime para chaves criptográficas grandes.
- **Nota:** A versão em `src/lib/crypto.ts:23-26` usa abordagem com loop e é segura.

---

## 🟠 ALTOS

### F-H1. Rota `/perfil` não existe
- **Arquivo:** `src/features/home/HomePage.tsx:180`
- **Problema:** Botão de configurações navega para `/perfil`, mas a rota correta é `/ajustes`. O catch-all `*` redireciona para `/`, enviando o usuário de volta à splash screen.
- **Código:** `onClick={() => navigate('/perfil')}`

### F-H2. Context providers causam re-renders desnecessários (3 arquivos)
- **Arquivos:**
  - `src/context/VehicleContext.tsx:95-125`
  - `src/context/FuelContext.tsx:95-124`
  - `src/context/MaintenanceContext.tsx:95-116`
- **Problema:** Funções no `value` do context não usam `useCallback`, causando re-render de todos os consumidores a cada render do provider.

### F-H3. `mergeVehicles` chamado com mesmo array duas vezes
- **Arquivo:** `src/context/VehicleContext.tsx:90`
- **Problema:** `mergeVehicles(next, next)` — mesmo array como server e local. Desperdício e código enganoso.

### F-H4. `useEffect` com stale closure — IgnitionSplash
- **Arquivo:** `src/features/home/IgnitionSplash.tsx:29-44`
- **Problema:** `eslint-disable-next-line react-hooks/exhaustive-deps` suprindo aviso. `navigate`, `authPrefs` e `handleBiometric` faltam nas dependências. `handleBiometric` não é memoizada, capturando closure stale.

### F-H5. `setTimeout` inconsistente para sync inicial
- **Arquivo:** `src/context/MaintenanceContext.tsx:79`
- **Problema:** Usa `setTimeout(() => void doSync(), 0)` enquanto VehicleContext e FuelContext chamam `doSync()` diretamente. Possível race condition.

### F-H6. `actualVehicle` pode ser undefined em modo edição
- **Arquivos:**
  - `src/features/fuel/AddFuelSheet.tsx:77`
  - `src/features/maintenance/AddMaintenanceSheet.tsx:51`
- **Problema:** Em modo edição (`isEdit = true`), se o veículo associado ao log foi deletado, `activeVehicles.find()` retorna `undefined`. O `onSubmit` faz `if (!actualVehicle) return;` — falha silenciosa sem feedback ao usuário.

### F-H7. Botão submit desabilitado com condição errada
- **Arquivo:** `src/features/maintenance/AddMaintenanceSheet.tsx:308`
- **Problema:** `disabled={isSubmitting || !selectedVehicle}` usa `selectedVehicle` mas em modo edição o veículo real é `actualVehicle`. Se `selectedVehicle` é null mas `actualVehicle` é válido, o botão fica desabilitado incorretamente.

### F-H8. `register()` chamado dentro de loop de render
- **Arquivo:** `src/features/vehicles/AddVehicleSheet.tsx:354-369`
- **Problema:** `register('fuel_type')` é chamado dentro do `.map()` — executa 6 vezes por render (uma por tipo de combustível). Cada chamada cria novo objeto com novo `ref`, causando re-registrations desnecessárias no react-hook-form e perda de valor do radio group.

### F-H9. Bug: custo zero se torna null
- **Arquivo:** `src/features/maintenance/AddMaintenanceSheet.tsx:118`
- **Problema:** `cost && !isNaN(cost) ? cost : null` — se `cost` é `0`, o `&&` short-circuit retorna `false`, transformando custo zero em `null`.
- **Correção:** `cost != null && !isNaN(cost) ? cost : null`

### F-H10. FormData body não incluído na assinatura HMAC
- **Arquivo:** `src/lib/signedFetch.ts:22-27`
- **Problema:** Uploads de foto (FormData) são enviados com body hash vazio (`new ArrayBuffer(0)`). Integridade da requisição não é verificada para o conteúdo do arquivo.

### F-H11. WebAuthn RP ID com `localhost`
- **Arquivo:** `src/lib/biometric.ts:23`
- **Problema:** `rp.id: location.hostname` — durante desenvolvimento local (`localhost` ou `127.0.0.1`), WebAuthn pode falhar em alguns browsers.

### F-H12. `as unknown as` bypass total de type checking
- **Arquivo:** `src/context/AuthContext.tsx:132`
- **Problema:** `const auth = data as unknown as ServerAuthResponse` — bypass total do TypeScript. Se o formato da resposta do servidor mudar, erros de runtime silenciosos.

### F-H13. `as any` casts em ReportsPage
- **Arquivo:** `src/features/reports/ReportsPage.tsx:191, 219`
- **Problema:** `(doc as any).lastAutoTable.finalY` — bypass de type safety. Quebra silenciosa se a API do jsPDF mudar.

### F-H14. `usePWA` setInterval sem cleanup — memory leak
- **Arquivo:** `src/hooks/usePWA.ts:12`
- **Problema:** `setInterval(() => void r.update(), 60_000)` dentro do callback `onRegistered` nunca é limpo. Continua executando após unmount do componente.

### F-H15. `--info` CSS variável indefinida no tema escuro
- **Arquivo:** `src/components/identity/KeyChip.tsx:65`
- **Problema:** `color: 'var(--info)'` — `--info` só existe em `tokens-brutal.css`. No tema escuro padrão (`tokens.css`), a variável não existe, resultando em cor fallback (provavelmente preto).

### F-H16. Tipo de ícone incompleto em BottomTabBarBrutal
- **Arquivo:** `src/components/BottomTabBarBrutal.tsx:10`
- **Problema:** Usa `React.FC<{ size?: number; strokeWidth?: number; className?: string }>` ao invés de `LucideIcon`. Faltam props como `absoluteStrokeWidth` e `ref`.

### F-H17. `firstName` não trata whitespace-only
- **Arquivo:** `src/features/home/HomePage.tsx:36-39`
- **Problema:** Se `tag` é `'   '` (só espaços), `!tag` é `false` e `tag.split(' ')[0]` retorna `''`, resultando em saudação vazia.

### F-H18. WebAuthn user ID derivado de device_id
- **Arquivo:** `src/lib/biometric.ts:24`
- **Problema:** WebAuthn `user.id` derivado de `device_id` com `name`/`displayName` hardcoded como `'tanquecheio'`. Múltiplos usuários no mesmo dispositivo compartilham a mesma credential biométrica.

---

## 🟡 MÉDIOS

### F-M1. Dead code: `BottomTabBar.tsx`
- **Arquivo:** `src/components/BottomTabBar.tsx`
- **Problema:** Usado apenas em `DesignSystemPage.tsx`. Produção usa `BottomTabBarBrutal`.

### F-M2. Dead code: `FAB.tsx`
- **Arquivo:** `src/components/FAB.tsx`
- **Problema:** Usado apenas em `DesignSystemPage.tsx`.

### F-M3. Dead code: `Sheet.tsx`
- **Arquivo:** `src/components/ui/Sheet.tsx`
- **Problema:** Importado apenas em `DesignSystemPage.tsx`.

### F-M4. Dead code: `Card.tsx` e `Skeleton.tsx`
- **Arquivos:** `src/components/ui/Card.tsx`, `src/components/ui/Skeleton.tsx`
- **Problema:** Usados apenas no DesignSystemPage.

### F-M5. Dead code: `syncFuelLogs`
- **Arquivo:** `src/lib/fuel.ts:92-104`
- **Problema:** Função exportada mas nunca importada. Lógica de sync está inline em `FuelContext.tsx`.

### F-M6. Dead code: `db.ts` outbox functions
- **Arquivo:** `src/lib/db.ts`
- **Problema:** Exporta `outboxPush`, `outboxGetAll`, `outboxClear` — nunca importadas em lugar nenhum.

### F-M7. Dead code: `App.css`
- **Arquivo:** `src/App.css`
- **Problema:** Contém estilos do template padrão Vite+React (`.counter`, `.hero`, `#center`, etc.) — nenhum usado na aplicação.

### F-M8. Dead code: No-op event listener em ThemeContext
- **Arquivo:** `src/context/ThemeContext.tsx:38-42`
- **Problema:** Event listener registrado mas handler vazio (`{ /* tema brutal não responde a preferência do SO */ }`). Overhead desnecessário.

### F-M9. `navigator.vibrate` direto ignora `prefers-reduced-motion`
- **Arquivo:** `src/features/maintenance/AddMaintenanceSheet.tsx:131, 135`
- **Problema:** Chamadas diretas a `navigator.vibrate?.(20)` bypassam o helper `haptic()` que respeita `prefers-reduced-motion`.

### F-M10. `enrichLogs` sem `useMemo`
- **Arquivo:** `src/features/home/HomePage.tsx:86`
- **Problema:** Faz parsing de datas, sorting e cálculos de status a cada render.

### F-M11. `VehicleChip` IIFE sem `useMemo`
- **Arquivo:** `src/components/VehicleChip.tsx:25-32`
- **Problema:** IIFE que calcula odômetro roda em todo render.

### F-M12. Odometer recalculado para cada veículo em VehicleChip
- **Arquivo:** `src/components/VehicleChip.tsx:163-168`
- **Problema:** IIFE dentro de `.map()` chama `fuelLogsForVehicle(v.id)` e itera todos os logs para cada veículo em cada render. O(V * F) por render.

### F-M13. `filterByPeriod` recriada a cada render
- **Arquivo:** `src/features/home/HomePage.tsx:93-97`
- **Problema:** Definida dentro do corpo do componente sem memoização.

### F-M14. CSV sem escaping de campos com vírgula
- **Arquivo:** `src/features/reports/ReportsPage.tsx:108-142`
- **Problema:** `buildCSV` junta campos com vírgula sem quoting. Se `gas_station` ou `shop` contém vírgula, o CSV fica malformado.

### F-M15. Import não usado: `Car` de lucide-react
- **Arquivo:** `src/features/vehicles/VehiclesPage.tsx:2`
- **Problema:** `Car` importado mas nunca usado.

### F-M16. `urlCache` sem limite de tamanho
- **Arquivo:** `src/lib/photo.ts:64`
- **Problema:** Map com TTL expiration mas sem tamanho máximo. Pode crescer sem limite em sessões longas.

### F-M17. Toasts de erro usam `role="status"` ao invés de `role="alert"`
- **Arquivos:** `src/components/ui/Toast.tsx:86`, `src/components/identity/HUDToast.tsx:43`
- **Problema:** Todos os tipos de toast usam `role="status"`. Erros deveriam usar `role="alert"` para anúncio imediato em screen readers.

### F-M18. Inline `import()` type inconsistente
- **Arquivo:** `src/lib/fuel.ts:94, 98`
- **Problema:** Usa `import('@/types/vehicle').Vehicle[]` inline ao invés de `import type` no topo.

### F-M19. Potencial XSS em exports CSV/WhatsApp
- **Arquivo:** `src/features/reports/ReportsPage.tsx:254-271`
- **Problema:** Strings do usuário (nomes de veículos, postos, oficinas, notas) embedados em CSV e texto WhatsApp sem sanitização.

### F-M20. `eslint-disable` broad para arquivo inteiro
- **Arquivos:** Todos os context files (linha 1)
- **Problema:** `/* eslint-disable react-refresh/only-export-components */` desabilita a regra para o arquivo inteiro. Deveria usar `eslint-disable-next-line`.

### F-M21. `VehicleHeroCard` button sem `aria-label`
- **Arquivo:** `src/components/identity/VehicleHeroCard.tsx:113`
- **Problema:** `motion.button` sem `aria-label` para screen readers.

### F-M22. Missing key: index-as-key em Odometer
- **Arquivo:** `src/components/identity/Odometer.tsx:27`
- **Problema:** `key={i}` para `DigitWheel`. Quando número de dígitos muda, React reusa instâncias erradas de wheels.

### F-M23. Missing key: index-as-key em KpiScrollRow
- **Arquivo:** `src/components/identity/KpiScrollRow.tsx:98`
- **Problema:** `key={i}` para KPI cards. Quando cards são adicionados/removidos, React mismatch components.

### F-M24. Missing useEffect cleanup para photoPreview URL
- **Arquivo:** `src/features/vehicles/AddVehicleSheet.tsx:68-88`
- **Problema:** `URL.revokeObjectURL(photoPreview)` no effect mas sem cleanup function para unmount. Se componente desmonta antes do `setTimeout`, object URL vaza.

### F-M25. `toast` passado como prop ao invés de hook
- **Arquivo:** `src/features/settings/SettingsPage.tsx:377-384`
- **Problema:** `toast` passado como prop para `SecuritySection`. Deveria usar `useToast()` diretamente.

### F-M26. `periodStart('month')` usa rolling 30 dias, não mês calendário
- **Arquivo:** `src/features/reports/ReportsPage.tsx:57-59`
- **Problema:** `format(subDays(today, 30), 'yyyy-MM-dd')` — inconsistente com HomePage que usa mês calendário real. Dados diferentes entre "Mês" em Reports vs HomePage.

### F-M27. Risco de divisão por zero em ReportsPage
- **Arquivo:** `src/features/reports/ReportsPage.tsx:643, 649`
- **Problema:** Guard `totalCost > 0` existe na linha 628, mas com React concurrent features, `totalCost` poderia mudar entre o guard e a divisão, produzindo `NaN`.

### F-M28. Cálculo de dias sem considerar DST
- **Arquivo:** `src/lib/maintenance.ts:38-43`
- **Problema:** Divisão por `86_400_000` não considera transições de DST. Workaround `T12:00:00` mitiga mas não elimina para ranges com múltiplas transições.

### F-M29. FAB backdrop não fecha via teclado
- **Arquivo:** `src/components/BottomTabBarBrutal.tsx:66-74`
- **Problema:** Backdrop do FAB fecha no click mas sem handler de teclado. Usuários de teclado não podem dismiss com Escape.

### F-M30. Alt text genérico em photo preview
- **Arquivo:** `src/features/vehicles/AddVehicleSheet.tsx:211`
- **Problema:** `alt="Preview"` não é descritivo.

### F-M31. Empty alt em foto de veículo
- **Arquivo:** `src/components/VehicleChip.tsx:227`
- **Problema:** `alt=""` na foto do veículo. Aceitável mas alt descritivo seria melhor.

### F-M32. Forms sem `aria-label`
- **Arquivos:**
  - `src/features/fuel/AddFuelSheet.tsx:233`
  - `src/features/maintenance/AddMaintenanceSheet.tsx:168`
  - `src/features/vehicles/AddVehicleSheet.tsx:207`
- **Problema:** Elementos `<form>` sem `aria-label`, `id` ou `aria-labelledby`.

### F-M33. Service worker: condição de rota API invertida
- **Arquivo:** `src/sw.ts:23`
- **Problema:** `self.location.origin !== url.origin` — stale-while-revalidate só aplica se API for cross-origin. Se same-origin, não há caching. Parece invertido.

### F-M34. Push notification payload sem validação
- **Arquivo:** `src/sw.ts:37`
- **Problema:** `event.data.json() as { title: string; body: string; url?: string }` — cast direto sem validação. Payload malformado resulta em notificação vazia.

### F-M35. `VAPID_PUBLIC` sem fallback
- **Arquivo:** `src/lib/pushNotifications.ts:3`
- **Problema:** `import.meta.env.VITE_VAPID_PUBLIC as string` — type assertion enganosa. Se não definido, será `undefined`.

### F-M36. `selectedVehicle.model` empty string e regex
- **Arquivo:** `src/features/home/HomePage.tsx:242`
- **Problema:** Se `model` é `''`, regex retorna `false` e categoria vira `'car'`. Correto mas frágil se o tipo mudar.

### F-M37. ESLint warnings: `react-hooks/incompatible-library`
- **Arquivos:**
  - `src/features/fuel/AddFuelSheet.tsx:116`
  - `src/features/maintenance/AddMaintenanceSheet.tsx:73`
- **Problema:** React Compiler skipa memoização por uso de `watch()` do React Hook Form.

---

## 🟢 BAIXOS

### F-L1. Uso inconsistente de `void` para promises fire-and-forget
- **Arquivos:** Múltiplos
- **Problema:** Alguns lugares usam `void doSync()`, outros `await`, outros deixam promises sem handler.

### F-L2. Números mágicos em padrões de vibração
- **Arquivo:** `src/lib/haptics.ts:6-12`
- **Problema:** Padrões de vibração com números não documentados (`10`, `40`, `60`, `80` ms).

### F-L3. Workaround `T12:00:00` para timezone não é universal
- **Arquivos:** Múltiplos (FuelPage.tsx:238, MaintenancePage.tsx:173, etc.)
- **Problema:** Funciona para a maioria do Brasil mas não é solução universal.

### F-L4. Dependências não usadas: `recharts` e `react-is`
- **Arquivo:** `package.json:35, 37`
- **Problema:** Listados em `dependencies` mas não importados em lugar nenhum. Gráficos usam SVG inline.

### F-L5. `Gauge.tsx` key com valor numérico falsy
- **Arquivo:** `src/components/identity/Gauge.tsx:138`
- **Problema:** `key={p}` onde `p` inclui `0`. Key válida mas incomum.

### F-L6. `BottomTabBarBrutal` icon type mismatch
- **Arquivo:** `src/components/BottomTabBarBrutal.tsx:10`
- **Problema:** Tipo manual `React.FC<...>` ao invés de `LucideIcon`.

### F-L7. `register('fuel_type')` cria novos objetos a cada render
- **Arquivo:** `src/features/vehicles/AddVehicleSheet.tsx:354-369`
- **Problema:** Chamado 6 vezes por render dentro de `.map()`.

### F-L8. `cost && isNaN` redundante para zero
- **Arquivo:** `src/features/maintenance/AddMaintenanceSheet.tsx:118`
- **Problema:** Custo zero vira null. (Já listado como F-H9 — duplicata intencional para visibilidade)

---

# PARTE 2 — API (`api/`)

## 🔴 CRÍTICOS

### A-C1. TypeScript não compila — 5 erros de tipo
- **Arquivos:**
  - `api/src/lib/webpush.ts:110, 116` — `CryptoKeyPair` narrowing falha no ECDH
  - `api/src/routes/photo.ts:18` — `instanceof File` incompatível com `FormDataEntryValue`
- **Impacto:** Projeto não passa no typecheck. Risco real de runtime.

### A-C2. Body multipart não assinado no HMAC
- **Arquivo:** `api/src/middleware/hmac.ts:60-64`
- **Problema:** Uploads de foto têm body hash = `SHA256('')`. Atacante pode trocar conteúdo do arquivo dentro da janela de 60s e assinatura ainda valida.

### A-C3. `created_by` não validado no servidor
- **Arquivo:** `api/src/routes/sync.ts:110, 137, 164`
- **Problema:** Campo `created_by` vem direto do client. Qualquer dispositivo pode atribuir registros a qualquer usuário, poluindo audit trail.

### A-C4. D1 `batch()` não é transacional
- **Arquivo:** `api/src/routes/sync.ts:182`
- **Problema:** `c.env.DB.batch(stmts)` executa sequencialmente mas NÃO em transação. Se statement 5 de 10 falha, statements 1-4 estão permanentemente commitados. Banco fica em estado inconsistente.
- **Correção:** Usar `BEGIN`/`COMMIT`/`ROLLBACK` explícitos.

---

## 🟠 ALTOS

### A-H1. CORS retorna origem errada para não-autorizados
- **Arquivo:** `api/src/index.ts:41-42`
- **Problema:** `origin: (o) => (origins.includes(o) ? o : (origins[0] ?? ''))` — deveria retornar `''` ao invés de `origins[0]`.

### A-H2. Sync sem escopo de propriedade
- **Arquivo:** `api/src/routes/sync.ts`
- **Problema:** GET `/sync` retorna TODOS os dados do sistema. Qualquer dispositivo autenticado pode upsert/deletar qualquer registro sem verificação de ownership.

### A-H3. Sem rate limiting na maioria dos endpoints
- **Arquivo:** `api/wrangler.toml`
- **Problema:** Apenas `POST /api/auth` tem rate limiter. Sync, fotos, push e devices expostos a abuso.

### A-H4. Push subscriptions não vinculadas a devices
- **Arquivo:** `api/src/routes/push.ts`
- **Problema:** Qualquer dispositivo pode registrar/deletar subscriptions de qualquer `user_tag`.

### A-H5. Timing leak no `VAULT_PASSWORD`
- **Arquivo:** `api/src/routes/auth.ts:73-79`
- **Problema:** `constantTimeStringEq` retorna `false` imediatamente se tamanhos diferem, vazando tamanho exato da senha.

### A-H6. Revogação de dispositivo sem escopo de autorização
- **Arquivo:** `api/src/routes/devices.ts:34-50`
- **Problema:** Qualquer dispositivo autenticado pode revogar QUALQUER outro dispositivo, independente de `user_tag`. Dispositivo "Cônjuge" pode revogar todos os dispositivos de "Daniel".

### A-H7. Unsubscribe permite deletar qualquer push subscription
- **Arquivo:** `api/src/routes/push.ts:49-61`
- **Problema:** Sem verificação de ownership. Device A pode deletar push subscription do Device B.

### A-H8. HMAC replay dentro da janela de 60s
- **Arquivo:** `api/src/middleware/hmac.ts:37-40`
- **Problema:** Esquema stateless — só verifica timestamp dentro de 60s. Atacante pode replay requisição válida livremente dentro da janela. Falta mecanismo de nonce.

### A-H9. Foreign key `REFERENCES` são inertes no SQLite
- **Arquivo:** `api/migrations/0001_init.sql:21, 38`
- **Problema:** SQLite ignora `REFERENCES` a menos que `PRAGMA foreign_keys = ON` seja executado por conexão. D1 não habilita por padrão. Logs podem referenciar veículos inexistentes, deletar veículo não faz cascade.

### A-H10. Unsafe `as` casts em D1 `.results`
- **Arquivo:** `api/src/routes/sync.ts:66-68, 191-193`
- **Problema:** `D1Result.results` é `Record<string, unknown>[]`. Cast `as VehicleRow[]` bypass type checking. Se schema mudar, dados incorretos passam silenciosamente.

### A-H11. Input não-array causa corrupção de dados
- **Arquivo:** `api/src/routes/sync.ts:81, 90`
- **Problema:** Sem `Array.isArray()`. Se client envia `vehicles: "not-an-array"`, `for...of` itera caracteres. Cada caractere vira `v` com `v.id = undefined`, inserindo rows de NULLs.

### A-H12. Push subscriptions expiradas nunca limpas
- **Arquivo:** `api/src/lib/webpush.ts:165-167`
- **Problema:** Quando push subscription expira (404/410 do push service), erro é catchado mas subscription morta nunca removida do DB. Cada cron run desperdiça API calls.

---

## 🟡 MÉDIOS

### A-M1. `constantTimeEqual` duplicada (dead code)
- **Arquivos:** `api/src/lib/hmac.ts:45` + `api/src/routes/auth.ts:73`
- **Problema:** Duas implementações idênticas. Risco de manutenção — se uma é corrigida, a outra pode não ser.

### A-M2. Tabela `audit_log` definida mas nunca usada
- **Arquivos:** `api/migrations/0001_init.sql:54-62`, `api/migrations/0002_devices.sql:20`
- **Problema:** Tabela e índice criados mas nenhuma rota escreve ou lê.

### A-M3. POST sync retorna dataset completo após cada write
- **Arquivo:** `api/src/routes/sync.ts:184-195`
- **Problema:** Após upserts/deletions, re-query TODAS as tabelas e retorna dataset completo. Desnecessário bandwidth e DB load.

### A-M4. Sem validação de campos numéricos no sync
- **Arquivo:** `api/src/routes/sync.ts:90-166`
- **Problema:** Odômetro negativo, litros negativos, custos negativos, year = 99999 — todos aceitos sem validação.

### A-M5. Photo key path traversal não totalmente prevenido
- **Arquivo:** `api/src/routes/photo.ts:52`
- **Problema:** Serve endpoint extrai key da URL path sem validar que começa com `photos/`. URL craftada `/api/photo/../../../etc/passwd` setaria `key = ../etc/passwd`.

### A-M6. `JWT_SECRET` e outros secrets não documentados como required
- **Arquivo:** `api/src/index.ts:20`, `api/wrangler.toml`
- **Problema:** `JWT_SECRET`, `VAULT_PASSWORD`, `VAPID_PUBLIC`, `VAPID_PRIVATE` devem ser configurados via `wrangler secret put` mas não há documentação. Fresh deploy falha silenciosamente.

### A-M7. Partial index `idx_devices_active` nunca utilizado
- **Arquivo:** `api/migrations/0002_devices.sql:16`
- **Problema:** Index em `revoked_at IS NULL` nunca usado pelas queries atuais (que query por `id`).

### A-M8. Alertas enviados a TODOS os subscribers
- **Arquivo:** `api/src/lib/alerts.ts:40-48`
- **Problema:** Todos os push subscriptions recebem alertas de TODOS os itens de TODOS os veículos. Sem filtro por usuário/dispositivo/veículo.

### A-M9. Inconsistência de versão
- **Arquivo:** `api/src/index.ts:1, 52`
- **Problema:** Comentário diz `v1.6.1`, health endpoint retorna `0.4.0`.

### A-M10. `created_at` sobrescrito em conflito de push subscription
- **Arquivo:** `api/src/routes/push.ts:35`
- **Problema:** `ON CONFLICT` sobrescreve `created_at` com novo timestamp, funcionando como `updated_at`. Nome enganoso.

### A-M11. Throttle delay síncrono consome CPU do Worker
- **Arquivo:** `api/src/routes/auth.ts:41`
- **Problema:** `await new Promise((r) => setTimeout(r, 400))` consome CPU tick do Worker.

### A-M12. Coerção frágil de boolean `full_tank`
- **Arquivo:** `api/src/routes/sync.ts:135`
- **Problema:** `f.full_tank ? 1 : 0` — coerção implícita. `"true"` (string) vira `1`, `0` (number) vira `0`.

### A-M13. Sem validação de `Content-Type` nos endpoints JSON
- **Arquivos:** Todos os route files
- **Problema:** Nenhum endpoint valida `Content-Type: application/json`.

### A-M14. Email VAPID hardcoded
- **Arquivo:** `api/src/lib/alerts.ts:107`
- **Problema:** `mailto:danielbritto88@gmail.com` hardcoded. Deveria ser env var.

### A-M15. Scripts de migração só rodam `0001_init.sql`
- **Arquivo:** `api/package.json:10-11`
- **Problema:** `db:migrate:local` e `db:migrate:remote` só executam `0001_init.sql`. `0002_devices.sql` nunca é rodado por esses scripts.

### A-M16. Índice `idx_push_user` nunca utilizado
- **Arquivo:** `api/migrations/0001_init.sql:76`
- **Problema:** Index em `push_subscriptions(user_tag)` — nenhuma query filtra por `user_tag` nesta tabela.

### A-M17. Índice `idx_audit_entity` dead code
- **Arquivo:** `api/migrations/0001_init.sql:75`
- **Problema:** Index na tabela `audit_log` que nunca é escrita.

### A-M18. Unsubscribe usa POST ao invés de DELETE
- **Arquivo:** `api/src/routes/push.ts:49`
- **Problema:** Deveria ser `DELETE` por convenção REST.

### A-M19. Validação de body em auth.ts aceita arrays
- **Arquivo:** `api/src/routes/auth.ts:29`
- **Problema:** `typeof [] === 'object'` — arrays passam no check inicial.

### A-M20. Sem validação de tamanho de campos textuais no sync
- **Arquivo:** `api/src/routes/sync.ts:108-110, 134-137, 161-164`
- **Problema:** `name`, `brand`, `model`, `notes`, `gas_station`, `shop` inseridos sem limite de tamanho. Cliente poderia enviar strings de megabytes.

### A-M21. `fuel_type` empty string bypass default
- **Arquivo:** `api/src/routes/sync.ts:109`
- **Problema:** `v.fuel_type ?? 'gasoline'` — `??` só substitui `null`/`undefined`. Empty string `""` é armazenada.

### A-M22. Push `endpoint` não validado como URL
- **Arquivo:** `api/src/routes/push.ts:24`
- **Problema:** Só checa truthiness. Endpoint malformado causa erro em `new URL(endpoint).origin` no `sendWebPush`.

### A-M23. Push keys não validadas como base64url
- **Arquivo:** `api/src/routes/push.ts:24`
- **Problema:** Só checa truthiness. Valores inválidos causam `atob()` throw em `base64urlToBytes()`.

### A-M24. Tipos de deleção desconhecidos ignorados silenciosamente
- **Arquivo:** `api/src/routes/sync.ts:169-180`
- **Problema:** Se `del.type` não é um dos 3 esperados, deleção é ignorada sem erro. Cliente recebe 200 achando que funcionou.

### A-M25. `year` sem validação de range
- **Arquivo:** `api/src/routes/sync.ts:108`
- **Problema:** Aceita qualquer inteiro. `year: 999999` ou `year: -5000` são aceitos. Sem CHECK constraint no schema.

---

## 🟢 BAIXOS

### A-L1. HMAC tuple cast após length check
- **Arquivo:** `api/src/middleware/hmac.ts:31`
- **Problema:** `parts as [string, string, string]` — cast suprime TypeScript. Seguro na prática pelo length check, mas frágil se formato mudar.

---

# PARTE 3 — DEPENDÊNCIAS NÃO USADAS

| Dependência | Localização | Motivo |
|---|---|---|
| `recharts` | `package.json:37` | Gráficos usam SVG inline |
| `react-is` | `package.json:35` | Não importado em lugar nenhum |

---

# PARTE 4 — CONFIGURAÇÃO E INFRAESTRUTURA

### CFG-1. `.dev.vars` com placeholders
- **Arquivo:** `api/.dev.vars:1-2`
- **Problema:** `VAULT_PASSWORD=placeholder-set-in-phase-3` e `JWT_SECRET=dev-only-change-before-deploy` são usados em `wrangler dev`. Comportamento incorreto mas não óbvio.

### CFG-2. `account_id` hardcoded no wrangler.toml
- **Arquivo:** `api/wrangler.toml:4`
- **Problema:** Identifica conta Cloudflare. Colaboradores não podem deploy sem editar.

### CFG-3. Secrets não declarados em wrangler.toml
- **Arquivo:** `api/wrangler.toml:6-7`
- **Problema:** `[vars]` só declara `ALLOWED_ORIGINS`. `VAULT_PASSWORD`, `JWT_SECRET`, `VAPID_PUBLIC`, `VAPID_PRIVATE` devem ser setados via `wrangler secret put`.

---

# PARTE 5 — ALERTAS ESLINT

| Arquivo | Linha | Regra | Mensagem |
|---|---|---|---|
| `src/features/fuel/AddFuelSheet.tsx` | 116 | `react-hooks/incompatible-library` | `watch()` não pode ser memoizada |
| `src/features/maintenance/AddMaintenanceSheet.tsx` | 73 | `react-hooks/incompatible-library` | `watch()` não pode ser memoizada |

---

*Fim do relatório de auditoria — 103 issues encontrados em 2 passes*
*Data: 20/05/2026*
