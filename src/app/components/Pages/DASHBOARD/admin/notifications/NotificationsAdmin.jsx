'use client';

import { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Medialibrary } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/media/MediaLibrary';
import NotificationsList from '@/app/components/Pages/DASHBOARD/user/_rsc_pages/notifications/NotificationsList';
import { useMediaStore } from '@/lib/store/useMediaStore';
import { createNotification, searchUsers } from '@/lib/services/adminNotifications';

const ROLES = [
  { value: 'customer', label: 'Customers' },
  { value: 'creator', label: 'Creators' },
  { value: 'admin', label: 'Admins' },
];

function NotificationComposer() {
  const { selectedMedia, resetMedia } = useMediaStore();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [targetType, setTargetType] = useState('role');
  const [targetRole, setTargetRole] = useState('customer');
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [targetUser, setTargetUser] = useState(null);
  const [displayStyle, setDisplayStyle] = useState('inline');
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
    if (targetType === 'user' && !targetUser) {
      setError('Pick a user to send to.');
      return;
    }
    const payload = {
      title,
      message,
      action_url: actionUrl || null,
      coupon_code: couponCode || null,
      image_media_ids: selectedMedia.map((m) => m.id),
      target_type: targetType,
      ...(targetType === 'user' ? { target_user_id: targetUser?.id } : { target_role: targetRole }),
      display_style: displayStyle,
    };
    setSaving(true);
    try {
      const res = await createNotification(payload);
      setOkMsg(`Sent to ${res.count} recipient${res.count === 1 ? '' : 's'}.`);
      setTitle('');
      setMessage('');
      setActionUrl('');
      setCouponCode('');
      setTargetUser(null);
      setUserQuery('');
      setDisplayStyle('inline');
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
      <h1 className="text-lg font-semibold text-foreground mb-4">Send Notification</h1>
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-background p-5">
        <div>
          <label htmlFor="notif-title" className="block text-sm font-medium mb-1">
            Title
          </label>
          <input id="notif-title" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full rounded-md border border-border px-3 py-2 text-sm" />
        </div>
        <div>
          <label htmlFor="notif-message" className="block text-sm font-medium mb-1">
            Message
          </label>
          <textarea id="notif-message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={5} className="w-full rounded-md border border-border px-3 py-2 text-sm" />
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
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="notif-coupon" className="block text-sm font-medium mb-1">
            Coupon code (optional)
          </label>
          <input
            id="notif-coupon"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            placeholder="e.g. SUMMER50"
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          />
        </div>

        <fieldset className="space-y-1">
          <legend className="text-sm font-medium mb-1">Display style</legend>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="display_style" checked={displayStyle === 'inline'} onChange={() => setDisplayStyle('inline')} /> Inline (visit button)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="display_style" checked={displayStyle === 'popup'} onChange={() => setDisplayStyle('popup')} /> Popup (modal with image)
          </label>
        </fieldset>

        <div>
          <span className="block text-sm font-medium mb-1">Images</span>
          <Dialog open={mediaOpen} onOpenChange={setMediaOpen}>
            <DialogTrigger asChild>
              <button type="button" className="rounded-md border border-border px-3 py-2 text-sm hover:bg-muted">
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
            <select aria-label="Role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="rounded-md border border-border px-3 py-2 text-sm">
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
                className="w-full rounded-md border border-border px-3 py-2 text-sm"
              />
              {targetUser && <p className="mt-1 text-xs text-weelp-sage-text">Selected: {targetUser.email}</p>}
              {userResults.length > 0 && (
                <ul className="mt-1 max-h-40 overflow-y-auto rounded-md border border-border">
                  {userResults.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setTargetUser(u);
                          setUserResults([]);
                          setUserQuery(u.email);
                        }}
                        className="block w-full px-3 py-2 text-left text-sm hover:bg-muted"
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

        <div role="status" aria-live="polite">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {okMsg && <p className="text-sm text-weelp-sage-text">{okMsg}</p>}
        </div>
        <button type="submit" disabled={saving} className="rounded-md bg-weelp-sage-deep px-4 py-2 text-sm font-medium text-white hover:bg-weelp-sage-hover disabled:opacity-50">
          {saving ? 'Sending…' : 'Send notification'}
        </button>
      </form>
    </div>
  );
}

const TAB_TRIGGER_CLASS =
  'rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm';

export default function NotificationsAdmin() {
  const [activeTab, setActiveTab] = useState('inbox');
  const inboxTabRef = useRef(null);
  const sendTabRef = useRef(null);

  const selectTabFromKeyboard = (event, currentTab) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const nextTab = event.key === 'Home' ? 'inbox' : event.key === 'End' ? 'send' : currentTab === 'inbox' ? 'send' : 'inbox';
    setActiveTab(nextTab);
    (nextTab === 'inbox' ? inboxTabRef : sendTabRef).current?.focus();
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div role="tablist" aria-label="Notification sections" className="mx-auto mt-6 flex w-fit gap-1 rounded-lg border border-border bg-muted p-1">
        <button
          ref={inboxTabRef}
          type="button"
          role="tab"
          id="admin-notifications-inbox-tab"
          aria-controls="admin-notifications-inbox-panel"
          aria-selected={activeTab === 'inbox'}
          tabIndex={activeTab === 'inbox' ? 0 : -1}
          data-state={activeTab === 'inbox' ? 'active' : 'inactive'}
          className={TAB_TRIGGER_CLASS}
          onClick={() => setActiveTab('inbox')}
          onKeyDown={(event) => selectTabFromKeyboard(event, 'inbox')}
        >
          Inbox
        </button>
        <button
          ref={sendTabRef}
          type="button"
          role="tab"
          id="admin-notifications-send-tab"
          aria-controls="admin-notifications-send-panel"
          aria-selected={activeTab === 'send'}
          tabIndex={activeTab === 'send' ? 0 : -1}
          data-state={activeTab === 'send' ? 'active' : 'inactive'}
          className={TAB_TRIGGER_CLASS}
          onClick={() => setActiveTab('send')}
          onKeyDown={(event) => selectTabFromKeyboard(event, 'send')}
        >
          Send notification
        </button>
      </div>
      <div
        id="admin-notifications-inbox-panel"
        role="tabpanel"
        aria-labelledby="admin-notifications-inbox-tab"
        hidden={activeTab !== 'inbox'}
        inert={activeTab !== 'inbox'}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40"
      >
        <NotificationsList />
      </div>
      <div
        id="admin-notifications-send-panel"
        role="tabpanel"
        aria-labelledby="admin-notifications-send-tab"
        hidden={activeTab !== 'send'}
        inert={activeTab !== 'send'}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40"
      >
        <NotificationComposer />
      </div>
    </div>
  );
}
