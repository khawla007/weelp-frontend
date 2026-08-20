const FORMULA_PREFIX = /^[\t\r\n]*[=+\-@]/;

function finiteNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function safeText(value) {
  const text = String(value ?? '');
  return FORMULA_PREFIX.test(text) ? `'${text}` : text;
}

function csvCell(value) {
  const text = String(value ?? '');
  if (!/[",\r\n]/.test(text)) return text;
  return `"${text.replaceAll('"', '""')}"`;
}

function row(values) {
  return values.map(csvCell).join(',');
}

export function canExportDashboard({ metrics, overview, metricsLoading, chartLoading, metricsError, chartError }) {
  return !metricsLoading && !chartLoading && !metricsError && !chartError && Array.isArray(metrics) && metrics.length > 0 && Array.isArray(overview) && overview.length > 0;
}

export function buildDashboardCsv({ metrics, overview }) {
  const metricRows = (Array.isArray(metrics) ? metrics : []).map((item) => row([safeText(item?.title), finiteNumber(item?.total), finiteNumber(item?.change)]));
  const monthRows = (Array.isArray(overview) ? overview : []).map((item) => row([safeText(item?.name), finiteNumber(item?.total), finiteNumber(item?.bookings)]));
  const lines = ['Dashboard Summary', 'Metric,Value,Change (%)', ...metricRows, '', 'Monthly Performance', 'Month,Revenue,Bookings', ...monthRows];

  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

export function createDashboardCsvFilename(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `weelp-dashboard-${year}-${month}-${day}.csv`;
}

export function downloadDashboardCsv({ metrics, overview }, { documentRef = document, urlRef = URL, BlobCtor = Blob, date = new Date() } = {}) {
  const blob = new BlobCtor([buildDashboardCsv({ metrics, overview })], { type: 'text/csv;charset=utf-8' });
  const blobUrl = urlRef.createObjectURL(blob);
  let anchor;

  try {
    anchor = documentRef.createElement('a');
    anchor.href = blobUrl;
    anchor.download = createDashboardCsvFilename(date);
    anchor.style.display = 'none';
    documentRef.body.append(anchor);
    anchor.click();
  } finally {
    try {
      anchor?.remove();
    } finally {
      urlRef.revokeObjectURL(blobUrl);
    }
  }
}
