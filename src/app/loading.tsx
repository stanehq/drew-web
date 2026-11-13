import { Loader } from "@/components/loader";

// Shown while a page's server data loads during navigation.
export default function Loading() {
  return (
    <div className="flex min-h-[70dvh] items-center justify-center pt-[76px]">
      <Loader />
    </div>
  );
}
