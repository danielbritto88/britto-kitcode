# Regras CSS / UI / Styling

> Carregado automaticamente ao editar: `*.css`, `*.scss`, `*.module.css`, `tailwind.config.*`, `*.styles.*`

---

## Princípios de Design

- Mobile-first: escrever estilos para tela pequena, sobrescrever para tela maior
- 8-point grid: espaçamentos múltiplos de 8px (8, 16, 24, 32, 48, 64)
- Consistência via tokens/variáveis — nunca hardcodar cores ou tamanhos
- Acessibilidade não é opcional: contraste mínimo WCAG AA (4.5:1 texto, 3:1 UI)

## Proibições (consultar frontend-specialist.md para contexto completo)

- ❌ Roxo / violeta / índigo como cor primária/brand (sem solicitação explícita)
- ❌ Glassmorphism como padrão (blur + borda fina = clichê 2025)
- ❌ Mesh/Aurora gradients flutuantes no background
- ❌ Bento grids como layout padrão de landing pages
- ❌ "Standard Split" (conteúdo esquerda / imagem direita) como hero padrão
- ❌ `rounded-md` em tudo — escolher extremo: 0-2px (sharp) ou 16-32px (soft)
- ❌ Animações lineares — usar spring physics / ease curves

## Performance de Animação

- Apenas propriedades GPU: `transform`, `opacity` (nunca animar `width`, `height`, `top`, `left`)
- `will-change` apenas em elementos com animação pesada e recorrente
- `prefers-reduced-motion` OBRIGATÓRIO para todas as animações

## Tailwind

- Extrair classes repetidas para componentes, não duplicar
- Preferir variantes semânticas a classes utilitárias brutas quando disponível
- Dark mode via `class` strategy (não `media`) para controle explícito

## Responsividade

- Breakpoints: `sm` (640) `md` (768) `lg` (1024) `xl` (1280) `2xl` (1536)
- Testar em: 375px (mobile), 768px (tablet), 1280px (desktop)
- Touch targets: mínimo 44x44px para elementos interativos (mobile)

## Antes de Concluir UI

- [ ] Contraste verificado (WCAG AA)
- [ ] Testado em mobile (375px)
- [ ] Animações com `prefers-reduced-motion`
- [ ] Sem cores hardcoded — usar tokens/variáveis
- [ ] Estados de hover/focus/active definidos
