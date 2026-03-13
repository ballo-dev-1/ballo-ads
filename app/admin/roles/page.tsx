'use client'

import { useEffect, useState } from 'react'
import { adminApi, type BackofficeRoleResponse } from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import toast from 'react-hot-toast'
import { Pencil } from 'lucide-react'
import AdminHero from '@/app/admin/components/AdminHero'
import { useConfirmDialog } from '@/app/admin/components/useConfirmDialog'

export default function RolesPage() {
  const { env } = useApiEnv()
  const [roles, setRoles] = useState<BackofficeRoleResponse[]>([])
  const [permissions, setPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createPerms, setCreatePerms] = useState<string[]>([])
  const [createLoading, setCreateLoading] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editPerms, setEditPerms] = useState<string[]>([])
  const [editLoading, setEditLoading] = useState(false)
  const { confirm, confirmDialog } = useConfirmDialog()

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [rolesData, permsData] = await Promise.all([
        adminApi.getRoles(),
        adminApi.getPermissions(),
      ])
      setRoles(rolesData)
      setPermissions(permsData)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [env])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createName.trim()) return
    setCreateLoading(true)
    setError('')
    try {
      await adminApi.createRole({ name: createName.trim(), permissions: createPerms })
      toast.success('Role created')
      setCreateOpen(false)
      setCreateName('')
      setCreatePerms([])
      load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create role')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleSetPermissions = async (id: number) => {
    const approved = await confirm({
      title: 'Apply permission changes',
      description: 'Apply these permission changes to this role?',
      confirmLabel: 'Apply',
    })
    if (!approved) return
    setEditLoading(true)
    setError('')
    try {
      await adminApi.setRolePermissions(id, editPerms)
      toast.success('Permissions updated')
      setEditId(null)
      setEditPerms([])
      load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update permissions')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async (id: number, name: string) => {
    const approved = await confirm({
      title: 'Delete role',
      description: `Delete role "${name}"?`,
      confirmLabel: 'Delete',
      tone: 'danger',
    })
    if (!approved) return
    try {
      await adminApi.deleteRole(id)
      toast.success('Role deleted')
      load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete')
    }
  }

  const togglePerm = (list: string[], setList: (v: string[]) => void, perm: string) => {
    if (list.includes(perm)) setList(list.filter((p) => p !== perm))
    else setList([...list, perm])
  }

  const startEditPermissions = (role: BackofficeRoleResponse) => {
    setEditId(role.id)
    setEditPerms(role.permissions ?? [])
  }

  const closeEditModal = () => {
    if (editLoading) return
    setEditId(null)
    setEditPerms([])
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <AdminHero
          className="mb-6"
          eyebrow="Permissions"
          title="Roles"
          description="Manage backoffice roles and permission sets."
          variant="violet"
          actions={
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="rounded-full bg-[#0f1222] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-black"
            >
              Create role
            </button>
          }
        />

        {error && (
          <div className="mb-4 rounded-xl bg-red-50/90 border border-red-200 text-red-700 px-5 py-4">
            {error}
          </div>
        )}

        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create role</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="e.g. Support"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                    {permissions.map((p) => (
                      <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={createPerms.includes(p)}
                          onChange={() => togglePerm(createPerms, setCreatePerms, p)}
                        />
                        <span className="text-gray-700">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setCreateOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-4 py-2 rounded-lg bg-[#0e0e39] text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {createLoading ? 'Creating…' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit permissions</h2>
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                {permissions.map((p) => (
                  <label key={p} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPerms.includes(p)}
                      onChange={() => togglePerm(editPerms, setEditPerms, p)}
                      disabled={editLoading}
                    />
                    <span className="text-gray-700">{p}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={editLoading}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPermissions(editId)}
                  disabled={editLoading}
                  className="px-4 py-2 rounded-lg bg-[#0e0e39] text-white hover:opacity-90 disabled:opacity-50"
                >
                  {editLoading ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[var(--brand-color-2)]" />
          </div>
        ) : (
          <div className="bg-transparent rounded-xl border border-gray-200/80 shadow-sm overflow-hidden p-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Permissions</th>
                  <th className="w-24 py-3 px-5 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-gray-500">
                      No roles yet. Create one above.
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role.id} className="border-b border-gray-100">
                      <td className="py-3 px-5 font-medium text-gray-900">{role.name}</td>
                      <td className="py-3 px-5 text-sm text-gray-600">
                        <span className="text-gray-600">
                          {role.permissions?.length ?? 0} permission(s)
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => startEditPermissions(role)}
                            className="p-1.5 rounded text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                            aria-label="Edit permissions"
                            title="Edit permissions"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {role.name !== 'SuperAdmin' && (
                            <button
                              type="button"
                              onClick={() => handleDelete(role.id, role.name)}
                              className="text-sm text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {confirmDialog}
      </div>
    </div>
  )
}
