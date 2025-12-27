"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "./queryClient";
import { Toast } from "@/components/ui/Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toast />
    </QueryClientProvider>
  );
}
