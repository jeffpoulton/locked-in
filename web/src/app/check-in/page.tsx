"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Check-in page - DEPRECATED.
 *
 * This route now redirects to /dashboard.
 * All check-in functionality has been moved to the dashboard with modal-based interactions.
 */
export default function CheckInPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-gray-500 dark:text-gray-400">Redirecting...</div>
    </div>
  );
}
