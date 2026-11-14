import { Loader } from "@/components/loader";

export default function Loading() {
  return (
    <div
      className="page-loader fixed inset-0 z-[200] flex h-dvh w-screen items-center justify-center bg-black"
      aria-label="Loading page"
    >
      <div className="page-loader-mark">
        <Loader label="Loading page" />
      </div>
    </div>
  );
}
