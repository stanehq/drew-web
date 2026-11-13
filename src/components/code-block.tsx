export function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#030605]">
      {label && <p className="border-b border-line px-4 py-2 text-xs font-medium text-mute">{label}</p>}
      <pre className="overflow-x-auto p-4 font-mono text-[0.78rem] leading-relaxed text-soft">
        <code>{code.trim()}</code>
      </pre>
    </div>
  );
}
