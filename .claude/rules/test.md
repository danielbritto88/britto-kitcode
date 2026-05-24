# Regras de Testes

> Carregado automaticamente ao editar: `*.test.*`, `*.spec.*`, `*/__tests__/*`, `*/test/*`

---

## Princípios

- Testes documentam comportamento, não implementação — se refatorar sem quebrar comportamento, testes devem continuar passando
- Um teste por comportamento (não por função)
- Padrão AAA obrigatório: **Arrange** (setup) → **Act** (executar) → **Assert** (verificar)
- Nomes descritivos: `should [fazer X] when [condição Y]`

## Pirâmide de Testes

```
        /E2E\        ← poucos, lentos, testam fluxos completos
       /------\
      /Integration\  ← moderados, testam módulos integrados
     /------------\
    /     Unit     \ ← muitos, rápidos, testam funções isoladas
```

- Unit > Integration > E2E (em quantidade)
- Cobertura de branches nos paths críticos (auth, pagamento, dados sensíveis)

## O que Sempre Testar

- Happy path (fluxo principal)
- Casos de borda (null, empty, overflow, unauthorized)
- Casos de erro esperados (validação, not found, conflict)
- Comportamento assíncrono (promises, callbacks, events)

## Mocks

- Mockar dependências externas (APIs, banco, email, tempo)
- NÃO mockar o que você está testando
- Preferir fakes/stubs concretos a mocks genéricos quando possível
- Cuidado com mocks que "passam" mas comportamento real é diferente

## TDD Quando Aplicável

```
1. Escrever teste que falha (RED)
2. Escrever código mínimo para passar (GREEN)
3. Refatorar mantendo testes passando (REFACTOR)
```

## Antes de Concluir

- [ ] Todos os testes passando localmente
- [ ] Sem `test.only` ou `it.only` esquecidos
- [ ] Sem `console.log` em testes
- [ ] Casos de erro cobertos, não só happy path
- [ ] Testes de integração não dependem de ordem de execução
