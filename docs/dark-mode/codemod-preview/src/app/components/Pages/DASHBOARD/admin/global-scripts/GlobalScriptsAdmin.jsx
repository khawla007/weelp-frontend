'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Save } from 'lucide-react';
import { authApi } from '@/lib/axiosInstance';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const EMPTY_FORM = {
  head_code: '',
  body_code: '',
  footer_code: '',
};

const fetchGlobalScripts = async () => {
  const res = await authApi.get('/api/admin/global-scripts');
  return res.data?.data || EMPTY_FORM;
};

export default function GlobalScriptsAdmin() {
  const { data, mutate, isLoading } = useSWR('admin-global-scripts', fetchGlobalScripts);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadedHeadCode = data?.head_code || '';
  const loadedBodyCode = data?.body_code || '';
  const loadedFooterCode = data?.footer_code || '';

  useEffect(() => {
    setForm({
      head_code: loadedHeadCode,
      body_code: loadedBodyCode,
      footer_code: loadedFooterCode,
    });
  }, [loadedBodyCode, loadedFooterCode, loadedHeadCode]);

  const setField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setStatus('');
    setError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus('');
    setError('');

    try {
      const res = await authApi.put('/api/admin/global-scripts', form);
      const saved = res.data?.data || form;
      setForm({
        head_code: saved.head_code || '',
        body_code: saved.body_code || '',
        footer_code: saved.footer_code || '',
      });
      await mutate(saved, false);
      setStatus('Global scripts saved.');
    } catch (err) {
      const data = err?.response?.data;
      const firstFieldError =
        data && typeof data === 'object'
          ? Object.values(data)
              .flat()
              .find((message) => typeof message === 'string')
          : null;
      setError(firstFieldError || data?.message || 'Save failed. Check the script fields.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Global Scripts</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted-foreground">Add scripts or markup that should load across the public website. Item SEO scripts still remain editable from each item.</p>
      </div>

      <form onSubmit={submit} className="space-y-5 rounded-lg border border-border bg-background p-5">
        {error && <p className="rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">{error}</p>}
        {status && <p className="rounded-md border border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-sm text-[#166534]">{status}</p>}

        <ScriptSlotField
          label="Header scripts"
          hint="Rendered in the public site head. Use this for analytics verification, meta tags, and JSON-LD that must be global."
          value={form.head_code}
          onChange={(value) => setField('head_code', value)}
          placeholder='<meta name="example" content="global">'
        />

        <ScriptSlotField
          label="Body scripts"
          hint="Rendered near the top of the public site body."
          value={form.body_code}
          onChange={(value) => setField('body_code', value)}
          placeholder="<script>window.exampleBody = true</script>"
        />

        <ScriptSlotField
          label="Footer scripts"
          hint="Rendered after the public site footer and loaded lazily."
          value={form.footer_code}
          onChange={(value) => setField('footer_code', value)}
          placeholder="<script>window.exampleFooter = true</script>"
        />

        <div className="flex items-center gap-3">
          <Button type="submit" variant="secondary" disabled={saving || isLoading}>
            <Save size={16} />
            {saving ? 'Saving...' : 'Save global scripts'}
          </Button>
          {isLoading && <span className="text-sm text-muted-foreground">Loading current settings...</span>}
        </div>
      </form>
    </div>
  );
}

function ScriptSlotField({ label, hint, value, onChange, placeholder }) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-[#27272a]">{label}</span>
      <span className="mt-1 block text-xs leading-5 text-muted-foreground">{hint}</span>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} rows={7} placeholder={placeholder} className="mt-2 font-mono text-xs leading-5" />
    </label>
  );
}
