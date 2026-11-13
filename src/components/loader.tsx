/** Six blinking squares in Drew green and white (after a Uiverse.io loader by cosnametv). */
export function Loader({ size = 56, label = "Loading" }: { size?: number; label?: string }) {
  return (
    <span className="loader" style={{ ["--size" as string]: `${size}px` }} role="status" aria-label={label}>
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} />
      ))}
    </span>
  );
}
