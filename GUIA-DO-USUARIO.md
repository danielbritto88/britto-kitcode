# Britto KitCode v2.0 — Guia do Usuário

> Para quem está usando pela primeira vez. Tudo que você precisa saber para colocar o sistema para funcionar e tirar o máximo dele.

---

## O que é o Britto KitCode

O Britto KitCode é um **sistema de orquestração de IA** — uma estrutura de arquivos que você instala na raiz de qualquer projeto e que transforma o Claude Code (ou Gemini CLI) em um time de especialistas coordenados.

Sem ele: você conversa com um modelo genérico.
Com ele: o modelo sabe qual especialista invocar, quais regras seguir, como economizar tokens, como não quebrar código legado, e como preservar contexto entre sessões.

**O sistema não executa código sozinho.** Ele é lido pela IA ao iniciar uma sessão, e passa a guiar todo o comportamento dali em diante — como um manual de operações que a IA segue automaticamente.

---

## Como instalar em um novo projeto

### Opção 1 — Copiar a pasta template (recomendado)

1. Abra a pasta `Britto KitCode/` (este repositório)
2. Copie os seguintes itens para a **raiz do seu projeto**:

```
seu-projeto/
├── CLAUDE.md              ← copiar (obrigatório na raiz)
├── GEMINI.md              ← copiar (obrigatório na raiz)
├── AGENTS.md              ← copiar (obrigatório na raiz)
├── .claude/               ← copiar pasta inteira
│   └── rules/             ← (5 arquivos de regras automáticas)
└── .agent/                ← copiar pasta inteira
    ├── rules/             ← protocolo master
    ├── agents/            ← 21 agentes especializados
    ├── skills/            ← 40 módulos de conhecimento
    ├── workflows/         ← 13 comandos /slash
    ├── scripts/           ← scripts de validação
    └── .shared/           ← dados de design (UI/UX)
```

3. Crie a pasta `.context/` na raiz do projeto (vazia — a IA popula):
   ```
   mkdir .context
   ```

4. Abra o terminal na raiz do projeto e inicie o Claude Code:
   ```
   claude
   ```

O Claude Code detecta o `CLAUDE.md` automaticamente e carrega o sistema.

### O que NÃO precisa copiar (gerado pela IA)

Estes arquivos vivem na pasta `.context/` e são criados automaticamente:

- `.context/PICKUP.md` — gerado pela IA ao final de cada sessão
- `.context/{task-slug}.md` — gerado pelo `/plan`
- `.context/{task-slug}-spec.md` — gerado pelo `/plan` (com SDD)
- `.context/ARCHAEOLOGY.md` — gerado pelo `/archaeo`
- `.context/PROJECT-MEMORY.md` — criado na primeira sessão (use `.agent/templates/PROJECT-MEMORY.md` como template)
- `.context/CODEBASE.md` — criado pela IA ao mapear o projeto

### Opção 2 — Usar com Gemini CLI

O Gemini CLI lê o `GEMINI.md` da raiz e o `AGENTS.md` automaticamente (padrão aberto cross-tool). O comportamento é equivalente ao Claude Code.

```
gemini
```

---

## Como o sistema funciona

Quando você abre uma sessão, a IA segue este fluxo automaticamente:

```
1. `.context/PICKUP.md` existe? → Ler imediatamente (resume onde parou)
      ↓
2. Classificar o tipo do seu request
      ↓
3. Selecionar o modo de startup (QUICK / FULL / ARCHAEOLOGY)
      ↓
4. Identificar o domínio (frontend, backend, legado, etc.)
      ↓
5. Selecionar o agente especialista correto
      ↓
6. Anunciar: 🤖 Aplicando conhecimento de @[agent-name]...
      ↓
7. Responder seguindo o protocolo do agente + skills
```

**Você não precisa dizer "use o agente X"** — o sistema seleciona sozinho com base no que você pede. Mas você pode sobrescrever: `@backend-specialist, adicione autenticação JWT`.

---

## Modos de startup

O sistema tem 3 modos de inicialização, selecionados automaticamente:

### QUICK — Perguntas simples e fixes pontuais
**Quando:** "O que é X?", "Corrija esse bug", "Adicione esse campo"
**O que carrega:** Só `CORE.md` (protocolo essencial)
**Por que:** Economiza tokens. Não precisa de contexto completo para perguntas simples.

### FULL — Build, features, refatoração
**Quando:** "Implemente autenticação", "Crie o dashboard", "Refatore o módulo X"
**O que carrega:** `CORE.md` → `ARCHITECTURE.md` → `.context/CODEBASE.md` → `.context/{task-slug}.md`
**Por que:** Tarefas complexas precisam de contexto completo.

### ARCHAEOLOGY — Código legado / sistema desconhecido
**Quando:** "Preciso entender este módulo", "O que esse código faz?", "Como modificar X sem quebrar nada?"
**O que carrega:** `CORE.md` → `.context/PROJECT-MEMORY.md` → `.context/ARCHAEOLOGY.md` (se existir)
**Por que:** Legado tem armadilhas ocultas. O sistema mapeia antes de modificar.

---

## Arquivos especiais

### `.context/PICKUP.md` — Handoff de sessão
Criado pela IA ao **final** de cada sessão longa. Lido **antes de qualquer coisa** na próxima sessão.

Contém:
- Status atual em 1 linha
- Último arquivo modificado
- Próximo passo exato
- Decisões pendentes
- O que está quebrado / em progresso

**Dica:** Se a sessão for longa e você perceber que o contexto está ficando comprimido, peça: *"Escreva o .context/PICKUP.md antes de fecharmos."*

### `.context/PROJECT-MEMORY.md` — Memória persistente do projeto
Atualizado pela IA ao longo das sessões. Persiste armadilhas, decisões e contexto descoberto.

Contém:
- Armadilhas conhecidas do código
- Decisões técnicas tomadas (e por quê)
- Stack confirmada pelo projeto
- Próximos passos da sessão anterior

**Quando usar:** Projetos com múltiplas sessões longas, especialmente com código legado.

### `.context/{task-slug}-spec.md` — Spec SDD (Spec-Driven Development)
Gerado pelo `/plan` antes do plan file. Define **O QUÊ** o sistema faz (não o como).

Contém: inputs/outputs, precondições, invariantes, casos de borda.

**Regra:** A spec é aprovada por você antes de qualquer implementação. Se o requisito muda → editar a spec → regenerar as tarefas afetadas.

### `.context/{task-slug}.md` — Plan file
O plano de execução da tarefa. Define **COMO** fazer (tarefas numeradas, checklist).

Gerado pelo `/plan`. Usado como referência pelo Writer e pelo Reviewer.

### `.context/ARCHAEOLOGY.md` — Mapa de código legado
Gerado pelo `/archaeo`. Persiste para sessões futuras.

Contém: dependências do módulo, pontos de entrada/saída, efeitos colaterais, armadilhas, débito técnico, classificação `safe-to-change` vs `fragile`.

**Regra:** Antes de modificar código legado, sempre verificar se existe `.context/ARCHAEOLOGY.md` para o módulo.

---

## Os 13 comandos /slash

Digite qualquer um diretamente no chat:

| Comando | Quando usar |
|---|---|
| `/plan` | Início de qualquer feature nova. Gera spec + plan file |
| `/create` | Scaffold de nova aplicação do zero |
| `/brainstorm` | Quando não sabe por onde começar. Descoberta socrática |
| `/debug` | Bug difícil de reproduzir ou raiz desconhecida |
| `/enhance` | Melhorar qualidade de código existente (sem mudar comportamento) |
| `/review` | Revisar código implementado contra a spec (sessão limpa = sem viés) |
| `/test` | Rodar suítes de teste e analisar cobertura |
| `/deploy` | Pipeline completo de deployment |
| `/status` | Health check do projeto (testes, lint, deps, segurança) |
| `/preview` | Visualizar mudanças pendentes antes de aplicar |
| `/orchestrate` | Tarefas que exigem múltiplos agentes em paralelo |
| `/archaeo` | Mapear módulo legado antes de tocá-lo |
| `/ui-ux-pro-max` | Sistema de design completo (50 estilos, 21 paletas, guidelines) |

### Fluxo típico com os comandos

```
Nova feature:
/plan → implementar → /review → /test → /deploy

Bug crítico:
/debug → fix → /test → /deploy

Código legado:
/archaeo [módulo] → /plan → implementar → /review

UI do zero:
/brainstorm → /ui-ux-pro-max → /plan → implementar
```

---

## Os 21 agentes especializados

A IA seleciona automaticamente, mas você pode invocar manualmente com `@nome-do-agente`.

### Planejamento e Coordenação

| Agente | Invoque quando... |
|---|---|
| `@orchestrator` | A tarefa envolve múltiplos domínios ao mesmo tempo |
| `@project-planner` | Precisa de descoberta, spec SDD ou breakdown de tarefas |
| `@explorer-agent` | Quer um survey do codebase antes de tocar qualquer coisa |
| `@product-manager` | Precisa de user stories, requisitos funcionais |
| `@product-owner` | Decisões de estratégia, priorização de backlog, MVP scope |

### Desenvolvimento

| Agente | Invoque quando... |
|---|---|
| `@frontend-specialist` | Web UI, Next.js, React, Tailwind, componentes |
| `@backend-specialist` | APIs, servidor, regras de negócio, Node.js/Bun |
| `@database-architect` | Schema de banco, migrations, queries, ORM |
| `@mobile-developer` | iOS (SwiftUI), Android (Jetpack), React Native, Flutter |
| `@ai-engineer` | Apps com LLM, RAG, MCP servers, integração com modelos |
| `@game-developer` | Lógica de jogo, mecânicas, física, loop |

### Qualidade e Segurança

| Agente | Invoque quando... |
|---|---|
| `@debugger` | Bug com causa raiz desconhecida ou comportamento inesperado |
| `@test-engineer` | Estratégia de testes, cobertura, TDD |
| `@qa-automation-engineer` | E2E com Playwright, pipelines de CI com testes |
| `@performance-optimizer` | Lentidão, Core Web Vitals, profiling |
| `@security-auditor` | Auditoria de segurança, OWASP, hardening |
| `@penetration-tester` | Testes ofensivos, simulação de ataques (com autorização) |

### Infraestrutura e Conteúdo

| Agente | Invoque quando... |
|---|---|
| `@devops-engineer` | CI/CD, containers, infra, deploy automatizado |
| `@seo-specialist` | Ranqueamento, Core Web Vitals, structured data, GEO |
| `@documentation-writer` | Manuais, READMEs, docs técnicos |
| `@code-archaeologist` | Mapear e entender código legado antes de modificar |

---

## Regras automáticas por tipo de arquivo

O Claude Code carrega regras específicas automaticamente baseado no arquivo que você está editando. **Sem precisar pedir.**

| Arquivo que você edita | Regras carregadas automaticamente |
|---|---|
| `*.sql`, `*.prisma`, `*migration*` | Regras de banco: prepared statements, migrations com rollback, N+1 |
| `*.test.*`, `*.spec.*` | Regras de teste: padrão AAA, pirâmide, proibições de mock |
| `*.css`, `*.scss`, `tailwind.config.*` | Regras de UI: mobile-first, 8pt grid, acessibilidade WCAG |
| `route.ts`, `controller.*`, `*.api.*` | Regras de API: validação, auth/authz, status codes, paginação |
| Arquivos em `/legacy/`, `/old/`, `/v1/` | Regras de legado: mapear antes de modificar, menor intervenção |

Essas regras não substituem os agentes — complementam. A IA recebe a orientação certa antes mesmo de consultar o Request Classifier.

---

## Scripts de validação

Quatro scripts Python para verificar o projeto em diferentes estágios:

### Durante o desenvolvimento
```bash
python .agent/scripts/checklist.py .
```
Validação prioritizada: segurança → lint → schema → testes → UX → SEO

### Antes de fazer deploy
```bash
python .agent/scripts/verify_all.py . --url <URL>
```
Suite completa de pré-deployment. A task **não está concluída** até este script retornar sucesso.

### Verificar status do projeto
```bash
python .agent/scripts/session_manager.py status
```
Stack detection, arquivos pendentes, status geral.

### Preview de mudanças
```bash
python .agent/scripts/auto_preview.py .
```
Visualizar mudanças pendentes sem aplicar.

---

## Protocolo Writer/Reviewer

Para tarefas complexas, o sistema usa duas sessões separadas para eliminar viés de confirmação:

### Writer Session
- Implementa com base no spec + plan file
- Tem contexto completo da conversa

### Reviewer Session
- **Nova sessão** — sem acesso à conversa do Writer
- Lê apenas: `.context/{task-slug}-spec.md` + `.context/{task-slug}.md` + código gerado
- Pergunta: *"Este código faz o que a spec especifica?"*
- Verifica casos de borda, invariantes, tratamento de erro

**Como ativar:** `/review`

**Por que funciona:** A IA que implementou tende a justificar as próprias decisões. Uma segunda sessão sem esse contexto encontra problemas que a primeira não viu.

---

## Socratic Gate — Por que a IA faz perguntas antes de implementar

Para **novas features**, a IA é obrigada a fazer no mínimo 3 perguntas estratégicas antes de implementar qualquer coisa. Para **edições e bug fixes**, confirma escopo + 2 perguntas de impacto.

Isso não é lentidão — é proteção contra retrabalho. Uma implementação baseada em premissas erradas custa mais do que 2 minutos de alinhamento.

Se você já sabe o que quer e não precisa das perguntas, diga: *"Pode implementar direto, sem perguntas."*

---

## Fluxo completo de uma sessão típica

### Início de sessão

```
1. [Auto] Claude Code lê CLAUDE.md
2. [Auto] Verifica `.context/PICKUP.md` → lê se existir
3. [Auto] Lê CORE.md
4. Você faz seu request
5. [Auto] Classifica request (QUICK/FULL/ARCHAEOLOGY)
6. [Auto] Seleciona agente → anuncia 🤖
```

### Durante o trabalho

```
7. Para COMPLEX CODE: cria `.context/{task-slug}.md` antes de implementar
8. Para features novas: Socratic Gate (3 perguntas)
9. Implementação com agente + skills adequados
10. Checklist: python .agent/scripts/checklist.py .
```

### Fim de sessão

```
11. Atualizar `.context/PROJECT-MEMORY.md` com descobertas
12. Escrever `.context/PICKUP.md` com próximo passo exato
13. Marcar tarefas concluídas no plan file
```

---

## Sistema de prioridade de regras

Quando há conflito entre regras, a precedência é:

```
P0 — CORE.md       (protocolo master, sempre ativo)
P1 — Agent.md      (regras do agente especialista)
P2 — SKILL.md      (conhecimento técnico da skill)
```

As regras do `CORE.md` nunca podem ser sobrescritas por um agente ou skill.

---

## Claude Code vs Gemini CLI

| | Claude Code | Gemini CLI |
|---|---|---|
| Entry point | `CLAUDE.md` (raiz) | `GEMINI.md` (raiz) |
| Protocolo | `.agent/rules/CORE.md` | `.agent/rules/CORE.md` (mesmo) |
| Regras por arquivo | `.claude/rules/` (nativo) | Não suportado nativamente |
| Cross-tool standard | `AGENTS.md` | `AGENTS.md` (lido automaticamente) |
| Quando usar | Uso primário | Fallback quando créditos do Claude acabam |

Ao trocar para Gemini: o comportamento deve ser equivalente porque ambos leem o mesmo `CORE.md`. O `AGENTS.md` garante que as restrições críticas e a stack do projeto estejam disponíveis mesmo sem o `.claude/rules/`.

---

## Sistema de design UI/UX

O comando `/ui-ux-pro-max` ativa o sistema de design completo. Os dados ficam em `.agent/.shared/ui-ux-pro-max/data/` e incluem:

| Arquivo | Conteúdo |
|---|---|
| `styles.md` | 100+ estilos UI categorizados |
| `colors.md` | Paletas por tipo de produto |
| `typography.md` | Pares de fontes com contexto de uso |
| `icons.md` | Referência Lucide React por categoria |
| `ux-guidelines.md` | Guidelines de UX por categoria |
| `web-interface.md` | Boas práticas de interface web |
| `stacks/nextjs.md` | Guidelines específicos de Next.js |
| `stacks/react.md` | Guidelines específicos de React |
| `stacks/shadcn.md` | Guidelines shadcn/ui |
| *(+ 13 outros stacks)* | Flutter, SwiftUI, Vue, Svelte, etc. |

Todos os dados estão em Markdown indexado com `## Categoria` — a IA lê só a seção relevante, não o arquivo inteiro.

---

## Dicas para tirar o máximo do sistema

### 1. Deixe o .context/PICKUP.md ser escrito
No final de sessões longas, sempre peça: *"Escreva o .context/PICKUP.md antes de fecharmos."* Isso garante que a próxima sessão retome exatamente de onde parou.

### 2. Use /plan antes de implementar features grandes
O `/plan` gera a spec e o plan file que guiam toda a implementação. Sem eles, código complexo perde a âncora de intenção.

### 3. Rode /archaeo antes de tocar código legado
Código legado tem dependências ocultas que não aparecem no código. O `/archaeo` mapeia tudo isso em 10-15 minutos. Economiza horas de debugging.

### 4. Use /review para código crítico
Autenticação, pagamento, dados sensíveis — sempre faça uma sessão de review separada. A segunda sessão encontra o que a primeira ignora.

### 5. O .context/PROJECT-MEMORY.md é seu
Você pode editar manualmente. Adicione contexto que a IA não teria como descobrir sozinha: decisões de negócio, limitações de prazo, decisões de arquitetura que não estão no código.

### 6. Especifique o agente quando souber qual é
`@security-auditor, revise este endpoint` é mais preciso do que deixar o sistema adivinhar. Use quando o domínio for inequívoco.

### 7. Monitore os tokens em sessões longas
Quando o contexto começa a ser comprimido automaticamente, o `.context/PICKUP.md` é seu salvaguarda. Escreva antes que o contexto seja perdido.

---

## Referência rápida

```
Comandos:    /plan  /create  /brainstorm  /debug  /enhance
             /review  /test  /deploy  /status  /preview
             /orchestrate  /archaeo  /ui-ux-pro-max

Agentes:     @orchestrator  @project-planner  @explorer-agent
             @frontend-specialist  @backend-specialist  @mobile-developer
             @database-architect  @devops-engineer  @security-auditor
             @penetration-tester  @ai-engineer  @debugger
             @test-engineer  @performance-optimizer  @seo-specialist
             @documentation-writer  @game-developer  @product-manager
             @product-owner  @qa-automation-engineer  @code-archaeologist

Scripts:     python .agent/scripts/checklist.py .
             python .agent/scripts/verify_all.py . --url <URL>
             python .agent/scripts/session_manager.py status
             python .agent/scripts/auto_preview.py .

Arquivos:    .context/PICKUP.md          → handoff de sessão
             .context/PROJECT-MEMORY.md  → memória persistente
             .context/ARCHAEOLOGY.md     → mapa de legado
             .context/{slug}-spec.md     → spec SDD (o quê)
             .context/{slug}.md          → plan file (como)
```
