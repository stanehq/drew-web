/**
 * Drew's primary heading treatment: green-to-white brand gradient followed by white.
 */
export function TwoTone({ text, greenWords }: { text: string; greenWords?: number }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return <span className="drew-title-green">{text}</span>;
  const green = Math.min(words.length - 1, Math.max(1, greenWords ?? Math.round(words.length * 0.35)));
  return (
    <>
      <span className="drew-title-green">{words.slice(0, green).join(" ")}</span>{" "}
      <span className="text-white">{words.slice(green).join(" ")}</span>
    </>
  );
}
