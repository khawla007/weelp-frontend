const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const overviewChartData = monthNames.map((name) => ({ name, total: 0, bookings: 0 }));

/**
 * Chart configuration
 */
export const chartConfig = {
  height: 205,
  revenueColor: 'hsl(var(--weelp-sage-text))',
  bookingsColor: 'hsl(var(--info))',
  pointerColor: 'hsl(var(--destructive))',
  gridColor: 'hsl(var(--border))',
  axisColor: 'hsl(var(--muted-foreground))',
  axisFontSize: 12,
  revenueFormatter: (value) => `$${Number(value).toLocaleString()}`,
  bookingsFormatter: (value) => Number(value).toLocaleString(),
};
