/**
 * Keep a visible page shell while a dynamic route is being rendered.
 * The root layout (including navigation) remains mounted above this fallback.
 */
export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-label="Loading page"
      className="relative isolate min-h-[calc(100dvh-76px)] overflow-hidden pt-[76px]"
    >
      <div className="mx-auto max-w-6xl px-5 pb-28 pt-16 sm:pt-20">
        <div role="status" className="sr-only">Loading page</div>

        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
          <div className="h-3 w-28 animate-pulse rounded-full bg-brand/15" />
          <div className="h-10 w-[min(34rem,88vw)] animate-pulse rounded-lg bg-white/[0.07] sm:h-14" />
          <div className="h-3 w-[min(28rem,78vw)] animate-pulse rounded-full bg-white/[0.05]" />
          <div className="h-3 w-[min(20rem,62vw)] animate-pulse rounded-full bg-white/[0.05]" />
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="surface min-h-36 animate-pulse p-5 sm:min-h-44 sm:p-6"
            >
              <div className="h-4 w-1/3 rounded-full bg-white/[0.07]" />
              <div className="mt-6 h-3 w-full rounded-full bg-white/[0.05]" />
              <div className="mt-3 h-3 w-4/5 rounded-full bg-white/[0.05]" />
              <div className="mt-8 h-3 w-1/2 rounded-full bg-white/[0.05]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
