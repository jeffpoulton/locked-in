"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadContract } from "@/lib/contract-storage";

/**
 * Home page - routes users based on contract state.
 *
 * Routing logic:
 * - If active contract exists: redirect to /check-in
 * - If no contract: redirect to /contract/new
 *
 * Note: This is a prototype using localStorage. Auth has been simplified
 * to focus on the core check-in experience.
 */
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check for active contract in localStorage
    const contract = loadContract();

    if (contract) {
      // Has active contract - go to check-in
      router.push("/check-in");
    } else {
      // No contract - go to contract creation
      router.push("/contract/new");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-500">Loading...</div>
    </div>
  );
}
