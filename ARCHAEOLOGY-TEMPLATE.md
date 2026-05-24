---
module: [nome do módulo / path]
mapped_by: code-archaeologist
date: [data do mapeamento]
risk: low | medium | high | critical
---

# ARCHAEOLOGY: [Nome do Módulo]

> Mapeamento gerado pelo `/archaeo` antes de qualquer modificação.
> Não modificar manualmente — atualizar executando `/archaeo` novamente.
> Ler ANTES de editar qualquer arquivo deste módulo.

---

## Localização

```
[path/do/modulo/]
├── [arquivo1.ext] — [descrição em 1 linha]
├── [arquivo2.ext] — [descrição em 1 linha]
└── [subpasta/]
    └── [arquivo3.ext] — [descrição em 1 linha]
```

---

## Pontos de Entrada

| Função / Endpoint / Classe | Arquivo | Linha | Chamado por |
|---|---|---|---|
| | | | |

---

## Pontos de Saída

| Output | Tipo | Destino |
|---|---|---|
| Return values | | |
| Side effects | | |
| Events emitted | | |
| DB writes | | |

---

## Mapa de Dependências

```
[módulo] depende de:
├── [dependência interna: path]
├── [dependência interna: path]
└── [dependência externa: package]

[módulo] é usado por:
├── [arquivo que importa]
└── [arquivo que importa]
```

---

## Efeitos Colaterais Conhecidos

| Ação | Efeito colateral | Arquivos afetados |
|---|---|---|
| | | |

---

## Armadilhas e Comportamentos Inesperados

| Armadilha | Condição que dispara | Impacto | Como evitar |
|---|---|---|---|
| | | | |

---

## Estado da Qualidade

| Aspecto | Status | Notas |
|---|---|---|
| Cobertura de testes | ❌ / ⚠️ / ✅ | |
| Documentação interna | ❌ / ⚠️ / ✅ | |
| Tipagem / contratos | ❌ / ⚠️ / ✅ | |
| Tratamento de erro | ❌ / ⚠️ / ✅ | |
| Performance conhecida | ❌ / ⚠️ / ✅ | |

---

## TODOs e Débito Técnico Visível

| Tipo | Localização | Descrição | Impacto |
|---|---|---|---|
| TODO | | | |
| FIXME | | | |
| Hack | | | |

---

## Avaliação de Risco

**Classificação:** `low` | `medium` | `high` | `critical`

**Justificativa:** [por que este nível de risco]

### Safe to Change (modificar sem medo):
- [arquivo/função/bloco]

### Fragile (modificar com cuidado extremo):
- [arquivo/função/bloco] — motivo: [por quê é frágil]

### Do Not Touch (não modificar sem entender completamente):
- [arquivo/função/bloco] — motivo: [risco específico]

---

## Recomendação para Modificação

> Como abordar mudanças neste módulo:

1. [passo de segurança 1]
2. [passo de segurança 2]
3. [como testar que não quebrou nada]

**Rollback se quebrar:** [como reverter]
