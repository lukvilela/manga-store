// Sequencia Konami canonica: ↑ ↑ ↓ ↓ ← → ← → B A
// Usamos KeyboardEvent.code pra evitar problemas de layout/maiusculas.

export const KONAMI_SEQUENCE: string[] = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  "KeyA",
];

const SAIYAN_KEY = "saiyan-mode";
const SAIYAN_CLASS = "saiyan-mode";
const SAIYAN_EVENT = "saiyan:toggle";

export function isSaiyanActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SAIYAN_KEY) === "true";
  } catch {
    return false;
  }
}

export function setSaiyanActive(active: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SAIYAN_KEY, active ? "true" : "false");
  } catch {
    // ignore
  }
  applySaiyanDom(active);
  window.dispatchEvent(new CustomEvent(SAIYAN_EVENT, { detail: { active } }));
}

export function toggleSaiyan(): boolean {
  const next = !isSaiyanActive();
  setSaiyanActive(next);
  return next;
}

export function applySaiyanDom(active: boolean): void {
  if (typeof document === "undefined") return;
  document.body.classList.toggle(SAIYAN_CLASS, active);
}

/**
 * Cria um detector reutilizavel da sequencia Konami.
 * - matchSequence(eventCode) retorna true quando a sequencia esta completa
 * - reset() limpa o buffer
 *
 * Mantemos buffer rolante: se o usuario errar uma tecla, o buffer
 * mantem o sufixo que ainda pode iniciar uma nova sequencia.
 */
export function createKonamiDetector(sequence: string[] = KONAMI_SEQUENCE) {
  let buffer: string[] = [];

  function reset() {
    buffer = [];
  }

  function matchSequence(code: string): boolean {
    buffer.push(code);
    // Trunca buffer no tamanho da sequencia (rolling window)
    if (buffer.length > sequence.length) {
      buffer = buffer.slice(-sequence.length);
    }
    if (buffer.length < sequence.length) return false;
    for (let i = 0; i < sequence.length; i++) {
      if (buffer[i] !== sequence[i]) return false;
    }
    // Match — reseta pra permitir re-trigger
    buffer = [];
    return true;
  }

  return { matchSequence, reset };
}

export { SAIYAN_EVENT, SAIYAN_KEY, SAIYAN_CLASS };
