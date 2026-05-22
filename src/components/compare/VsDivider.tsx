/**
 * Divisor central do comparador. Pure visual — onomatopeia FIGHT! + VS gigante.
 */
export default function VsDivider() {
  return (
    <div className="relative flex md:flex-col items-center justify-center md:gap-4 py-6 md:py-0 md:px-2">
      {/* Linha vertical no desktop */}
      <div
        className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-ink shadow-[2px_0_0_var(--akira-yellow)]"
        aria-hidden
      />

      {/* Linha horizontal no mobile */}
      <div
        className="block md:hidden absolute top-1/2 left-0 right-0 h-1 bg-ink shadow-[0_2px_0_var(--akira-yellow)]"
        aria-hidden
      />

      <div className="relative z-10 flex flex-col items-center gap-3">
        <span className="onomatopeia text-sm">FIGHT!</span>
        <div className="display text-7xl md:text-8xl text-akira-yellow glow-yellow leading-none">
          VS
        </div>
        <span className="jp text-akira-pink text-xs glow-pink">対決</span>
      </div>
    </div>
  );
}
