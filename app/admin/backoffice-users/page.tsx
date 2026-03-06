'use client'

import { useEffect, useState } from 'react'
import { adminApi, type BackofficeUserResponse, type BackofficeRoleResponse } from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import toast from 'react-hot-toast'

export default function BackofficeUsersPage() {
  const { env } = useApiEnv()
  const [users, setUsers] = useState<BackofficeUserResponse[]>([])
  const [roles, setRoles] = useState<BackofficeRoleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createFirstName, setCreateFirstName] = useState('')
  const [createLastName, setCreateLastName] = useState('')
  const [createRoles, setCreateRoles] = useState<string[]>([])
  const [createLoading, setCreateLoading] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [editRoles, setEditRoles] = useState<string[]>([])
  const [editLoading, setEditLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [usersData, rolesData] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getRoles(),
      ])
      setUsers(usersData)
      setRoles(rolesData)
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
    if (!createEmail.trim() || !createPassword) return
    setCreateLoading(true)
    setError('')
    try {
      await adminApi.createUser({
        email: createEmail.trim(),
        password: createPassword,
        firstName: createFirstName.trim() || 'Backoffice',
        lastName: createLastName.trim() || 'User',
        roles: createRoles,
      })
      toast.success('User created')
      setCreateOpen(false)
      setCreateEmail('')
      setCreatePassword('')
      setCreateFirstName('')
      setCreateLastName('')
      setCreateRoles([])
      load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create user')
    } finally {
      setCreateLoading(false)
    }
  }

  const handleSetRoles = async (id: number) => {
    setEditLoading(true)
    setError('')
    try {
      await adminApi.setUserRoles(id, editRoles)
      toast.success('Roles updated')
      setEditId(null)
      load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update roles')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async (id: number, email: string) => {
    if (!confirm(`Remove backoffice user "${email}"?`)) return
    try {
      await adminApi.deleteUser(id)
      toast.success('User removed')
      load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete')
    }
  }

  const toggleRole = (
    list: string[],
    setList: (v: string[]) => void,
    roleName: string
  ) => {
    if (list.includes(roleName)) setList(list.filter((r) => r !== roleName))
    else setList([...list, roleName])
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <header className="rounded-xl p-5 bg-[whitesmoke] border border-gray-200/80 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Backoffice users</h1>
            <p className="text-sm text-gray-500 mt-1">Manage backoffice login accounts and roles</p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="px-4 py-2 rounded-lg bg-[#0e0e39] text-white text-sm font-medium hover:opacity-90"
          >
            Create user
          </button>
        </header>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50/90 border border-red-200 text-red-700 px-5 py-4">
            {error}
          </div>
        )}

        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create backoffice user</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={createEmail}
                    onChange={(e) => setCreateEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={createPassword}
                    onChange={(e) => setCreatePassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
                    <input
                      type="text"
                      value={createFirstName}
                      onChange={(e) => setCreateFirstName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                    <input
                      type="text"
                      value={createLastName}
                      onChange={(e) => setCreateLastName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Roles</label>
                  <div className="space-y-1">
                    {roles.map((r) => (
                      <label key={r.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          checked={createRoles.includes(r.name)}
                          onChange={() => toggleRole(createRoles, setCreateRoles, r.name)}
                        />
                        <span className="text-gray-700">{r.name}</span>
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

        {loading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 border-t-[var(--brand-color-2)]" />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Roles</th>
                  <th className="w-24 py-3 px-5 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-12 text-gray-500">
                      No backoffice users yet.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100">
                      <td className="py-3 px-5 font-medium text-gray-900">{user.email ?? '—'}</td>
                      <td className="py-3 px-5 text-sm text-gray-600">
                        {editId === user.id ? (
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                              {roles.map((r) => (
                                <label key={r.id} className="inline-flex items-center gap-1 text-sm">
                                  <input
                                    type="checkbox"
                                    checked={editRoles.includes(r.name)}
                                    onChange={() =>
                                      toggleRole(editRoles, setEditRoles, r.name)
                                    }
                                  />
                                  {r.name}
                                </label>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleSetRoles(user.id)}
                                disabled={editLoading}
                                className="text-xs px-2 py-1 rounded bg-[#0e0e39] text-white"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditId(null)
                                  setEditRoles([])
                                }}
                                className="text-xs px-2 py-1 rounded border border-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-600">
                            {(user.roles ?? []).join(', ') || '—'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-right">
                        {editId === user.id ? null : (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditId(user.id)
                                setEditRoles([...(user.roles ?? [])])
                              }}
                              className="text-sm text-[var(--brand-color-2)] hover:underline mr-2"
                            >
                              Edit roles
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(user.id, user.email ?? '')}
                              className="text-sm text-red-600 hover:underline"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
