import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../api";
import type { User, UpdateUserInput } from "../../schemas/user";

export function useUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => apiFetch<User>("/auth/me"),
    retry: false,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserInput) =>
      apiFetch<User>("/auth/me", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}
