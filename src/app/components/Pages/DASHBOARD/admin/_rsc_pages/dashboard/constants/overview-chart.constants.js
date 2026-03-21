/**
 * Overview chart data
 *
 * TODO: Replace with API call to fetch actual booking/revenue data
 * Current data is mock data for development
 */

export const overviewChartData = [
  { name: 'Jan', total: 2400 },
  { name: 'Feb', total: 1890 },
  { name: 'Mar', total: 3200 },
  { name: 'Apr', total: 2800 },
  { name: 'May', total: 3500 },
  { name: 'Jun', total: 4200 },
  { name: 'Jul', total: 3800 },
  { name: 'Aug', total: 4500 },
  { name: 'Sep', total: 2900 },
  { name: 'Oct', total: 3100 },
  { name: 'Nov', total: 3600 },
  { name: 'Dec', total: 4800 },
];

/**
 * Chart configuration
 */
export const chartConfig = {
  height: 350,
  axisColor: '#888888',
  axisFontSize: 12,
  valueFormatter: (value) => `$${value}`,
};
