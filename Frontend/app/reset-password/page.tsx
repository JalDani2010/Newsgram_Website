import { Suspense } from "react";
import ResetPasswordClient from "./reset-password-client";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center p-6">Loading…</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
