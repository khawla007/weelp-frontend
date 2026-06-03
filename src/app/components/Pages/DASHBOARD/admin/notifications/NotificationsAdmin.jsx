'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Medialibrary } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/media/MediaLibrary';
import { useMediaStore } from '@/lib/store/useMediaStore';
import { createNotification, searchUsers } from '@/lib/services/adminNotifications';

const ROLES = [
  { value: 'customer', label: 'Customers' },
  { value: 'creator', label: 'Creators' },
  { value: 'admin', label: 'Admins' },
];

export default function NotificationsAdmin() {
  const { selectedMedia, resetMedia } = useMediaStore();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [targetType, setTargetType] = useState('role');
  const [targetRole, setTargetRole] = useState('customer');
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [targetUser, setTargetUser] = useState(null);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const [saving, setSaving] = useState(false);

  const onUserSearch = async (q) => {
    setUserQuery(q);
    setUserResults(q.length >= 2 ? await searchUsers(q) : []);
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setOkMsg('');
    const payload = {
      title,
      message,
      action_url: actionUrl || null,
      image_media_ids: selectedMedia.map((m) => m.id),
      target_type: targetType,
      ...(targetType === 'user' ? { target_user_id: targetUser?.id } : { target_role: targetRole }),
    };
    setSaving(true);
    try {
      const res = await createNotification(payload);
      setOkMsg(`Sent to ${res.count} recipient${res.count === 1 ? '' : 's'}.`);
      setTitle('');
      setMessage('');
      setActionUrl('');
      setTargetUser(null);
      setUserQuery('');
      resetMedia();
    } catch (err) {
      const data = err?.response?.data;
      const first =
        data && typeof data === 'object'
          ? Object.values(data)
              .flat()
              .find((m) => typeof m === 'string')
          : null;
      setError(first || data?.message || 'Send failed. Check the fields.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl py-6">
      <h1 className="text-lg font-semibold text-[#18181b] mb-4">Send Notification</h1>
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-[#e4e4e7] bg-white p-5">
        <div>
          <label htmlFor="notif-title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input id="notif-title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full rounded-md border border-[#e4e4e7] px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="notif-message" className="block text-sm font-medium mb-1">
            Message
          </label>
          <textarea id="notif-message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className="w-full rounded-md border border-[#e4e4e7] px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="notif-link" className="block text-sm font-medium mb-1">
            Link (optional)
          </label>
          <input
            id="notif-link"
            value={actionUrl}
            onChange={(e) => setActionUrl(e.target.value)}
            placeholder="/path or https://…"
            className="w-full rounded-md border border-[#e4e4e7] px-3 py-2 text-sm"
          />
        </div>

        <div>
          <span className="block text-sm font-medium mb-1">Images</span>
          <Dialog open={mediaOpen} onOpenChange={setMediaOpen}>
            <DialogTrigger asChild>
              <button type="button" className="rounded-md border border-[#e4e4e7] px-3 py-2 text-sm hover:bg-[#f4f4f5]">
                Select Media ({selectedMedia.length})
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-screen-xl">
              <DialogTitle className="sr-only">Select media</DialogTitle>
              <DialogDescription className="sr-only">Pick images for this notification</DialogDescription>
              <Medialibrary closeDialog={() => setMediaOpen(false)} alreadySelectedImages={selectedMedia} onSelectionChange={() => {}} />
            </DialogContent>
          </Dialog>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium mb-1">Send to</legend>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="target" checked={targetType === 'role'} onChange={() => setTargetType('role')} /> A role
          </label>
          {targetType === 'role' && (
            <select aria-label="Role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="rounded-md border border-[#e4e4e7] px-3 py-2 text-sm">
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="target" checked={targetType === 'user'} onChange={() => setTargetType('user')} /> A single user
          </label>
          {targetType === 'user' && (
            <div>
              <input
                aria-label="Search user"
                value={userQuery}
                onChange={(e) => onUserSearch(e.target.value)}
                placeholder="Search name or email…"
                className="w-full rounded-md border border-[#e4e4e7] px-3 py-2 text-sm"
              />
              {targetUser && <p className="mt-1 text-xs text-[#588f7a]">Selected: {targetUser.email}</p>}
              {userResults.length > 0 && (
                <ul className="mt-1 max-h-40 overflow-y-auto rounded-md border border-[#e4e4e7]">
                  {userResults.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetUser(u);
                          setUserResults([]);
                          setUserQuery(u.email);
                        }}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-[#f4f4f5]"
                      >
                        {u.name} — {u.email}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </fieldset>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {okMsg && <p className="text-sm text-[#588f7a]">{okMsg}</p>}
        <button type="submit" disabled={saving} className="rounded-md bg-[#588f7a] px-4 py-2 text-sm font-medium text-white hover:bg-[#4a7a68] disabled:opacity-50">
          {saving ? 'Sending…' : 'Send notification'}
        </button>
      </form>
    </div>
  );
}
