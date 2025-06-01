"use client";
import { ReactNode, useLayoutEffect } from "react";

export default function ClientBodyFix({ children }: { children: ReactNode }) {
  // Remove any unexpected classes before React paints/hydrates
  useLayoutEffect(() => {
    document.body.classList.remove("vsc-initialized");
  }, []);

  return <>{children}</>;
}
