---
priority: P0
updated: 2026-05-24
version: 2.0
---

# CORE-SCRIPTS.md — Scripts de Verificação

> Carregado sob demanda: apenas em VERIFICATION phase e pre-deploy.
> Não carregar para development ou planning.

---

## Comando Único (Recomendado)

```bash
# Roda TODOS os checks em ordem de prioridade:
python .agent/scripts/verify_all.py . --url http://localhost:3000

# Ordem de execução:
# P0: Security Scan (vulnerabilidades, secrets)
# P1: Color Contrast (WCAG AA acessibilidade)
# P1.5: UX Audit (Leis de psicologia, Fitts, Hick, Trust)
# P2: Touch Target (acessibilidade mobile)
# P3: Lighthouse Audit (performance, SEO)
# P4: Playwright Tests (E2E)
```

---

## Scripts Individuais

| Script | Skill | Trigger | Comando |
|---|---|---|---|
| `security_scan.py` | vulnerability-scanner | Sempre no deploy | `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .` |
| `dependency_analyzer.py` | vulnerability-scanner | Semanal / deploy | `python .agent/skills/vulnerability-scanner/scripts/dependency_analyzer.py .` |
| `lint_runner.py` | lint-and-validate | Toda mudança de código | `python .agent/skills/lint-and-validate/scripts/lint_runner.py .` |
| `test_runner.py` | testing-patterns | Após mudança de lógica | `python .agent/skills/testing-patterns/scripts/test_runner.py .` |
| `schema_validator.py` | database-design | Após mudança de DB | `python .agent/skills/database-design/scripts/schema_validator.py .` |
| `ux_audit.py` | frontend-design | Após mudança de UI | `python .agent/skills/frontend-design/scripts/ux_audit.py .` |
| `accessibility_checker.py` | frontend-design | Após mudança de UI | `python .agent/skills/frontend-design/scripts/accessibility_checker.py .` |
| `seo_checker.py` | seo-fundamentals | Após mudança de página | `python .agent/skills/seo-fundamentals/scripts/seo_checker.py .` |
| `bundle_analyzer.py` | performance-profiling | Antes do deploy | `python .agent/skills/performance-profiling/scripts/bundle_analyzer.py .` |
| `mobile_audit.py` | mobile-design | Após mudança mobile | `python .agent/skills/mobile-design/scripts/mobile_audit.py .` |
| `lighthouse_audit.py` | performance-profiling | Antes do deploy | `python .agent/skills/performance-profiling/scripts/lighthouse_audit.py http://localhost:3000` |
| `playwright_runner.py` | webapp-testing | Antes do deploy | `python .agent/skills/webapp-testing/scripts/playwright_runner.py http://localhost:3000 --screenshot` |
| `geo_checker.py` | geo-fundamentals | Após mudança de conteúdo | `python .agent/skills/geo-fundamentals/scripts/geo_checker.py .` |
| `i18n_checker.py` | i18n-localization | Após mudança de strings | `python .agent/skills/i18n-localization/scripts/i18n_checker.py .` |
| `type_coverage.py` | lint-and-validate | Antes do deploy | `python .agent/skills/lint-and-validate/scripts/type_coverage.py .` |
| `mobile_audit.py` | mobile-design | Após mudança mobile | `python .agent/skills/mobile-design/scripts/mobile_audit.py .` |
| `ux_audit.py` | frontend-design | Após mudança de UI | `python .agent/skills/frontend-design/scripts/ux_audit.py .` |

---

## Checklist de Desenvolvimento (Pré-commit)

```bash
# P0: Lint & Type Check
npm run lint && npx tsc --noEmit

# P0: Security Scan
python .agent/skills/vulnerability-scanner/scripts/security_scan.py .

# P1: UX Audit (se houve mudança de UI)
python .agent/skills/frontend-design/scripts/ux_audit.py .

# P1: Schema Validator (se houve mudança de banco)
python .agent/skills/database-design/scripts/schema_validator.py .

# P2: Tests
npm run test
```

---

## Checklist de Pre-Deploy (Completo)

```bash
# Rodar tudo de uma vez:
python .agent/scripts/verify_all.py . --url http://localhost:3000

# Ou individualmente na ordem correta:
# 1. Security
python .agent/skills/vulnerability-scanner/scripts/security_scan.py .
python .agent/skills/vulnerability-scanner/scripts/dependency_analyzer.py .

# 2. Quality
npm run lint && npx tsc --noEmit
python .agent/skills/lint-and-validate/scripts/type_coverage.py .

# 3. Tests
npm run test
python .agent/skills/webapp-testing/scripts/playwright_runner.py http://localhost:3000

# 4. UI/UX (se aplicável)
python .agent/skills/frontend-design/scripts/ux_audit.py .
python .agent/skills/frontend-design/scripts/accessibility_checker.py .

# 5. Performance
python .agent/skills/performance-profiling/scripts/lighthouse_audit.py http://localhost:3000
python .agent/skills/performance-profiling/scripts/bundle_analyzer.py .

# 6. Build
npm run build
```

---

## Checklist Manual (Phase X)

- [ ] Sem codes roxo/violeta (Purple Ban)
- [ ] Sem layouts de template padrão
- [ ] Socratic Gate foi respeitado
- [ ] Writer/Reviewer session realizada
- [ ] Todos os critérios de aceitação da spec marcados

---

## Script Master: checklist.py

```bash
# Roda checks de desenvolvimento em ordem de prioridade:
python .agent/scripts/checklist.py .

# Inclui: Security · Lint · Schema · Tests · UX · SEO
# NÃO inclui: Lighthouse, Playwright, Bundle (usar verify_all.py)
```
