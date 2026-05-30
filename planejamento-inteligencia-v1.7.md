# Planejamento: Inteligência, UX 2026 e Ajustes de Negócio (v1.7)

> **Contexto:** Levantamento excepcional de requisitos baseado nas solicitações do usuário, contrastado com as fundações estabelecidas no `PROJETO.md` e regras do Antigravity Kit.
> **Objetivo:** Refinar a UX, injetar inteligência nos formulários, reescrever a filosofia de deleção e atingir os padrões visuais premium de 2026 (Identidade "Telemetria Íntima").

---

## [x] 1. Login "Seamless" (Ignition Bypass)
**Problema:** A tela inicial com botão "Começar" (ou login) aparece de forma redundante para usuários que já possuem sessão ativa.
**Solução:**
- Modificar o entry point (`App.tsx` ou componente de Autenticação / Splash).
- Se as chaves `device_secret` e `vault_key` já existirem e forem válidas, **ocultar** o `<IgnitionSplash>` manual.
- Mostrar apenas a animação fluida (fade-in ou splash super rápido, como em apps nativos premium) e injetar o usuário diretamente na `<HomePage>`.
**Agentes e Skills Envolvidos:**
- **Agentes:** `@frontend-specialist` (lógica de estado), `@mobile-developer` (animações e transições PWA).
- **Skills:** `react-best-practices`, `mobile-design`, `clean-code`.
**⚠️ REGRA DE EXECUÇÃO:** OBRIGATÓRIO: NUNCA, JAMAIS utilizar códigos genéricos e sem pontas. SEMPRE verificar ao final se está tudo certo, testando o fluxo de login completo e acionando todos os agentes e scripts de validação necessários para garantir a excelência.

---

## [x] 2. Sistema Monetário BR Inteligente
**Problema:** Ausência de formatação BRL automática ao digitar (separador de milhar com ponto, decimal com vírgula).
**Solução:**
- Criar um componente base `<CurrencyInput>` ou adaptar o `<NumberPad>` atual usando abordagens como `react-number-format`.
- **Regra de UX:** O usuário digita os números corridos e a máscara vai se formatando da direita para a esquerda. Ex: digita "500" -> aparece `R$ 5,00`.
- **Regra de Dados:** O estado interno (`react-hook-form` e banco local) continua armazenando o valor numérico (em formato float ou centavos exatos). O `Intl.NumberFormat('pt-BR')` atua apenas na interface visual.
**Agentes e Skills Envolvidos:**
- **Agentes:** `@frontend-specialist`.
- **Skills:** `react-best-practices`, `clean-code`.
**⚠️ REGRA DE EXECUÇÃO:** OBRIGATÓRIO: NUNCA, JAMAIS utilizar códigos genéricos e sem pontas. SEMPRE verificar ao final se está tudo certo, garantindo a gravação limpa no estado do app e a renderização visual impecável, acionando todos os agentes necessários para garantir a excelência.

---

## [x] 3. Lógica de Seleção de Combustíveis (Inteligência Contextual)
**Problema:** O formulário de abastecimento exibe "Flex" como opção de abastecimento na bomba, além de sugerir combustíveis incompatíveis com o motor.
**Solução:**
- Ao abrir o `<AddFuelSheet>`, ler as propriedades do `vehicle` selecionado no header.
- Substituir o seletor estático por uma renderização dinâmica:
  - Motor **Flex** -> Mostra botões apenas para `['Gasolina', 'Etanol']`.
  - Motor **Gasolina** -> Fixa a opção em `['Gasolina']` (e omite a necessidade de clique do usuário).
  - Motor **Diesel** -> Fixa em `['Diesel']`.
- **Ação:** O tipo "Flex" passará a ser aceito apenas no momento do _cadastro do veículo_, mas sumirá completamente da lista de "Combustível Abastecido".
**Agentes e Skills Envolvidos:**
- **Agentes:** `@frontend-specialist`.
- **Skills:** `react-best-practices`, `frontend-design`.
**⚠️ REGRA DE EXECUÇÃO:** OBRIGATÓRIO: NUNCA, JAMAIS utilizar códigos genéricos e sem pontas. SEMPRE verificar ao final se está tudo certo, cruzando tipos de veículos reais na tela de abastecimento, acionando todos os agentes necessários para garantir a excelência.

---

## [x] 4. Bomba Auto-Calculável (Triângulo Matemático)
**Problema:** Falta de cálculo inteligente entre "Total R$", "Litros" e "R$ / Litro".
**Solução:**
- Usar o `watch` do `react-hook-form` na folha de abastecimento.
- Criar uma rotina inteligente com proteção de foco (para não sobreescrever o campo que o usuário está ativamente digitando):
  - Preencheu **Litros** + **R$ / Litro** -> Preenche automático: `Total`
  - Preencheu **Total** + **R$ / Litro** -> Preenche automático: `Litros`
  - Preencheu **Total** + **Litros** -> Preenche automático: `R$ / Litro`
- Adicionar uma leve micro-animação (spring) quando o número calculado surgir na tela.
**Agentes e Skills Envolvidos:**
- **Agentes:** `@frontend-specialist`, `@mobile-developer` (micro-animações PWA).
- **Skills:** `react-best-practices`, `clean-code`, `frontend-design`.
**⚠️ REGRA DE EXECUÇÃO:** OBRIGATÓRIO: NUNCA, JAMAIS utilizar códigos genéricos e sem pontas. SEMPRE verificar ao final se está tudo certo, testando loops infinitos e precisão de casas decimais, acionando todos os agentes necessários para garantir a excelência.

---

## [x] 5. Migração de "Arquivar" para "Excluir" (Hard Delete)
**Problema:** O `PROJETO.md` definia a regra de _soft delete_ (arquivamento). O usuário invalidou isso e exige que seja _Exclusão Definitiva_ de toda a base.
**Solução:**
- **UI:** Fazer varredura no código. Trocar labels de "Arquivar" por "Excluir". Substituir ícones Lucide de `Archive` por `Trash2`, aplicando a cor `--danger`.
- **Armazenamento Local:** Atualizar as mutations para usar `Array.filter` e remover fisicamente do `localStorage` e `IndexedDB`.
- **Sincronização Cloud:** Alterar `/api/sync` para suportar rastreio de deleções ou rodar exclusão via eventos do `audit_log` (tipo `hard_delete`). No merge offline, o Worker da Cloudflare rodará `DELETE` no D1 e o frontend deletará localmente.
**Agentes e Skills Envolvidos:**
- **Agentes:** `@frontend-specialist` (UI e localStorage), `@backend-specialist` (Worker e D1), `@database-architect` (modelagem de eventos de exclusão).
- **Skills:** `database-design`, `api-patterns`, `react-best-practices`.
**⚠️ REGRA DE EXECUÇÃO:** OBRIGATÓRIO: NUNCA, JAMAIS utilizar códigos genéricos e sem pontas. SEMPRE verificar ao final se está tudo certo, validando a integridade dos dados no IndexedDB e nuvem após a exclusão offline/online, acionando todos os agentes necessários para garantir a excelência.

---

## [x] 6. Tela de Relatórios 2.0 (Comportamento Adaptativo)
**Problema:** A tela de relatórios exibe opções irrelevantes (ex: filtros ou veículos não cadastrados).
**Solução:**
- **Ocultação Inteligente (Zero-states dinâmicos):** Extrair os tipos únicos de combustível e manutenção _realmente_ gastos no período. Omitir as demais opções gráficas.
- **Visual Design:** Integrar os componentes `<HeroNumber>` e `<ScaleRule>` seguindo o modelo "Telemetria Íntima" (escuro, limpo, Bodoni/Jost).
**Agentes e Skills Envolvidos:**
- **Agentes:** `@frontend-specialist` (renderização e lógica), `@mobile-developer` (layout imersivo).
- **Skills:** `frontend-design`, `mobile-design`, `react-best-practices`.
**⚠️ REGRA DE EXECUÇÃO:** OBRIGATÓRIO: NUNCA, JAMAIS utilizar códigos genéricos e sem pontas. SEMPRE verificar ao final se está tudo certo, conferindo as renderizações condicionais, acionando todos os agentes necessários para garantir a excelência.

---

## [x] 7. Polimento Geral UX / Visual Design (Padrão 2026)
**Problema:** Necessidade do "Wow Effect" Premium.
**Solução:**
- **Auditoria Final:** Revisar fontes (Bodoni para números, JetBrains para IDs, Jost para UI).
- **Movimento:** Aplicar feedback háptico correto (via `haptics.ts`) e inércia do `framer-motion` nas telas e botões.
- **Teste de Campo:** Executar scripts de validação de acessibilidade e experiência.
**Agentes e Skills Envolvidos:**
- **Agentes:** `@mobile-developer`, `@frontend-specialist`, `@qa-automation-engineer` (para testes finais).
- **Skills:** `mobile-design`, `frontend-design`, `performance-profiling`.
**⚠️ REGRA DE EXECUÇÃO:** OBRIGATÓRIO: NUNCA, JAMAIS utilizar códigos genéricos e sem pontas. SEMPRE verificar ao final se está tudo certo, repassando o app inteiro para corrigir pontas soltas visuais, acionando todos os agentes necessários para garantir a excelência.
