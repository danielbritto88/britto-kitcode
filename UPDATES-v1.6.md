# Tanque Cheio — Acompanhamento de Atualizações v1.6

> **LEITURA OBRIGATÓRIA ANTES DE QUALQUER IMPLEMENTAÇÃO:**
> 1. `CLAUDE.md` na raiz do projeto — protocolo do Antigravity Kit e roteamento de agentes
> 2. `PROJETO.md` na raiz — visão, princípios, stack, modelo de dados e critérios de "pronto"
> 3. `.agent/rules/CORE.md` — regras master de comportamento do agente
>
> Nenhuma modificação deve sair do padrão definido nesses documentos.

---

## Como usar este arquivo

- Cada item tem um status: `[ ]` pendente · `[~]` em andamento · `[x]` concluído
- Implemente sempre em ordem de fase (fase 1 antes da fase 2, etc.)
- Ao concluir um item, marque `[x]` e registre a data
- Itens dentro de uma mesma fase sem dependência entre si podem ser feitos em paralelo

---

## Fase 1 — Experiência PWA (fundação)

> Problemas que afetam toda a experiência do app. Corrigir primeiro.

### F1-01 · Full screen no PWA instalado
**Origem:** item 4 do relatório de testes  
**Status:** `[x]` 2026-05-02

A barra superior e inferior do navegador aparecem mesmo após instalar o atalho na tela inicial, tirando a experiência de app nativo.

**O que fazer:**
- Verificar `vite-plugin-pwa` e o manifesto: `display` deve ser `"standalone"` (já definido em §9 do `PROJETO.md`)
- Garantir `meta name="apple-mobile-web-app-capable" content="yes"` e `apple-mobile-web-app-status-bar-style: black-translucent`
- Aplicar `env(safe-area-inset-*)` corretamente no `<body>`, tab bar e header para cobrir notch e gesture bar
- Testar no Android (Chrome) e iOS (Safari) após instalação

---

### F1-02 · Desabilitar seleção de texto e menu de busca
**Origem:** item 5 do relatório de testes  
**Status:** `[x]` 2026-05-02

Ao tocar em texto não clicável, o Android exibe o menu de busca do Google, quebrando totalmente a imersão de app.

**O que fazer:**
- Adicionar ao CSS global: `user-select: none` e `-webkit-user-select: none` em todos os elementos que não sejam inputs/textareas
- Garantir `-webkit-touch-callout: none` para iOS
- Elementos editáveis devem manter `user-select: text` explicitamente

---

### F1-03 · Manter barra de navegação inferior na tela de Configurações
**Origem:** item 6 do relatório de testes  
**Status:** `[x]` 2026-05-02

Ao navegar para Configurações, a tab bar com "Início / Combustível / Manutenção / Ajustes" some.

**O que fazer:**
- Verificar o layout de roteamento (React Router v6) — a tab bar deve estar fora das rotas filhas, no layout raiz
- Garantir que a rota `/settings` (ou equivalente) está dentro do layout que renderiza a tab bar
- Testar navegação entre todas as abas após a correção

---

## Fase 2 — Ajustes de Layout e Navegação

> Mudanças visuais na estrutura de navegação. Sem dependência de fase 1, mas devem ser feitas juntas para consistência.

### F2-01 · Renomear "Garagem" para "Tanque Cheio" no header
**Origem:** item 14 do relatório de testes  
**Status:** `[x]` 2026-05-02

Na tela inicial aparece "Garagem" no header superior. O nome correto do app é "Tanque Cheio".

**O que fazer:**
- Localizar o componente de header/título da HomePage
- Substituir o texto "Garagem" por "Tanque Cheio"
- Verificar se há outros lugares com "Garagem" como label de seção (não código)

---

### F2-02 · Mover engrenagem de Ajustes para a barra superior
**Origem:** item 15 do relatório de testes  
**Status:** `[x]` 2026-05-02

O ícone de engrenagem de configurações deve sair da tab bar inferior e ir para a barra superior direita, ao lado do seletor de veículos.

**O que fazer:**
- Adicionar botão de engrenagem no header, à direita do `<KeyChip>` (seletor de veículo)
- Remover o item "Ajustes" da tab bar inferior
- O espaço liberado na tab bar será usado pelo item F2-03

---

### F2-03 · Substituir "Ajustes" na tab bar pelo ícone de Relatórios
**Origem:** item 16 do relatório de testes  
**Status:** `[x]` 2026-05-02

Com a engrenagem movida para o header (F2-02), o slot da tab bar inferior deve receber o acesso à nova tela de Relatórios (implementada na Fase 5).

**O que fazer:**
- Trocar o ícone e rota do 4º slot da tab bar de "Ajustes" para "Relatórios"
- Ícone sugerido: `BarChart2` ou `TrendingUp` do Lucide
- A rota pode ser `/reports` — a tela será implementada na Fase 5
- Garantir que a engrenagem no header ainda navega para `/settings`

---

## Fase 3 — Gestão de Veículos

> Correções e melhorias no cadastro e seleção de veículos. Depende da fase 1 estar estável.

### F3-01 · Corrigir upload de foto no cadastro de veículo
**Origem:** item 2 do relatório de testes  
**Status:** `[x]` 2026-05-02

A foto tirada durante o cadastro não está sendo enviada (aparece notificação, veículo fica sem foto).

**O que fazer:**
- Verificar o fluxo de upload: tirar foto → converter para blob → `POST /api/photo/upload` → salvar `photo_key` no veículo
- Verificar se o `photo_key` está sendo incluído no payload de criação do veículo
- Verificar autenticação HMAC na chamada de upload (token pode expirar ou estar incorreto)
- Verificar resposta de erro no Worker e adicionar log descritivo
- Testar end-to-end: foto aparece na lista após cadastro

---

### F3-02 · Adicionar opção de escolher foto da galeria
**Origem:** item 1 do relatório de testes  
**Status:** `[x]` 2026-05-02

No cadastro de veículo só é possível tirar foto; não há opção de escolher da galeria.

**O que fazer:**
- Adicionar `<input type="file" accept="image/*">` sem `capture="environment"` — isso permite galeria e câmera
- Oferecer dois botões: "Tirar foto" (`capture="environment"`) e "Escolher da galeria" (sem capture)
- Ou usar um único input sem `capture` — o Android oferece o menu de escolha automaticamente
- Aplicar o mesmo fluxo de upload do F3-01

---

### F3-03 · Adicionar campo de quilometragem atual no cadastro
**Origem:** item 7 do relatório de testes  
**Status:** `[x]` 2026-05-02

O cadastro de veículo não pergunta a quilometragem atual, embora o campo `odometer_initial` já exista no modelo de dados (ver §5 do `PROJETO.md`).

**O que fazer:**
- Adicionar campo "Quilometragem atual" no formulário de cadastro de veículo
- Campo obrigatório, tipo número, sufixo "km", JetBrains Mono
- Salvar em `odometer_initial` no modelo de dados
- Usar este valor como base para cálculo de km/L no combustível

---

### F3-04 · Habilitar clique no veículo para editar
**Origem:** item 3 do relatório de testes  
**Status:** `[x]` 2026-05-02

Na tela de veículos, após cadastrar, não há como clicar no veículo para editar suas informações.

**O que fazer:**
- Tornar o card/item de veículo clicável — abre bottom sheet de edição
- O bottom sheet deve ter os mesmos campos do cadastro, pré-preenchidos
- Adicionar opção de "Arquivar veículo" (soft delete — `archived_at`, conforme §2.1 do `PROJETO.md`)
- Salvar edição via sync (respeitar `updated_at` para merge conforme §6)

---

### F3-05 · Opção de selecionar todos os veículos no seletor
**Origem:** item 17 do relatório de testes  
**Status:** `[x]` 2026-05-02

Quando há mais de um veículo, não é possível visualizar os dados de todos ao mesmo tempo na tela inicial.

**O que fazer:**
- Adicionar opção "Todos" no carrossel/seletor de veículos do `<KeyChip>`
- Quando "Todos" estiver selecionado, a HomePage agrega os dados de todos os veículos
- Garantir que o filtro "Todos" funciona nos gráficos e valores do dashboard
- Persistir a seleção em localStorage (`tc_settings`)

---

## Fase 4 — Formulário de Combustível

> Melhorias na tela de abastecimento. Depende das correções de fase 1.

### F4-01 · Formatação automática BRL ao digitar valor
**Origem:** item 8 do relatório de testes  
**Status:** `[x]` 2026-05-02

Ao digitar o valor do abastecimento, não há formatação automática com ponto e vírgula (padrão BR).

**O que fazer:**
- Implementar máscara de moeda BRL no campo de valor: `R$ 1.234,56`
- Usar `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` para formatar
- Input real armazena centavos como inteiro (evita float) — exibição formata na leitura
- Aplicar no `<NumberPad>` (componente de identidade do app — §8.5 do `PROJETO.md`)

---

### F4-02 · Remover campo "Posto" do formulário de abastecimento
**Origem:** item 10 do relatório de testes  
**Status:** `[x]` 2026-05-02

O campo de posto não é necessário e deve ser removido do formulário.

**O que fazer:**
- Remover o campo `station` do formulário de abastecimento (AddFuelSheet)
- O campo pode permanecer no modelo de dados para não quebrar histórico existente, mas não expor na UI
- Verificar se há alguma exibição de `station` no histórico de combustível e remover

---

### F4-03 · Adicionar tipo de combustível e valor por litro
**Origem:** item 9 do relatório de testes  
**Status:** `[x]` 2026-05-02

O formulário de abastecimento não pergunta qual combustível foi usado nem o valor por litro. Esses dados são essenciais para os relatórios de consumo.

**O que fazer:**
- Adicionar campo "Tipo de combustível" — selector com opções: Gasolina, Etanol, Diesel, GNV, Elétrico
- Adicionar campo "Valor por litro" com formatação BRL automática (mesmo padrão de F4-01)
- O campo `fuel_type` já existe no modelo de dados; garantir persistência
- Calcular e exibir "Total de litros" automaticamente se usuário preencher valor total + valor/litro
- O campo `fuel_type` do veículo pode ser usado como padrão pré-selecionado

---

### F4-04 · Habilitar edição de registro de abastecimento
**Origem:** item 13 do relatório de testes  
**Status:** `[x]` 2026-05-02

Na tela de combustível não há como selecionar um abastecimento para editá-lo.

**O que fazer:**
- Implementar swipe-left em item da lista de abastecimentos para abrir opção "Editar" (conforme §8.4 do `PROJETO.md`: "swipe-actions: esquerda: editar")
- Ou tap longo no item para exibir ações
- Abrir o mesmo bottom sheet de cadastro com dados pré-preenchidos
- Salvar edição respeitando `updated_at` para sync

---

## Fase 5 — Formulário de Manutenção

> Correções na tela de manutenção. Sem dependência de outras fases.

### F5-01 · Corrigir formatação do campo Custo (BRL com vírgula)
**Origem:** item 11 do relatório de testes  
**Status:** `[x]` 2026-05-02

O campo de custo na manutenção usa ponto como separador decimal em vez de vírgula (padrão BR), e não tem formatação automática.

**O que fazer:**
- Aplicar a mesma máscara BRL do F4-01 no campo "Custo" da manutenção
- Verificar se o valor está sendo salvo corretamente (sem perda de precisão)
- Garantir que exibições existentes no histórico também formatam em pt-BR

---

### F5-02 · Habilitar edição de registro de manutenção
**Origem:** item 12 do relatório de testes  
**Status:** `[x]` 2026-05-02

Após criar uma manutenção não há como editar as informações dela.

**O que fazer:**
- Implementar swipe-left em item da timeline de manutenções para abrir opção "Editar" (conforme §8.4 do `PROJETO.md`)
- Ou tap no item para abrir bottom sheet de detalhes com botão "Editar"
- Abrir o mesmo bottom sheet de cadastro com dados pré-preenchidos
- Salvar edição respeitando `updated_at` para sync

---

## Fase 6 — Tela de Relatórios (nova funcionalidade)

> Nova tela completa. Depende das fases 3, 4 e 5 para ter dados ricos. F2-03 já reservou o slot na tab bar.

### F6-01 · Criar tela de Relatórios completa
**Origem:** itens 9 e 16 do relatório de testes  
**Status:** `[x]` 2026-05-02

Nova tela acessível pela tab bar (slot liberado em F2-03). Deve ser a central de análise do app.

**Seções obrigatórias:**

**Consumo por combustível**
- Média km/L por tipo de combustível (Gasolina, Etanol, etc.)
- Evolução da média ao longo do tempo (gráfico de linha — Recharts)
- Custo médio por km por combustível

**Resumo financeiro**
- Gasto total: mensal, anual, acumulado
- Distribuição: combustível vs manutenção (gráfico de pizza ou `<ScaleRule>`)
- Custo/km do período selecionado

**Filtros**
- Por veículo (individual ou "Todos" — integrar com F3-05)
- Por período: último mês, últimos 3 meses, último ano, personalizado (date picker)
- Por tipo de combustível

**Exportação**
- **CSV**: dados brutos filtrados, download direto
- **PDF estilizado**: usar jspdf + jspdf-autotable com identidade visual "Tanque Cheio" (logo, paleta, tipografia)
- **WhatsApp**: Web Share API com PDF ou resumo em texto formatado (fallback `wa.me`)

**Padrões de design a seguir:**
- Componentes de identidade: `<HeroNumber>`, `<ScaleRule>`, `<Gauge>` (ver §8.5 do `PROJETO.md`)
- Paleta "Painel Noturno v2" (ver §8.3 do `PROJETO.md`)
- Tipografia: Bodoni para números-herói, Jost para corpo (ver §8.2 do `PROJETO.md`)
- Bottom sheets para filtros
- Tab bar inferior deve estar visível nesta tela

---

## Resumo de Prioridades

| Fase | Itens | Prioridade | Dependências |
|---|---|---|---|
| **1** — PWA/UX fundação | F1-01, F1-02, F1-03 | 🔴 Crítica | Nenhuma |
| **2** — Layout/Navegação | F2-01, F2-02, F2-03 | 🟠 Alta | Nenhuma |
| **3** — Veículos | F3-01, F3-02, F3-03, F3-04, F3-05 | 🟠 Alta | Fase 1 estável |
| **4** — Combustível | F4-01, F4-02, F4-03, F4-04 | 🟡 Média | Fase 1 estável |
| **5** — Manutenção | F5-01, F5-02 | 🟡 Média | Nenhuma |
| **6** — Relatórios | F6-01 | 🟢 Normal | Fases 3, 4 e 5 |

**Total:** 17 melhorias organizadas em 6 fases · 16 itens individuais + 1 funcionalidade nova

---

## Checklist pós-implementação (por fase)

Após concluir qualquer fase, executar obrigatoriamente:

```bash
python .agent/scripts/checklist.py .
```

Antes de deploy:

```bash
python .agent/scripts/verify_all.py . --url <URL>
```

Critérios de "pronto" completos em `PROJETO.md §12`.
