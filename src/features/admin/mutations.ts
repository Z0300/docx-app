import {useMutation, useQueryClient} from "@tanstack/react-query";
import {adminUsersApi} from "@/features/admin/api.ts";
import {adminKeys} from "@/features/admin/queries.ts";

export function useUpdateUserRoles() {
  const queryClient = useQueryClient  ()
  return useMutation({
    mutationFn: ({ userId, roleIds }: { userId: number; roleIds: number[] }) => adminUsersApi.updateRoles(userId, roleIds),
    // The dialog shows the server's reason inline, so skip the global error toast.
    meta: { silent: true, successMessage: 'Roles updated' },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.all }),
  })
}