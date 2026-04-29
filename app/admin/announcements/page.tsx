"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import AdminHero from "@/app/admin/components/AdminHero";
import { useApiEnv } from "@/app/admin/contexts/ApiEnvContext";
import { useConfirmDialog } from "@/app/admin/components/useConfirmDialog";
import {
  adminApi,
  type AnnouncementResponse,
  type AnnouncementRequest,
} from "@/lib/adminApi";

const BLANK: AnnouncementRequest = {
  title: "",
  description: "",
  badge: "",
  badgeColor: "blue",
  iconName: "",
  isPublished: true,
  sortOrder: 0,
  expiresAt: undefined,
};

const BADGE_COLOR_OPTIONS = [
  { value: "blue", label: "Blue" },
  { value: "orange", label: "Orange" },
  { value: "green", label: "Green" },
  { value: "red", label: "Red" },
  { value: "purple", label: "Purple" },
  { value: "gold", label: "Gold" },
];

const ICON_OPTIONS = [
  { value: "rise", label: "Rise (chart)" },
  { value: "robot", label: "Robot (AI)" },
  { value: "bell", label: "Bell" },
  { value: "star", label: "Star" },
  { value: "thunder", label: "Thunder" },
];

type ModalState = { mode: "create" } | { mode: "edit"; item: AnnouncementResponse } | null;

function AnnouncementModal({
  state,
  onClose,
  onSave,
}: {
  state: ModalState;
  onClose: () => void;
  onSave: (payload: AnnouncementRequest, id?: number) => Promise<void>;
}) {
  const [form, setForm] = useState<AnnouncementRequest>(BLANK);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!state) return;
    if (state.mode === "edit") {
      const { item } = state;
      setForm({
        title: item.title,
        description: item.description ?? "",
        badge: item.badge ?? "",
        badgeColor: item.badgeColor ?? "blue",
        iconName: item.iconName ?? "",
        isPublished: item.isPublished,
        sortOrder: item.sortOrder,
        expiresAt: item.expiresAt ? item.expiresAt.slice(0, 10) : undefined,
      });
    } else {
      setForm(BLANK);
    }
  }, [state]);

  if (!state) return null;

  const set = <K extends keyof AnnouncementRequest>(key: K, value: AnnouncementRequest[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload: AnnouncementRequest = {
        ...form,
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        badge: form.badge?.trim() || undefined,
        badgeColor: form.badgeColor?.trim() || undefined,
        iconName: form.iconName?.trim() || undefined,
        expiresAt: form.expiresAt || undefined,
      };
      await onSave(payload, state.mode === "edit" ? state.item.id : undefined);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-xl"
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            {state.mode === "edit" ? "Edit announcement" : "New announcement"}
          </h2>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              placeholder="e.g. Brand new analytics dashboard"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              placeholder="Short supporting text shown below the title"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Badge text
              </label>
              <input
                value={form.badge}
                onChange={(e) => set("badge", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                placeholder="NEW / UPDATE / FIX"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Badge colour
              </label>
              <select
                value={form.badgeColor}
                onChange={(e) => set("badgeColor", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              >
                {BADGE_COLOR_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Icon
              </label>
              <select
                value={form.iconName}
                onChange={(e) => set("iconName", e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
              >
                <option value="">None</option>
                {ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                Sort order
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => set("sortOrder", Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
                min={0}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
              Expires at
            </label>
            <input
              type="date"
              value={form.expiresAt ?? ""}
              onChange={(e) => set("expiresAt", e.target.value || undefined)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="isPublished"
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => set("isPublished", e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            <label htmlFor="isPublished" className="text-sm text-slate-700">
              Published (visible on the feed sidebar)
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || !form.title.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving…" : state.mode === "edit" ? "Save changes" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AnnouncementsPage() {
  const { env } = useApiEnv();
  const { confirm, confirmDialog } = useConfirmDialog();
  const [items, setItems] = useState<AnnouncementResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<ModalState>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await adminApi.getAnnouncements();
      setItems(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [env]);

  const handleSave = async (payload: AnnouncementRequest, id?: number) => {
    if (id !== undefined) {
      await adminApi.updateAnnouncement(id, payload);
      toast.success("Announcement updated");
    } else {
      await adminApi.createAnnouncement(payload);
      toast.success("Announcement created");
    }
    await load();
  };

  const handleDelete = async (item: AnnouncementResponse) => {
    const approved = await confirm({
      title: "Delete announcement",
      description: `Delete "${item.title}"? This cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!approved) return;
    try {
      await adminApi.deleteAnnouncement(item.id);
      toast.success("Deleted");
      await load();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  return (
    <div className="space-y-6 bg-slate-50/70 p-6">
      <AdminHero
        title="What's New"
        description="Manage the feature announcements shown in the feed sidebar. Published items appear in real-time."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {items.length} announcement{items.length !== 1 ? "s" : ""}
          {" · "}
          {items.filter((i) => i.isPublished).length} published
        </p>
        <button
          onClick={() => setModal({ mode: "create" })}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-500"
        >
          + New announcement
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-[var(--admin-ui-accent)]" />
        </div>
      ) : error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </p>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm text-slate-500">No announcements yet.</p>
          <button
            onClick={() => setModal({ mode: "create" })}
            className="mt-3 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
          >
            Create the first one
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Badge</th>
                <th className="px-4 py-3">Icon</th>
                <th className="px-4 py-3 text-center">Order</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Expires</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{item.title}</p>
                    {item.description && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {item.badge ? (
                      <span
                        className="inline-block rounded-md px-2 py-0.5 text-xs font-bold"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${item.badgeColor ?? "blue"} 15%, white)`,
                          color: item.badgeColor ?? "inherit",
                        }}
                      >
                        {item.badge}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">
                    {item.iconName || "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">
                    {item.sortOrder}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        item.isPublished
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {item.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-slate-400">
                    {item.expiresAt
                      ? new Date(item.expiresAt).toLocaleDateString()
                      : "Never"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setModal({ mode: "edit", item })}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="rounded-lg border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnnouncementModal
        state={modal}
        onClose={() => setModal(null)}
        onSave={handleSave}
      />

      {confirmDialog}
    </div>
  );
}
