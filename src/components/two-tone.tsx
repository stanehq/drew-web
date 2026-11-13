/**
 * Titles in Drew's logo colors: the first ~2/3 of the words in green, the
 * rest in white ("Drew in" green, "numbers" white). One-word titles are green.
 */
export function TwoTone({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 2) return <span className="text-brand">{text}</span>;
  const green = Math.min(words.length - 1, Math.max(1, Math.round(words.length * 0.35)));
  return (
    <>
      <span className="text-brand">{words.slice(0, green).join(" ")}</span> <span className="text-fg">{words.slice(green).join(" ")}</span>
    </>
  );
}
