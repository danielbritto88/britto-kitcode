# Regras de API / Backend

> Carregado automaticamente ao editar: `route.ts`, `controller.*`, `*.api.*`, `*router*`, `*endpoint*`, `*handler*`

---

## Segurança (P0)

- Validar TODOS os inputs no boundary da API — nunca confiar em dados do cliente
- Sanitizar outputs — nunca retornar dados internos, stack traces, ou IDs de infra
- Autenticação: verificar token/sessão em TODA rota protegida
- Autorização: verificar permissão do usuário APÓS autenticação (não confundir)
- Rate limiting em rotas sensíveis (login, reset password, criação de recurso)
- CORS: allowlist explícita, nunca `*` em produção

## Design de API

- RESTful: usar verbos HTTP corretos (GET lê, POST cria, PUT/PATCH atualiza, DELETE remove)
- Versionamento: `/api/v1/` — nunca quebrar contrato sem nova versão
- Nomenclatura: `kebab-case` para paths, `camelCase` para JSON body
- IDs: usar UUIDs ou IDs opacos em respostas públicas

## Respostas

```json
// Sucesso
{ "data": { ... }, "meta": { "page": 1, "total": 100 } }

// Erro
{ "error": { "code": "USER_NOT_FOUND", "message": "..." } }
```

- Nunca retornar `200 OK` para erros
- Status codes corretos: 200 (ok), 201 (created), 400 (bad request), 401 (unauth), 403 (forbidden), 404 (not found), 409 (conflict), 422 (validation), 500 (server error)
- Mensagens de erro genéricas para o cliente, detalhes no log do servidor

## Tratamento de Erro

- SEMPRE fazer log de erros inesperados com contexto (user id, request id, payload)
- NUNCA deixar promises sem `catch` ou `try/catch`
- Erros de validação: retornar lista de campos inválidos com mensagem legível

## Performance

- Paginação obrigatória em listas (`limit`/`offset` ou cursor-based)
- Cache em dados que mudam pouco (configurable por endpoint)
- Evitar N+1: usar eager loading/joins, não múltiplas queries em loop
- Timeout em chamadas externas (nunca esperar indefinidamente)

## Antes de Concluir Endpoint

- [ ] Validação de input implementada
- [ ] Auth/authz verificado
- [ ] Status codes corretos
- [ ] Tratamento de erro com log
- [ ] Paginação se retornar lista
- [ ] Teste de integração cobrindo happy path + erro
