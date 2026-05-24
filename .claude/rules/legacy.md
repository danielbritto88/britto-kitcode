# Regras para Código Legado

> Carregado automaticamente ao editar arquivos em: `/legacy/`, `/old/`, `/v1/`, `/deprecated/`
> Também aplicado quando `.context/ARCHAEOLOGY.md` existe no projeto.

---

## Regra de Ouro: Entender Antes de Modificar

**NUNCA modificar código legado sem antes:**
1. Verificar se `.context/ARCHAEOLOGY.md` existe para o módulo → ler
2. Se não existe → executar `/archaeo` para mapear primeiro
3. Atualizar `.context/PROJECT-MEMORY.md` com o que foi descoberto

## Princípio de Menor Intervenção

- Fazer a menor mudança possível que resolve o problema
- Resistir ao impulso de "melhorar" código vizinho não relacionado à task
- Cada mudança não planejada é um risco — escopo creep mata projetos legados

## Antes de Qualquer Mudança

```
1. Ler .context/ARCHAEOLOGY.md do módulo (se existir)
2. Executar: Grep pelo nome da função/classe/variável em TODO o codebase
3. Mapear: quem chama? quem é chamado? o que muda se eu alterar?
4. Verificar: existe teste cobrindo o comportamento atual?
   - Se SIM → rodar antes de modificar (snapshot do comportamento)
   - Se NÃO → escrever teste do comportamento atual ANTES de modificar
```

## Durante a Modificação

- Não renomear sem buscar todas as ocorrências
- Não mudar assinatura de função sem atualizar todos os callers
- Não remover sem confirmar que nada mais usa (verificar imports, grep)
- Commits pequenos e focados — facilita rollback se quebrar

## Após a Modificação

- Rodar todos os testes existentes (não só os do módulo modificado)
- Se quebrou algo não relacionado → o código legado tinha dependência oculta → documentar em `.context/ARCHAEOLOGY.md`
- Atualizar `.context/PROJECT-MEMORY.md` com armadilhas encontradas

## Padrão de Documentação de Mudança

Ao modificar legado, adicionar comentário mínimo se o WHY não é óbvio:

```
// Legacy: [motivo pelo qual este código existe assim]
// Changed: [data] — [o que foi mudado e por quê]
```

## Quando Refatorar vs. Só Corrigir

| Situação | Abordagem |
|---|---|
| Bug pequeno em código estável | Corrigir cirurgicamente, não refatorar |
| Código que será modificado frequentemente | Refatorar com cobertura de testes |
| Código crítico sem testes | Escrever testes primeiro, depois refatorar |
| Código que ninguém usa | Confirmar com usuário antes de remover |
