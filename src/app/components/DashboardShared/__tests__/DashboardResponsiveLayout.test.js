import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const readSource = (path) => readFileSync(join(process.cwd(), path), 'utf8');

describe('dashboard mobile overflow contracts', () => {
  it('publishes mobile bar offset changes through the shared sidebar position property', () => {
    const layoutSource = readSource('src/app/(dashboard)/dashboard/customer/layout.js');

    expect(layoutSource).toContain('document.documentElement.style.setProperty(DASHBOARD_SIDEBAR_TOP_PROPERTY');
    expect(layoutSource).toContain('nextTop + barHeight');
    expect(layoutSource).toContain('document.documentElement.style.removeProperty(DASHBOARD_SIDEBAR_TOP_PROPERTY)');
  });

  it('keeps the customer header dropdown above the mobile welcome bar and below the sidebar', () => {
    const layoutSource = readSource('src/app/(dashboard)/dashboard/customer/layout.js');
    const sidebarSource = readSource('src/app/components/Layout/DashboardSidebar.jsx');

    expect(layoutSource).toContain('className="sticky top-0 z-[96] lg:contents"');
    expect(layoutSource).toContain('className="fixed inset-x-0 z-[95]');
    expect(sidebarSource).toContain('fixed bottom-0 left-0 z-[100]');
  });

  it('makes the admin shell and header shrink beside the desktop sidebar', () => {
    const layoutSource = readSource('src/app/(dashboard)/dashboard/admin/layout.js');
    const headerSource = readSource('src/app/components/Pages/DASHBOARD/admin/header.jsx');

    expect(layoutSource).toContain('className="flex min-w-0 flex-1 flex-col"');
    expect(layoutSource).toContain('className="min-w-0 flex-1"');
    expect(layoutSource).toContain('className="container mx-auto w-full min-w-0 p-8 sm:p-12"');
    expect(layoutSource).not.toContain('className="flex flex-col w-full"');
    expect(headerSource).toContain('className="sticky top-0 z-50 h-16 min-w-0 border-b bg-background px-4"');
    expect(headerSource).toContain('className="relative min-w-0 w-full max-w-md flex-1 self-center lg:flex-none"');
    expect(headerSource).not.toContain('sm:flex-none');
  });

  it('anchors the toast viewport to both mobile edges and preserves desktop right placement', () => {
    const source = readSource('src/components/ui/toast.jsx');

    expect(source).toContain('inset-x-0');
    expect(source).toContain('sm:left-auto');
    expect(source).toContain('sm:right-0');
  });

  it('stacks pagination and wraps centered controls until the content safely fits', () => {
    const source = readSource('src/app/components/Pagination.jsx');

    expect(source).toContain('flex w-full min-w-0 flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between');
    expect(source).toContain('flex w-full min-w-0 flex-wrap items-center justify-center gap-2 lg:w-auto lg:flex-nowrap lg:justify-end');
    expect(source).not.toContain('md:flex-row');
    expect(source).not.toContain('md:flex-nowrap');
  });

  it('keeps shared filters stacked through tablet widths and restores fixed widths at xl', () => {
    const source = readSource('src/app/components/DashboardShared/FilterBar.jsx');

    expect(source).toContain('flex-col');
    expect(source).toContain('min-w-0');
    expect(source).toContain('xl:flex-row');
    expect(source).toContain('w-full xl:w-[500px]');
    expect(source).toContain('w-full xl:w-[180px]');
    expect(source).not.toContain('sm:flex-row');
    expect(source).not.toContain('sm:w-[500px]');
    expect(source).not.toContain('sm:w-[180px]');
  });

  it('keeps the users toolbar stacked until 2xl and contains horizontal table scrolling', () => {
    const usersSource = readSource('src/app/components/Pages/DASHBOARD/admin/_rsc_pages/users/Users.jsx');
    const tableSource = readSource('src/app/components/Pages/DASHBOARD/admin/_rsc_pages/users/UserDataTable.jsx');

    expect(usersSource).toContain('flex min-w-0 flex-col items-stretch gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between');
    expect(usersSource).toContain('className="w-full 2xl:w-auto"');
    expect(usersSource).not.toContain('gap-4 xl:flex-row xl:items-center xl:justify-between');
    expect(tableSource).toContain('min-w-0 max-w-full');
    expect(tableSource).toContain('overflow-hidden');
  });

  it.each([
    ['add-ons', 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/addons/FilteredAddOn.jsx'],
    ['reviews', 'src/app/components/Pages/DASHBOARD/admin/_rsc_pages/reviews/FilteredReview.jsx'],
  ])('keeps the %s filter and action toolbar stacked until 2xl', (_label, path) => {
    const source = readSource(path);

    expect(source).toContain('flex min-w-0 flex-col items-stretch gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between');
    expect(source).toContain('className="w-full 2xl:w-auto"');
    expect(source).not.toContain('className="flex justify-between items-center gap-4"');
  });
});
