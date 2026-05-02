'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getCreatorEarnings } from '@/lib/actions/creatorItineraries';
import NavigationLink from '@/app/components/Navigation/NavigationLink';

const STATUS_TABS = ['all', 'pending', 'paid', 'cancelled'];

const PRESETS = [
  {
    key: 'this-month',
    label: 'This Month',
    range: () => {
      const d = new Date();
      return { from: new Date(d.getFullYear(), d.getMonth(), 1), to: d };
    },
  },
  {
    key: 'last-month',
    label: 'Last Month',
    range: () => {
      const d = new Date();
      return {
        from: new Date(d.getFullYear(), d.getMonth() - 1, 1),
        to: new Date(d.getFullYear(), d.getMonth(), 0),
      };
    },
  },
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

function statusBadgeVariant(status) {
  switch (status) {
    case 'paid':
      return 'success';
    case 'cancelled':
      return 'destructive';
    case 'pending':
    default:
      return 'warning';
  }
}

function SummaryCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-[#435a6742] p-4 sm:p-5">
      <p className="text-sm text-[#5A5A5A]">{label}</p>
      <p className="text-2xl sm:text-3xl font-bold text-[#142A38] mt-2">{value}</p>
    </div>
  );
}

export default function EarningsClient({ initial }) {
  const [data, setData] = useState(initial);
  const [status, setStatus] = useState('all');
  const [preset, setPreset] = useState('this-month');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchPage = useCallback(async ({ status: s, preset: p, page: pg }) => {
    setLoading(true);
    const range = PRESETS.find((x) => x.key === p)?.range() || PRESETS[0].range();
    const res = await getCreatorEarnings({
      status: s,
      from: toIso(range.from),
      to: toIso(range.to),
      page: pg,
      per_page: 20,
    });
    if (res.success) setData(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional refetch on filter/page change; fetchPage updates state via setData/setLoading
    fetchPage({ status, preset, page });
  }, [status, preset, page, fetchPage]);

  const summary = data?.summary ?? { lifetime: 0, current_period: 0, pending: 0 };
  const rows = data?.rows ?? [];
  const pagination = data?.pagination ?? { current_page: 1, last_page: 1, total: 0 };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#142A38]">Earnings</h1>
        <p className="text-[#5A5A5A] mt-1">Commissions from your published itineraries.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Lifetime" value={fmtCurrency(summary.lifetime)} />
        <SummaryCard label="Current Period" value={fmtCurrency(summary.current_period)} />
        <SummaryCard label="Pending" value={fmtCurrency(summary.pending)} />
      </section>

      <section className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <Button
              key={tab}
              size="sm"
              variant={status === tab ? 'default' : 'outline'}
              onClick={() => {
                setStatus(tab);
                setPage(1);
              }}
              className={status === tab ? 'bg-secondaryDark hover:bg-secondaryDark/90' : 'border-[#435a6742] text-[#435a67]'}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap sm:ml-auto">
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
        </div>
      </section>

      {rows.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-[#435a6742]">
          <p className="text-lg text-[#142A38]">No earnings in this period</p>
          <p className="text-[#5A5A5A] mt-2">Once your itineraries get booked you&apos;ll see commissions here.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-lg border border-[#435a6742]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Itinerary</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{fmtDate(r.created_at)}</TableCell>
                    <TableCell>
                      {r.itinerary?.slug ? (
                        <NavigationLink href={`/itineraries/${r.itinerary.slug}`} className="text-secondaryDark hover:underline">
                          {r.itinerary.name}
                        </NavigationLink>
                      ) : (
                        r.itinerary?.name || '-'
                      )}
                    </TableCell>
                    <TableCell>#{r.order_id}</TableCell>
                    <TableCell className="text-right">{fmtCurrency(r.gross_amount)}</TableCell>
                    <TableCell className="text-right">{r.commission_rate}%</TableCell>
                    <TableCell className="text-right font-semibold">{fmtCurrency(r.commission_amount)}</TableCell>
                    <TableCell>
                      <Badge variant={statusBadgeVariant(r.status)}>{r.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="md:hidden space-y-3">
            {rows.map((r) => (
              <div key={r.id} className="bg-white rounded-lg border border-[#435a6742] p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div className="font-medium text-[#142A38]">{r.itinerary?.name || '-'}</div>
                  <Badge variant={statusBadgeVariant(r.status)}>{r.status}</Badge>
                </div>
                <div className="text-sm text-[#5A5A5A]">
                  {fmtDate(r.created_at)} · Order #{r.order_id}
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-100">
                  <span>
                    Gross: {fmtCurrency(r.gross_amount)} · {r.commission_rate}%
                  </span>
                  <span className="font-semibold text-[#142A38]">+{fmtCurrency(r.commission_amount)}</span>
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
