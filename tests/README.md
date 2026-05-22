# Testes E2E — Akira Mangás

Suite Playwright que percorre o fluxo completo de compra da loja: home →
catálogo → detalhe → volume → carrinho → CEP → cupom → checkout (4 steps)
→ pagamento PIX → pedido confirmado → meus pedidos.

## Como rodar

```bash
npm run test:e2e           # headless (CI-friendly)
npm run test:e2e:headed    # ver o browser (debug visual)
npm run test:e2e:ui        # Playwright UI mode (debug interativo)
```

O `webServer` configurado no `playwright.config.ts` levanta automaticamente
`npm run build && npm start` antes dos testes. Primeira execução demora
~60s pelo build, runs subsequentes reaproveitam o server se já estiver
de pé.

## Arquivo

- `e2e/compra.spec.ts` — 1 teste narrativo cobrindo o happy path completo.

## Pré-requisitos

- Banco SQLite local (`prisma/dev.db`) já provisionado — o teste registra
  um usuário novo via `/api/auth/register` em cada execução.
- ViaCEP acessível (lookup do CEP `01310-000`).
- Acesso à internet pro Jikan (catálogo) e MangaDex (capas).
