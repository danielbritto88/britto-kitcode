---
feature: [nome da feature]
status: draft | approved | implemented
created: [data]
updated: [data]
---

# SPEC: [Nome da Feature]

> Spec-Driven Development (SDD) — este documento descreve O QUE o sistema faz.
> O plan file (`{slug}.md`) descreve COMO implementar.
> **Quando o requisito mudar, editar esta spec — não o código diretamente.**

---

## Objetivo

[Uma frase: o que este recurso faz e para quem]

**Problema que resolve:** [problema atual sem este recurso]
**Valor entregue:** [benefício concreto após implementação]

---

## Comportamento Esperado

### Inputs

| Input | Tipo | Obrigatório | Validação |
|---|---|---|---|
| | | | |

### Outputs

| Output | Tipo | Condição |
|---|---|---|
| Sucesso | | |
| Erro | | |

### Fluxo Principal (Happy Path)

```
1. [passo 1]
2. [passo 2]
3. [passo 3]
→ Resultado: [estado final esperado]
```

---

## Casos de Borda

| Cenário | Comportamento esperado |
|---|---|
| Input vazio/nulo | |
| Valor fora do range | |
| Usuário sem permissão | |
| Timeout / falha externa | |
| Dados duplicados | |

---

## Precondições

- [o que deve existir/estar configurado antes de usar]
- [permissões necessárias]
- [dependências]

---

## Pós-condições

- [estado do sistema após execução com sucesso]
- [efeitos colaterais esperados]
- [o que NÃO deve mudar]

---

## Invariantes

> Condições que devem ser SEMPRE verdadeiras, independente do caminho:

- [ex: O saldo nunca pode ficar negativo]
- [ex: O ID de usuário sempre deve existir no banco antes de associar]

---

## Fora do Escopo

> O que esta feature explicitamente NÃO faz:

- [item fora do escopo]
- [item fora do escopo]

---

## Critérios de Aceitação

- [ ] [critério verificável 1]
- [ ] [critério verificável 2]
- [ ] [critério verificável 3]

---

## Aprovação

- [ ] Spec revisada pelo usuário
- [ ] Plan file gerado a partir desta spec
- [ ] Implementação validada contra esta spec (Writer/Reviewer)
