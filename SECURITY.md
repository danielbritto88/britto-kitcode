# Security — Tanque Cheio

> Threat model honesto pra um app pessoal de garagem. Foi escrito uma vez,
> revisado a cada Fase. Última revisão: v1.5 (2026-05-01).

---

## 1. Escopo de proteção

O app é um cofre familiar usado por **2 dispositivos confiáveis** (Daniel e Cônjuge), conectado a um Worker Cloudflare privado e um D1 que pertence à conta Cloudflare do dono. Não é um produto multi-tenant. Não é uma plataforma. Não tem chaves de terceiros nem dados de outras pessoas.

**Ativos a proteger** (em ordem de gravidade):
1. **Senha-mestra do cofre** (`VAULT_PASSWORD`, no Worker) — destrava o login inicial em qualquer dispositivo.
2. **`device_secret`** de cada dispositivo (256 bits) — assina todas as requests HMAC.
3. **Histórico financeiro** (combustível + manutenção + R$) — privado, mas não bancário.
4. **Fotos dos veículos** — em R2, agora privadas (presigned URLs).

**Riscos que tomamos a sério:**
- Roubo do celular com tela desbloqueada.
- XSS via dependência futura comprometida.
- Brute-force da senha-mestra contra `/api/auth`.
- Vazamento de URL de foto ou token JWT antigo.

**Riscos fora do escopo (intencional):**
- Compromisso da conta Cloudflare ou do dispositivo de desenvolvimento — nesse caso,
  todo o cofre cai. Mitigação aceita: 2FA na própria conta Cloudflare.
- Coerção (forçar o dono a revelar a senha) — fora do escopo de software.
- Análise forense profunda do dispositivo — proteção contra essa categoria
  custaria simplicidade de operação para benefício marginal num app familiar.

---

## 2. Camadas implementadas (v1.5)

### 2.1 Auth — sessão por dispositivo, HMAC por request
- `POST /api/auth` valida a senha-mestra (constant-time) + emite `device_id` UUID e `device_secret` 256-bit (uma vez só).
- Cada request à API leva header `Authorization: TC-HMAC <id>:<ts>:<sig>` onde `sig = HMAC-SHA256(device_secret, METHOD\nPATH\nUNIX_TS\nSHA256(body))`.
- Replay-protected: timestamps fora de ±60s rejeitados.
- Tabela `devices` permite revogar individualmente — celular roubado → revogação remota, sem rotacionar senha-mestra.

### 2.2 Cifragem em repouso
- `device_secret` é cifrado com AES-GCM no IndexedDB do navegador.
- Chave AES derivada da **senha-mestra do cofre** via PBKDF2-SHA256 com 600.000 iterações + salt aleatório de 16 bytes (em claro no IDB — só anti-rainbow-table).
- A senha-mestra **nunca** é persistida; é derivada para destrancar a sessão e descartada.

### 2.3 Stores em claro (decisão consciente)
- `localStorage`: `tc_vehicles`, `tc_fuel_logs`, `tc_maintenances`, `tc_settings`, `tc_selected_vehicle`.
- **Por que em claro?** Esses dados são pessoais mas não são credenciais — são leitura/escrita constantes em UI síncrona. Cifrar tudo dobra o custo de cada render e exige sessão destravada para abrir o app, o que vai contra o princípio de "abrir e ver na hora". O dispositivo Android ou iOS já oferece criptografia de disco transparente abaixo do navegador; o ataque que essa cifragem extra cobriria é "atacante com acesso físico ao IDB de um celular não-criptografado", caso raríssimo num cenário familiar.
- `IndexedDB`: `tc-secure` (segredos auth) — cifrada via AES-GCM. Outras stores futuras (audit_log, outbox quando ativada) seguirão a mesma chave AES.

### 2.4 Hardening de borda
- **CSP estrita** em `netlify.toml`: `default-src 'self'`, `script-src 'self'`, `frame-ancestors 'none'`. Bloqueia inline JS, frames e fontes externas.
- **HSTS** 2 anos.
- **X-Content-Type-Options: nosniff**, **X-Frame-Options: DENY**, **Referrer-Policy: strict-origin-when-cross-origin**, **Permissions-Policy** restritiva.
- **Cloudflare Rate Limiting** em `/api/auth`: 5 tentativas / IP / 60s.

### 2.5 R2 privado + presigned URLs
- Bucket de fotos não tem acesso público.
- Cliente pede `GET /api/photo/sign?key=...` (HMAC) → recebe URL com `?sig=...&exp=...` válida por 1h.
- URL pode ir direto em `<img src>` — nada de header de auth, mas a assinatura é validada antes de servir os bytes.

### 2.6 Audit log derivado do servidor
- Campo `audit_log.actor_device_id` é populado **a partir do `device_id` autenticado** no servidor, ignorando qualquer valor enviado no payload do cliente.

---

## 3. Runbook — celular perdido ou roubado

1. **No celular sobrevivente**, abra o app e destrave com a senha-mestra.
2. Vá em **Configurações > Dispositivos confiáveis**.
3. Localize o dispositivo perdido pelo nome / `last_seen_at`.
4. Toque em **revogar**.
5. No próximo polling (≤ 10s), o celular perdido vê 401 em todas as requests e fica preso na tela de Configurações.
6. **Sem necessidade de trocar `VAULT_PASSWORD`** — o outro dispositivo continua funcionando normalmente.
7. (Opcional) Se quiser nuking total, troque `VAULT_PASSWORD` no Cloudflare → tudo cai → relogin nos dois dispositivos com nova senha.

---

## 4. Reportar uma vulnerabilidade

Se encontrar algo, por favor **não abra issue público**. Manda direto pra danielbritto88@gmail.com com:
- Descrição do vetor
- PoC mínima
- Sugestão de mitigação

Tempo de resposta: best-effort, projeto pessoal sem SLA.
