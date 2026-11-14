"use client";

import { useEffect } from "react";
import { Loader } from "@/components/loader";

export default function Loading() {
  useEffect(() => {
    window.dispatchEvent(new Event("drew:route-loading-start"));
    return () => window.dispatchEvent(new Event("drew:route-loading-end"));
  }, []);

  return (
    <div className="page-loader fixed inset-0 z-[200] flex h-dvh w-screen items-center justify-center bg-black" aria-label="Loading page">
      <div className="page-loader-mark">
        <Loader label="Loading page" />
      </div>
    </div>
  );
}
