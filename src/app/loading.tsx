import { Loader } from "@/components/loader";

// While a page's server data loads during navigation, cover the whole screen.
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black">
      <Loader />
    </div>
  );
}
