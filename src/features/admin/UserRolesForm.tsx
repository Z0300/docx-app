import {useState} from 'react'
import {getErrorMessage} from '@/lib/api/errors'
import {useAdminRoles} from './queries'
import type {AdminUser} from './types'
import {useUpdateUserRoles} from "./mutations";

interface UserRolesFormProps {
    user: AdminUser
    /** True when the admin is editing their own account. */
    isSelf: boolean
    onDone: () => void
}

export function UserRolesForm({user, isSelf, onDone}: UserRolesFormProps) {
    const roles = useAdminRoles()
    const update = useUpdateUserRoles()
    const original = new Set(user.roles.map((r) => r.roleId))
    const [selected, setSelected] = useState<Set<number>>(() => new Set(original))

    const changed = selected.size !== original.size || [...selected].some((id) => !original.has(id))

    function toggle(roleId: number) {
        setSelected((prev) => {
            const next = new Set(prev)
            if (next.has(roleId)) next.delete(roleId)
            else next.add(roleId)
            return next
        })
    }

    return (
        <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
                e.preventDefault()
                update.mutateAsync({userId: user.userId, roleIds: [...selected]}).then(onDone).catch(() => undefined)
            }}
        >
            <p className="text-base-content/70 text-body-sm">
                {user.displayName} · @{user.userName}. Some role combinations aren&apos;t allowed — if a change is
                rejected you&apos;ll be told why,
                and nothing is saved.
            </p>

            {roles.isLoading ? (
                <div className="skeleton h-40 w-full"/>
            ) : roles.isError ? (
                <p role="alert" className="alert alert-error alert-soft text-sm">
                    {getErrorMessage(roles.error)}
                </p>
            ) : (
                <fieldset className="flex flex-col gap-2">
                    <legend className="sr-only">Roles</legend>
                    {roles.data?.map((role) => {
                        // The server refuses this too; disabling it just saves an admin from locking themselves out by mistake.
                        const lockedOn = isSelf && role.name.toLowerCase() === 'admin' && selected.has(role.roleId)
                        return (
                            <label
                                key={role.roleId}
                                className={`border-base-300 flex items-start gap-3 rounded-field border p-3 ${lockedOn ? 'opacity-70' : 'hover:bg-base-200/60 cursor-pointer'}`}
                            >
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-sm mt-0.5"
                                    checked={selected.has(role.roleId)}
                                    disabled={lockedOn}
                                    onChange={() => toggle(role.roleId)}
                                />
                                <span>
                  <span className="font-medium">{role.name}</span>
                                    {role.description && <span
                                        className="text-base-content/60 text-body-sm block">{role.description}</span>}
                                    {lockedOn && <span className="text-body-sm block">You can&apos;t remove your own Admin role.</span>}
                </span>
                            </label>
                        )
                    })}
                </fieldset>
            )}

            {update.isError && (
                <p role="alert" className="alert alert-error alert-soft text-sm">
                    {getErrorMessage(update.error)}
                </p>
            )}

            <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-surface" onClick={onDone}>
                    Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!changed || update.isPending}>
                    {update.isPending && <span className="loading loading-spinner loading-sm"/>}
                    Save changes
                </button>
            </div>
        </form>
    )
}