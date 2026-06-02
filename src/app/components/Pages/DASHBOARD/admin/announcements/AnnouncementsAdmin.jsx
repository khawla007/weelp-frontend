'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { authApi } from '@/lib/axiosInstance';

const TYPES = ['offer', 'update', 'news'];
const EMPTY = { type: 'offer', title: '', message: '', link: '', is_active: true, publish_at: '', expires_at: '' };

const listFetcher = async () => {
  // Admin index returns { success, data: [...] } (plain collection, not paginated).
  const res = await authApi.get('/api/admin/announcements');
  return res.data?.data || [];
};

export default function AnnouncementsAdmin() {
  const { data: items = [], mutate, isLoading } = useSWR('admin-announcements', listFetcher);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const resetForm = () => {
    setForm(EMPTY);
    setEditingId(null);
    setError('');
  };

  const startEdit = (a) => {
    setEditingId(a.id);
    setForm({
      type: a.type,
      title: a.title,
      message: a.message,
      link: a.link || '',
      is_active: !!a.is_active,
      publish_at: a.publish_at ? a.publish_at.slice(0, 16) : '',
      expires_at: a.expires_at ? a.expires_at.slice(0, 16) : '',
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    const payload = {
      ...form,
      link: form.link || null,
      publish_at: form.publish_at || null,
      expires_at: form.expires_at || null,
    };
    try {
      if (editingId) {
        await authApi.put(`/api/admin/announcements/${editingId}`, payload);
      } else {
        await authApi.post('/api/admin/announcements', payload);
      }
      resetForm();
      mutate();
    } catch (err) {
      const data = err?.response?.data;
      const firstFieldError =
        data && typeof data === 'object'
          ? Object.values(data)
              .flat()
              .find((m) => typeof m === 'string')
          : null;
      setError(firstFieldError || data?.message || 'Save failed. Check the fields.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (typeof window !== 'undefined' && !window.confirm('Delete this announcement?')) return;
    try {
      await authApi.delete(`/api/admin/announcements/${id}`);
      if (editingId === id) resetForm();
      mutate();
    } catch {
      setError('Delete failed. Please try again.');
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-xl font-semibold text-[#18181b]">Announcements</h1>

      <form onSubmit={submit} className="space-y-4 rounded-xl border border-[#e4e4e7] p-5">
        <h2 className="text-sm font-semibold">{editingId ? 'Edit announcement' : 'New announcement'}</h2>
        {error && <p className="text-sm text-[#ff725e]">{error}</p>}

        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm">
            Type
            <select value={form.type} onChange={(e) => set('type', e.target.value)} className="mt-1 w-full rounded-md border border-[#e4e4e7] px-3 py-2">
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm flex items-center gap-2 mt-6">
            <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} />
            Active
          </label>
        </div>

        <label className="block text-sm">
          Title
          <input value={form.title} onChange={(e) => set('title', e.target.value)} className="mt-1 w-full rounded-md border border-[#e4e4e7] px-3 py-2" required />
        </label>

        <label className="block text-sm">
          Message
          <textarea value={form.message} onChange={(e) => set('message', e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-[#e4e4e7] px-3 py-2" required />
        </label>

        <label className="block text-sm">
          Link (optional)
          <input value={form.link} onChange={(e) => set('link', e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-md border border-[#e4e4e7] px-3 py-2" />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="text-sm">
            Publish at (optional)
            <input type="datetime-local" value={form.publish_at} onChange={(e) => set('publish_at', e.target.value)} className="mt-1 w-full rounded-md border border-[#e4e4e7] px-3 py-2" />
          </label>
          <label className="text-sm">
            Expires at (optional)
            <input type="datetime-local" value={form.expires_at} onChange={(e) => set('expires_at', e.target.value)} className="mt-1 w-full rounded-md border border-[#e4e4e7] px-3 py-2" />
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="rounded-md bg-[#588f7a] px-4 py-2 text-sm text-white disabled:opacity-60">
            {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="rounded-md border border-[#e4e4e7] px-4 py-2 text-sm">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="rounded-xl border border-[#e4e4e7]">
        {isLoading ? (
          <p className="p-5 text-sm text-[#71717a]">Loading...</p>
        ) : items.length === 0 ? (
          <p className="p-5 text-sm text-[#71717a]">No announcements yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-[#eaeaea] text-left text-[#71717a]">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Active</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-b border-[#f4f4f5]">
                  <td className="px-4 py-2">{a.title}</td>
                  <td className="px-4 py-2">{a.type}</td>
                  <td className="px-4 py-2">{a.is_active ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-2 space-x-3">
                    <button type="button" onClick={() => startEdit(a)} className="text-[#588f7a] hover:underline">
                      Edit
                    </button>
                    <button type="button" onClick={() => remove(a.id)} className="text-[#ff725e] hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
