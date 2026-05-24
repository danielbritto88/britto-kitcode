# Regras SQL / Banco de Dados

> Carregado automaticamente ao editar: `*.sql`, `*.prisma`, `*migration*`, `*schema*`

---

## Segurança (P0 — sem exceção)

- NUNCA usar string interpolation em queries → sempre usar prepared statements / parameterized queries
- NUNCA expor mensagens de erro de banco diretamente ao usuário
- SEMPRE validar e sanitizar inputs antes de qualquer query
- Verificar permissões no nível da aplicação, não confiar só no banco

## Migrations

- Toda migration DEVE ter rollback (`down` function ou equivalente)
- Testar migration em ambiente de staging antes de produção
- Migrations são irreversíveis em produção — revisar com cuidado
- Nunca dropar coluna sem período de deprecação (remover código que usa → deploy → remover coluna)
- NUNCA alterar tipo de coluna sem migration explícita

## Queries e Performance

- Verificar plano de execução (`EXPLAIN ANALYZE`) para queries em tabelas grandes
- Índices obrigatórios: foreign keys, colunas de busca frequente, colunas de JOIN
- Evitar `SELECT *` em produção — selecionar apenas colunas necessárias
- Queries N+1 são bugs — usar eager loading / joins
- Transactions para operações multi-tabela que devem ser atômicas

## Nomenclatura

- Tabelas: `snake_case`, plural (`users`, `order_items`)
- Colunas: `snake_case` (`created_at`, `user_id`)
- Foreign keys: `{tabela_referenciada}_id` (`user_id`, `order_id`)
- Índices: `idx_{tabela}_{coluna(s)}` (`idx_users_email`)
- Constraints: `chk_{tabela}_{regra}` (`chk_orders_status`)

## Antes de modificar schema

1. Verificar `.context/ARCHAEOLOGY.md` se existir para o módulo
2. Verificar todos os lugares que usam a tabela/coluna (`Grep` pelo nome)
3. Confirmar que a migration tem rollback testado
4. Atualizar tipos/interfaces do código após schema change
