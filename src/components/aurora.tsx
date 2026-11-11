export function Aurora({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <div className="animate-aurora absolute left-1/2 top-[-20%] h-[640px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(65_207_139/0.28),transparent)] blur-3xl" />
      <div className="absolute left-[10%] top-[30%] h-[360px] w-[420px] rounded-full bg-[radial-gradient(closest-side,rgb(31_122_82/0.35),transparent)] blur-3xl" />
    </div>
  );
}
