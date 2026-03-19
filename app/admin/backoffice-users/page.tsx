'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { adminApi, type BackofficeUserResponse, type BackofficeRoleResponse } from '@/lib/adminApi'
import { useApiEnv } from '@/app/admin/contexts/ApiEnvContext'
import toast from 'react-hot-toast'
import { ChevronDown, Pencil, Trash2 } from 'lucide-react'
import AdminHero from '@/app/admin/components/AdminHero'
import { useConfirmDialog } from '@/app/admin/components/useConfirmDialog'

type PermissionGroup = {
  name: string
  permissions: string[]
}

const toTitle = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase())

const getPermissionGroupName = (permission: string) => {
  const segments = permission.split(/[.:/_-]/).filter(Boolean)
  if (segments.length === 0) return 'General'
  if (segments[0]?.toLowerCase() === 'backoffice' && segments[1]) return toTitle(segments[1])
  return toTitle(segments[0] ?? 'General')
}

function Collapsible({
  open,
  children,
  className,
}: {
  open: boolean
  children: React.ReactNode
  className?: string
}) {
  const innerRef = useRef<HTMLDivElement | null>(null)
  const [height, setHeight] = useState(0)

  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    const nextHeight = open ? el.scrollHeight : 0
    setHeight(nextHeight)
  }, [open])

  return (
    <div
      ref={innerRef}
      style={{
        height,
        pointerEvents: open ? 'auto' : 'none',
      }}
      className={`overflow-hidden transition-[height,opacity] duration-200 ease-out ${
        open ? 'opacity-100' : 'opacity-0'
      } ${className ?? ''}`}
    >
      {children}
    </div>
  )
}

export default function BackofficeUsersPage() {
  const { env } = useApiEnv()
  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users')
  const [users, setUsers] = useState<BackofficeUserResponse[]>([])
  const [roles, setRoles] = useState<BackofficeRoleResponse[]>([])
  const [permissions, setPermissions] = useState<string[]>([])
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

  const [createRoleOpen, setCreateRoleOpen] = useState(false)
  const [createRoleName, setCreateRoleName] = useState('')
  const [createRolePerms, setCreateRolePerms] = useState<string[]>([])
  const [createRoleLoading, setCreateRoleLoading] = useState(false)
  const [editRoleId, setEditRoleId] = useState<number | null>(null)
  const [editRolePerms, setEditRolePerms] = useState<string[]>([])
  const [editRoleLoading, setEditRoleLoading] = useState(false)
  const [expandedEditGroups, setExpandedEditGroups] = useState<Record<string, boolean>>({})

  const { confirm, confirmDialog } = useConfirmDialog()
  const groupedPermissions = useMemo<PermissionGroup[]>(() => {
    const groups = new Map<string, string[]>()
    for (const permission of permissions) {
      const groupName = getPermissionGroupName(permission)
      const groupPerms = groups.get(groupName) ?? []
      groupPerms.push(permission)
      groups.set(groupName, groupPerms)
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, perms]) => ({
        name,
        permissions: perms.sort((a, b) => a.localeCompare(b)),
      }))
  }, [permissions])

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [usersData, rolesData, permsData] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getRoles(),
        adminApi.getPermissions(),
      ])
      setUsers(usersData)
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

  const handleCreateUser = async (e: FormEvent) => {
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

  const handleSetUserRoles = async (id: number) => {
    const approved = await confirm({
      title: 'Apply role changes',
      description: 'Apply these role changes to this user?',
      confirmLabel: 'Apply',
    })
    if (!approved) return
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

  const startEditRoles = (user: BackofficeUserResponse) => {
    setEditId(user.id)
    setEditRoles([...(user.roles ?? [])])
  }

  const closeEditModal = () => {
    if (editLoading) return
    setEditId(null)
    setEditRoles([])
  }

  const handleDeleteUser = async (id: number, email: string) => {
    const approved = await confirm({
      title: 'Delete backoffice user',
      description: `Remove backoffice user "${email}"?`,
      confirmLabel: 'Delete',
      tone: 'danger',
    })
    if (!approved) return
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

  const togglePerm = (list: string[], setList: (v: string[]) => void, perm: string) => {
    if (list.includes(perm)) setList(list.filter((p) => p !== perm))
    else setList([...list, perm])
  }

  const handleCreateRole = async (e: FormEvent) => {
    e.preventDefault()
    if (!createRoleName.trim()) return
    setCreateRoleLoading(true)
    setError('')
    try {
      await adminApi.createRole({ name: createRoleName.trim(), permissions: createRolePerms })
      toast.success('Role created')
      setCreateRoleOpen(false)
      setCreateRoleName('')
      setCreateRolePerms([])
      load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create role')
    } finally {
      setCreateRoleLoading(false)
    }
  }

  const startEditPermissions = (role: BackofficeRoleResponse) => {
    setEditRoleId(role.id)
    setEditRolePerms(role.permissions ?? [])
    setExpandedEditGroups(
      groupedPermissions.reduce<Record<string, boolean>>((acc, group) => {
        acc[group.name] = true
        return acc
      }, {})
    )
  }

  const closeEditRoleModal = () => {
    if (editRoleLoading) return
    setEditRoleId(null)
    setEditRolePerms([])
  }

  const handleSetPermissions = async (id: number) => {
    const approved = await confirm({
      title: 'Apply permission changes',
      description: 'Apply these permission changes to this role?',
      confirmLabel: 'Apply',
    })
    if (!approved) return
    setEditRoleLoading(true)
    setError('')
    try {
      await adminApi.setRolePermissions(id, editRolePerms)
      toast.success('Permissions updated')
      setEditRoleId(null)
      setEditRolePerms([])
      load()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to update permissions')
    } finally {
      setEditRoleLoading(false)
    }
  }

  const handleDeleteRole = async (id: number, name: string) => {
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

  const toggleEditGroup = (groupName: string) => {
    setExpandedEditGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }))
  }

  const setGroupPermissions = (groupPerms: string[], checked: boolean) => {
    if (checked) {
      setEditRolePerms((prev) => Array.from(new Set([...prev, ...groupPerms])))
      return
    }
    setEditRolePerms((prev) => prev.filter((perm) => !groupPerms.includes(perm)))
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        <AdminHero
          className="mb-6"
          eyebrow={activeTab === 'users' ? 'Access control' : 'Permissions'}
          title={activeTab === 'users' ? 'Backoffice users' : 'Roles'}
          description={
            activeTab === 'users'
              ? 'Manage backoffice login accounts and role assignments.'
              : 'Manage backoffice roles and permission sets.'
          }
          variant="indigo"
          actions={
            activeTab === 'users' ? (
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="rounded-full bg-[#0f1222] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-black"
              >
                Create user
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCreateRoleOpen(true)}
                className="rounded-full bg-[#0f1222] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-black"
              >
                Create role
              </button>
            )
          }
        />

        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === 'users'
                ? 'bg-[#0e0e39] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Users
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roles')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === 'roles'
                ? 'bg-[#0e0e39] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Roles
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50/90 border border-red-200 text-red-700 px-5 py-4">
            {error}
          </div>
        )}

        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create backoffice user</h2>
              <form onSubmit={handleCreateUser} className="space-y-4">
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

        {editId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit user roles</h2>
              <div className="space-y-3">
                {roles.map((r) => (
                  <label key={r.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editRoles.includes(r.name)}
                      onChange={() => toggleRole(editRoles, setEditRoles, r.name)}
                      disabled={editLoading}
                    />
                    <span className="text-gray-700">{r.name}</span>
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
                  onClick={() => handleSetUserRoles(editId)}
                  disabled={editLoading}
                  className="px-4 py-2 rounded-lg bg-[#0e0e39] text-white hover:opacity-90 disabled:opacity-50"
                >
                  {editLoading ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}

        {createRoleOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-auto p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Create role</h2>
              <form onSubmit={handleCreateRole} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={createRoleName}
                    onChange={(e) => setCreateRoleName(e.target.value)}
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
                          checked={createRolePerms.includes(p)}
                          onChange={() => togglePerm(createRolePerms, setCreateRolePerms, p)}
                        />
                        <span className="text-gray-700">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setCreateRoleOpen(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createRoleLoading}
                    className="px-4 py-2 rounded-lg bg-[#0e0e39] text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {createRoleLoading ? 'Creating…' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editRoleId !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit permissions</h2>
              <p className="text-sm text-gray-600 mb-4">
                Permissions are grouped by module to make bulk review easier.
              </p>
              <div className="space-y-3">
                {groupedPermissions.map((group, index) => {
                  const selectedCount = group.permissions.filter((perm) => editRolePerms.includes(perm)).length
                  const allSelected = selectedCount === group.permissions.length && group.permissions.length > 0
                  const isExpanded = expandedEditGroups[group.name] ?? true

                  return (
                    <div key={group.name} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleEditGroup(group.name)}
                        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
                        disabled={editRoleLoading}
                      >
                        <div className="flex items-center gap-3 text-left">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                            {index + 1}
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{group.name}</div>
                            <div className="text-xs text-gray-500">
                              {selectedCount}/{group.permissions.length} selected
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : 'rotate-0'
                            }`}
                          />
                        </div>
                      </button>

                      <Collapsible
                        open={isExpanded}
                        className={`border-t transition-colors duration-200 ${
                          isExpanded ? 'border-gray-100' : 'border-transparent'
                        }`}
                      >
                        <div className="px-4 py-3">
                          <div className="mb-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setGroupPermissions(group.permissions, !allSelected)}
                              disabled={editRoleLoading}
                              className="text-xs font-medium text-[#0e0e39] hover:underline disabled:opacity-50"
                            >
                              {allSelected ? 'Clear group' : 'Select all in group'}
                            </button>
                          </div>
                          <div className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                            {group.permissions.map((permission) => (
                              <label
                                key={permission}
                                className="flex items-center justify-between gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                              >
                                <div className="min-w-0">
                                  <div className="font-medium text-gray-800">{toTitle(permission)}</div>
                                  <div className="text-xs text-gray-500 break-all">{permission}</div>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={editRolePerms.includes(permission)}
                                  onChange={() => togglePerm(editRolePerms, setEditRolePerms, permission)}
                                  disabled={editRoleLoading}
                                  className="h-4 w-4 shrink-0 rounded border-gray-300 text-[#0e0e39] focus:ring-[#0e0e39]"
                                />
                              </label>
                            ))}
                          </div>
                        </div>
                      </Collapsible>
                    </div>
                  )
                })}
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <button
                  type="button"
                  onClick={closeEditRoleModal}
                  disabled={editRoleLoading}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSetPermissions(editRoleId)}
                  disabled={editRoleLoading}
                  className="px-4 py-2 rounded-lg bg-[#0e0e39] text-white hover:opacity-90 disabled:opacity-50"
                >
                  {editRoleLoading ? 'Saving…' : 'Save'}
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
            {activeTab === 'users' ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Email</th>
                    <th className="text-left py-3 px-5 text-xs font-semibold text-gray-600 uppercase">Roles</th>
                    <th className="w-28 py-3 px-5 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
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
                          <span className="text-gray-600">{(user.roles ?? []).join(', ') || '—'}</span>
                        </td>
                        <td className="py-3 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => startEditRoles(user)}
                              className="p-1.5 rounded text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                              aria-label="Edit roles"
                              title="Edit roles"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id, user.email ?? '')}
                              className="p-1.5 rounded text-red-600 hover:bg-red-50"
                              aria-label="Delete user"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
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
                          <div className="flex items-center justify-end gap-1">
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
                                onClick={() => handleDeleteRole(role.id, role.name)}
                                className="p-1.5 rounded text-red-600 hover:bg-red-50"
                                aria-label="Delete role"
                                title="Delete role"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        )}
        {confirmDialog}
      </div>
    </div>
  )
}
