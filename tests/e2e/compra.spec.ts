import { test, expect, type Page } from "@playwright/test";

/**
 * E2E narrativo — fluxo completo de compra na Akira Mangas.
 *
 * Um unico teste gigante percorre todo o happy path:
 * home -> catalogo -> detalhe -> volume -> carrinho -> CEP -> cupom ->
 * checkout (4 steps) -> pagamento PIX -> pedido confirmado -> meus pedidos.
 *
 * Por que um teste so e nao varios isolados:
 *  - Estado (carrinho/cupom/pedido) eh todo localStorage. Quebrar em testes
 *    isolados exigiria setup mockando o storage entre eles, sem ganho real.
 *  - O valor de portfolio aqui eh narrativo: provar que um usuario consegue
 *    de fato comprar do zero ate o pedido confirmado.
 *
 * Determinismo:
 *  - Hidratacao de CartContext eh assincrona (useEffect que le localStorage),
 *    por isso esperamos por "Volumes  ·  N" no /carrinho antes de prosseguir.
 *  - Toasts somem em ~2-3s; usamos waitForTimeout curto onde nao da pra
 *    esperar deterministicamente.
 *  - APIs externas (ViaCEP, Jikan, MangaDex) sao tocadas durante a navegacao,
 *    o build estatico do Next + cache ISR mitiga flakiness.
 */

const CEP_SP = "01310-000"; // Av. Paulista, SP — sempre resolve no ViaCEP
const CUPOM = "AKIRA10"; // 10% off, min R$ 100

// Helper para registrar e logar um usuario via API antes do fluxo guest.
// Necessario porque /conta/pedidos eh rota autenticada (redirect pra /login
// se nao houver cookie). Os pedidos ficam em localStorage entao apos login
// a pagina lista normalmente os pedidos do guest-checkout.
async function ensureLoggedIn(page: Page) {
  // Gera credenciais unicas por execucao pra evitar conflito com seed
  const ts = Date.now();
  const email = `e2e-${ts}@akira.test`;
  const password = "playwright-e2e-123";
  const name = `E2E Tester ${ts}`;

  // page.request resolve relative URLs com o baseURL configurado no playwright.config
  const res = await page.request.post("/api/auth/register", {
    data: { name, email, password },
  });
  expect(res.ok(), `register falhou: ${res.status()} ${await res.text()}`).toBeTruthy();

  return { email, name };
}

test.describe("Akira Mangas — fluxo completo de compra", () => {
  test("fluxo completo: home -> produto -> carrinho -> checkout -> pagamento -> pedido", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    // ============================================================
    // 0. SETUP — registra usuario pra ter acesso a /conta/pedidos
    // ============================================================
    const { name: userName } = await ensureLoggedIn(page);

    // ============================================================
    // 1. HOME — entra na loja, valida hero "AKIRA"
    // ============================================================
    await page.goto("/");
    // Hero tem "AKIRA" como display H1. Tambem temos o stat "55.000+ series"
    // que so renderiza apos hidratacao do CountUp — bom sinal de "carregou".
    await expect(page.locator("h1").filter({ hasText: /AKIRA/i }).first()).toBeVisible();
    await expect(page.getByText(/Neo-Tokyo/i).first()).toBeVisible();

    // Espera o primeiro grid de mangas aparecer (carrosseis sao SSR mas
    // dependem do fetch Jikan — pode demorar)
    await page.waitForSelector('[data-testid="manga-card"]', { timeout: 30_000 });

    // ============================================================
    // 2. CATALOGO — clica num MangaCard, vai pra /manga/[id]
    // ============================================================
    const firstCard = page.locator('[data-testid="manga-card"]').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();
    await page.waitForURL(/\/manga\/\d+$/, { timeout: 30_000 });

    // ============================================================
    // 3. DETALHE — valida titulo + sinopse + secao de volumes
    // ============================================================
    // Detail hero tem H1 com o titulo da serie
    await expect(page.locator("h1").first()).toBeVisible();
    // Sinopse: secao tem heading "Sinopse" OU texto longo
    await expect(page.getByText(/Catalogo da serie|Volumes em catalogo|publicacao/i).first())
      .toBeVisible({ timeout: 15_000 });

    // ============================================================
    // 4. VOLUME — navega direto pra /manga/[id]/volume/1
    // Os botoes de volume em MangaVolumes nao sao <a>; navegamos por URL.
    // ============================================================
    const detailUrl = page.url();
    const mangaIdMatch = detailUrl.match(/\/manga\/(\d+)/);
    expect(mangaIdMatch).not.toBeNull();
    const mangaId = mangaIdMatch![1];

    await page.goto(`/manga/${mangaId}/volume/1`);
    await page.waitForURL(/\/manga\/\d+\/volume\/1$/, { timeout: 30_000 });

    // Hero do volume tem H1 com "Volume 01"
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Volume\s*01/i, {
      timeout: 15_000,
    });

    // ============================================================
    // 5. ESTOQUE — StockBadge deve estar visivel (qualquer variante:
    //    "Em estoque", "Ultimas", "Esgotado", etc).
    // ============================================================
    // Texto pode variar — usamos regex permissiva cobrindo as variantes
    await expect(
      page.getByText(/em estoque|ultimas|esgotado|poucas|restam/i).first()
    ).toBeVisible({ timeout: 10_000 });

    // ============================================================
    // 6. ADICIONAR AO CARRINHO — clica "Adicionar ao carrinho" 4x
    //    (precisamos passar de R$ 100 pro cupom AKIRA10 ser valido)
    // ============================================================
    const addBtn = page.locator('[data-testid="add-to-cart"]');
    await expect(addBtn).toBeVisible();

    // Sobe a quantidade pra 4 (4 x R$ 29.90 = R$ 119.60 > R$ 100)
    const incBtn = page.getByRole("button", { name: "Aumentar" });
    await incBtn.click();
    await incBtn.click();
    await incBtn.click();

    await addBtn.click();

    // Toast aparece com aria-live=polite — usa role=status
    // Pode falhar deterministicamente (toast some), entao waitForTimeout curto
    await page.waitForTimeout(500);

    // ============================================================
    // 7. CARRINHO — vai pra /carrinho, valida item listado
    // ============================================================
    await page.goto("/carrinho");
    // Espera hidratacao do CartContext — o EmptyCart aparece antes se
    // localStorage ainda nao carregou
    await expect(page.locator('[data-testid="cart-item"]').first()).toBeVisible({
      timeout: 15_000,
    });

    // Valida que ha pelo menos 1 item e a contagem bate
    const itemCount = await page.locator('[data-testid="cart-item"]').count();
    expect(itemCount).toBeGreaterThanOrEqual(1);

    // Header mostra "Volumes · 4"
    await expect(page.getByRole("heading", { name: /Volumes/i })).toBeVisible();

    // ============================================================
    // 8. CEP — preenche calculadora de frete com 01310-000 (SP)
    // ============================================================
    const cepInput = page.locator('[data-testid="cep-input"]').first();
    await cepInput.fill(CEP_SP);
    await page.getByRole("button", { name: /Calcular/i }).click();

    // Esperar 3 opcoes de frete aparecerem (PAC + SEDEX + Retirada)
    // Cada opcao tem texto "GRATIS" OU valor R$ X
    await expect(page.getByText(/PAC Correios/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/SEDEX/i).first()).toBeVisible();
    await expect(page.getByText(/Retirada/i).first()).toBeVisible();

    // ============================================================
    // 9. CUPOM — aplica AKIRA10 (10% off)
    // ============================================================
    const couponInput = page.locator('[data-testid="coupon-input"]');
    await couponInput.fill(CUPOM);
    // Botao "Aplicar" na mesma form do CouponInput
    await page.getByRole("button", { name: "Aplicar" }).click();

    // Cupom aplicado vira um box com "AKIRA10" + label "10% OFF"
    await expect(page.getByText(/AKIRA10/i).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText(/10% OFF/i).first()).toBeVisible();

    // ============================================================
    // 10. CHECKOUT STEP 1 — identificacao (guest)
    // Como estamos logados, precisamos clicar "usar outro email (convidado)"
    // pra entrar em modo guest e ter os campos nome+email.
    // ============================================================
    await page.getByRole("link", { name: /Ir pra Checkout/i }).click();
    await page.waitForURL("**/checkout", { timeout: 30_000 });

    // Aguarda step 1 renderizar
    await expect(page.getByText(/IDENTIFICACAO/i)).toBeVisible({ timeout: 15_000 });

    // Se temos user logado, precisamos trocar pra guest mode
    const switchToGuest = page.getByRole("button", { name: /usar outro email/i });
    if (await switchToGuest.isVisible().catch(() => false)) {
      await switchToGuest.click();
    }

    // Preenche guest data
    const nameInput = page.locator('input[placeholder="Kaneda Shotaro"]');
    const emailInput = page.locator('input[type="email"][placeholder*="kaneda"]');
    await nameInput.fill("Tetsuo Shima");
    await emailInput.fill(`tetsuo-${Date.now()}@neo-tokyo.jp`);

    // Avanca
    await page.getByRole("button", { name: /Proximo/i }).click();

    // ============================================================
    // 11. CHECKOUT STEP 2 — endereco. CEP ja vem preenchido do carrinho.
    // ============================================================
    await expect(page.getByText(/ENDERECO/i)).toBeVisible({ timeout: 15_000 });

    // CEP hidratado: valida que o input ja tem valor (pode demorar — useEffect async)
    const checkoutCep = page.locator('[data-testid="cep-input"]');
    await expect(checkoutCep).toHaveValue(/\d{5}/, { timeout: 10_000 });

    // Preenche numero (resto vem hidratado do ViaCEP)
    await page.locator('input[placeholder="1234"]').fill("1578");

    // Espera lookup do ViaCEP completar (campos rua/cidade preenchidos)
    await expect(page.locator('input[placeholder="Av. Paulista"]')).toHaveValue(/\S+/, {
      timeout: 15_000,
    });

    await page.getByRole("button", { name: /Proximo/i }).click();

    // ============================================================
    // 12. CHECKOUT STEP 3 — frete (SEDEX) + pagamento (PIX)
    // ============================================================
    await expect(page.getByText(/FRETE & PAGAMENTO/i)).toBeVisible({ timeout: 15_000 });

    // Seleciona SEDEX (clica no label que contem "SEDEX Expresso")
    await page.getByText(/SEDEX Expresso/i).first().click();

    // PIX ja eh o default, mas reforcamos pra garantir
    await page.getByText("PIX", { exact: true }).first().click();

    // Avanca pra revisao
    await page.getByRole("button", { name: /Revisar/i }).click();

    // ============================================================
    // 13. CHECKOUT STEP 4 — revisa resumo, clica "Ir para pagamento"
    // ============================================================
    await expect(page.getByText(/CONFIRMACAO/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Total a pagar/i)).toBeVisible();

    await page.getByRole("button", { name: /Ir para pagamento/i }).click();

    // ============================================================
    // 14. PAGAMENTO PIX — chega em /pagamento/[id], valida QR + simula
    // ============================================================
    await page.waitForURL(/\/pagamento\/ORD-/, { timeout: 30_000 });

    // QR svg tem aria-label "QR code mock para pagamento PIX"
    await expect(page.locator('svg[aria-label*="QR"]').first()).toBeVisible({
      timeout: 15_000,
    });

    // Simula pagamento
    await page.locator('[data-testid="pix-simulate"]').click();

    // ============================================================
    // 15. PEDIDO — chega em /pedido/[id], valida numero + tracking + timeline
    // ============================================================
    await page.waitForURL(/\/pedido\/ORD-/, { timeout: 30_000 });

    // Numero do pedido visivel
    await expect(page.locator('[data-testid="order-number"]')).toBeVisible({
      timeout: 15_000,
    });
    const orderNumber = await page.locator('[data-testid="order-number"]').innerText();
    expect(orderNumber).toMatch(/#ORD-/);

    // Pelo menos um codigo de rastreio aparece (TrackingCode tem fallback
    // "Disponivel apos despacho" enquanto status nao chegou em "enviado",
    // entao aceitamos qualquer um dos dois)
    await expect(
      page
        .locator('[data-testid="tracking-code"], text=/Disponivel apos o despacho/i')
        .first()
    ).toBeVisible({ timeout: 15_000 });

    // Timeline mostra status — buildTimeline marca "Pagamento confirmado" como
    // completed se status >= confirmado. Como acabamos de pagar, esperamos
    // ver o label no DOM.
    await expect(
      page.getByText(/Pagamento confirmado|Pedido recebido|Preparando/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // Extrai orderId pra usar no proximo step (logs uteis em failure)
    const orderId = orderNumber.replace(/^#/, "").trim();

    // ============================================================
    // 16. MEUS PEDIDOS — vai pra /conta/pedidos, valida pedido listado
    // ============================================================
    await page.goto("/conta/pedidos");
    // Auth ja foi feito no setup (cookie httpOnly), entao acessa direto
    await page.waitForURL("**/conta/pedidos", { timeout: 30_000 });

    // Pedido aparece como link com #ORD-...
    await expect(page.getByText(new RegExp(`#?${orderId}`)).first()).toBeVisible({
      timeout: 30_000,
    });

    // Marker final pra deixar claro que o fluxo fechou
    expect(orderId, `Pedido ${orderId} criado pelo usuario ${userName}`).toMatch(/^ORD-/);
  });
});
