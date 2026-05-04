'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCreatorPayouts } from '@/lib/actions/creatorItineraries';

const PRESETS = [
  {
    key: 'last-90',
    label: 'Last 90 Days',
    range: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 90);
      return { from, to };
    },
  },
  {
    key: 'this-year',
    label: 'This Year',
    range: () => {
      const d = new Date();
      return { from: new Date(d.getFullYear(), 0, 1), to: d };
    },
  },
  {
    key: 'all-time',
    label: 'All Time',
    range: () => ({ from: new Date(2020, 0, 1), to: new Date() }),
  },
];

function fmtCurrency(n) {
  return Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function toIso(d) {
  return d.toISOString().slice(0, 10);
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-[#435a6742] p-4 sm:p-5">
      <p className="text-sm text-[#5A5A5A]">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-[#142A38] mt-2">{value}</p>
    </div>
  );
}

export default function PayoutsClient({ initial }) {
  const [data, setData] = useState(initial);
  const [preset, setPreset] = useState('last-90');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchPage = useCallback(async ({ preset: p, page: pg }) => {
    setLoading(true);
    const range = PRESETS.find((x) => x.key === p)?.range() || PRESETS[0].range();
    const res = await getCreatorPayouts({
      from: toIso(range.from),
      to: toIso(range.to),
      page: pg,
      per_page: 20,
    });
    if (res.success) setData(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional refetch on filter/page change
    fetchPage({ preset, page });
  }, [preset, page, fetchPage]);

  const summary = data?.summary ?? { lifetime: 0, current_period: 0 };
  const rows = data?.rows ?? [];
  const pagination = data?.pagination ?? { current_page: 1, last_page: 1, total: 0 };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#142A38]">Payouts</h1>
        <p className="text-[#5A5A5A] mt-1">Paid commission batches grouped by date.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryCard label="Lifetime Paid" value={fmtCurrency(summary.lifetime)} />
        <SummaryCard label="Period Paid" value={fmtCurrency(summary.current_period)} />
      </section>

      <section className="flex gap-2 flex-wrap">
        {PRESETS.map((p) => (
          <Button
            key={p.key}
            size="sm"
            variant={preset === p.key ? 'default' : 'outline'}
            onClick={() => {
              setPreset(p.key);
              setPage(1);
            }}
            className={preset === p.key ? 'bg-secondaryDark hover:bg-secondaryDark/90' : 'border-[#435a6742] text-[#435a67]'}
          >
            {p.label}
          </Button>
        ))}
      </section>

      {rows.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-[#435a6742]">
          <p className="text-lg text-[#142A38]">No payouts in this period</p>
          <p className="text-[#5A5A5A] mt-2">Paid commissions will appear here once your earnings are settled.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-lg border border-[#435a6742]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payout Date</TableHead>
                  <TableHead className="text-right">Commissions</TableHead>
                  <TableHead className="text-right">Total Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.payout_date}>
                    <TableCell>{fmtDate(r.payout_date)}</TableCell>
                    <TableCell className="text-right">{r.commission_count}</TableCell>
                    <TableCell className="text-right font-semibold">{fmtCurrency(r.total_amount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-3">
            {rows.map((r) => (
              <div key={r.payout_date} className="bg-white rounded-lg border border-[#435a6742] p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="font-medium text-[#142A38]">{fmtDate(r.payout_date)}</div>
                  <div className="font-semibold text-[#142A38]">{fmtCurrency(r.total_amount)}</div>
                </div>
                <div className="text-sm text-[#5A5A5A]">
                  {r.commission_count} commission{r.commission_count === 1 ? '' : 's'}
                </div>
              </div>
            ))}
          </div>

          {pagination.last_page > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#5A5A5A]">
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                  Previous
                </Button>
                <Button size="sm" variant="outline" disabled={page >= pagination.last_page || loading} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
