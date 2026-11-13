/** Compact radial loader, adapted from the supplied CSS reference. */
export function Loader({ label = "Loading" }: { label?: string }) {
  return <span className="loader" role="status" aria-label={label} />;
}
