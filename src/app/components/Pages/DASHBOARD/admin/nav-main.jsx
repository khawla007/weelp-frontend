'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from '@/components/ui/sidebar';

const COMING_SOON_LABEL = 'Soon';
const COMING_SOON_BADGE_CLASS = 'rounded-md bg-weelp-sage-deep px-1.5 py-0.5 text-[8px] font-semibold leading-none text-white';
const UNSEEN_BADGE_CLASS =
  'bg-weelp-sage-deep !text-white peer-hover/menu-button:!text-white peer-data-[active=true]/menu-button:!text-white group-data-[collapsible=icon]:!flex group-data-[collapsible=icon]:right-0.5 group-data-[collapsible=icon]:top-0.5 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:min-w-4 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:text-[9px]';
const ORDERS_BADGE_CLUSTER_CLASS =
  'pointer-events-none absolute right-1 top-1.5 flex items-center gap-1 group-data-[collapsible=icon]:left-0 group-data-[collapsible=icon]:right-auto group-data-[collapsible=icon]:top-9 group-data-[collapsible=icon]:w-9 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0.5';
const CLUSTER_COUNT_BADGE_CLASS =
  'flex h-5 min-w-5 items-center justify-center rounded-md bg-weelp-sage-deep px-1 text-xs font-medium tabular-nums !text-white group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:min-w-4 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:text-[9px]';
const ATTENTION_BADGE_CLASS = 'flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold leading-none text-destructive-foreground group-data-[collapsible=icon]:size-4';

function ComingSoonBadge() {
  return <span className={COMING_SOON_BADGE_CLASS}>{COMING_SOON_LABEL}</span>;
}

const ADMIN_DASHBOARD_URL = '/dashboard/admin';

function getActiveUrl(pathname, sections) {
  return (
    sections
      .flatMap((section) => section.items.flatMap((item) => (item.children?.length ? [item, ...item.children] : [item])))
      .map((item) => item.url)
      .filter((url) => url && (pathname === url || (url !== ADMIN_DASHBOARD_URL && pathname.startsWith(`${url}/`))))
      .sort((a, b) => b.length - a.length)[0] ?? null
  );
}

function isParentActive(item, activeUrl) {
  return activeUrl === item.url || item.children?.some((child) => child.url === activeUrl);
}

function getNotificationCount(item, counts) {
  if (!item.notificationKey) return 0;

  const count = Number(counts?.[item.notificationKey]);
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
}

export function NavMain({ items: sections, counts = {}, attention = {} }) {
  const pathname = usePathname();
  const activeUrl = getActiveUrl(pathname, sections);
  const activeParentKey =
    sections.flatMap((section) => section.items.map((item) => ({ key: `${section.section}:${item.title}`, item }))).find(({ item }) => isParentActive(item, activeUrl))?.key ?? null;
  const [openPreference, setOpenPreference] = useState(null);
  const visibleOpenItem = openPreference?.activeParentKey === activeParentKey ? openPreference.itemKey : activeParentKey;
  const toggleOpenItem = (itemKey) => {
    setOpenPreference({ activeParentKey, itemKey: visibleOpenItem === itemKey ? null : itemKey });
  };

  return (
    <>
      {sections.map((section) => (
        <SectionGroup
          key={section.section}
          section={section}
          activeUrl={activeUrl}
          showSeparator={section.section === 'COMING SOON'}
          openItem={visibleOpenItem}
          toggleOpenItem={toggleOpenItem}
          counts={counts}
          attention={attention}
        />
      ))}
    </>
  );
}

function SectionGroup({ section, activeUrl, showSeparator, openItem, toggleOpenItem, counts, attention }) {
  return (
    <>
      {showSeparator && <SidebarSeparator />}
      <SidebarGroup>
        <SidebarGroupLabel>{section.section}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {section.items.map((item) =>
              item.children?.length ? (
                <ParentItem key={item.title} item={item} itemKey={`${section.section}:${item.title}`} activeUrl={activeUrl} openItem={openItem} toggleOpenItem={toggleOpenItem} />
              ) : (
                <LeafItem key={item.title} item={item} activeUrl={activeUrl} counts={counts} attention={attention} />
              ),
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

function LeafItem({ item, activeUrl, counts, attention }) {
  const Icon = item.icon;
  const notificationCount = getNotificationCount(item, counts);
  const cancellationNeedsAttention = item.notificationKey === 'orders' && attention?.cancellations === true;
  const accessibleStatus = [notificationCount > 0 ? `${notificationCount} unseen` : null, cancellationNeedsAttention ? 'cancellation needs attention' : null].filter(Boolean).join(', ');

  if (item.comingSoon) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton tooltip={item.title} isActive={activeUrl === item.url} disabled>
          <Icon />
          <span className="inline-flex min-w-0 items-center gap-2">
            <span className="truncate">{item.title}</span>
            <ComingSoonBadge />
          </span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem className={cancellationNeedsAttention ? 'group-data-[collapsible=icon]:pb-5' : undefined}>
      <SidebarMenuButton asChild isActive={activeUrl === item.url} tooltip={item.title}>
        <Link href={item.url} aria-label={accessibleStatus ? `${item.title}, ${accessibleStatus}` : undefined}>
          <Icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
      {cancellationNeedsAttention ? (
        <span data-testid="orders-badge-cluster" aria-hidden="true" className={ORDERS_BADGE_CLUSTER_CLASS}>
          {notificationCount > 0 ? (
            <span aria-hidden="true" className={CLUSTER_COUNT_BADGE_CLASS}>
              {notificationCount > 99 ? '99+' : notificationCount}
            </span>
          ) : null}
          <span aria-hidden="true" className={ATTENTION_BADGE_CLASS}>
            !
          </span>
        </span>
      ) : notificationCount > 0 ? (
        <SidebarMenuBadge aria-hidden="true" className={UNSEEN_BADGE_CLASS}>
          {notificationCount > 99 ? '99+' : notificationCount}
        </SidebarMenuBadge>
      ) : null}
    </SidebarMenuItem>
  );
}

function ParentItem({ item, itemKey, activeUrl, openItem, toggleOpenItem }) {
  const parentActive = isParentActive(item, activeUrl);
  const open = openItem === itemKey;

  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={() => toggleOpenItem(itemKey)} isActive={parentActive} tooltip={item.title}>
        <Icon />
        <span>{item.title}</span>
        {!item.comingSoon && <ChevronDown className={`ml-auto size-4 transition-transform duration-200 ${open ? '-rotate-180' : ''}`} />}
        {item.comingSoon && <ComingSoonBadge />}
      </SidebarMenuButton>
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-[var(--weelp-ease-out)] motion-reduce:transition-none ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
        inert={!open ? true : undefined}
      >
        <div className="overflow-hidden min-h-0">
          <SidebarMenuSub>
            {item.children.map((child) => (
              <ChildItem key={child.title} child={child} activeUrl={activeUrl} />
            ))}
          </SidebarMenuSub>
        </div>
      </div>
    </SidebarMenuItem>
  );
}

function ChildItem({ child, activeUrl }) {
  const Icon = child.icon;

  if (child.comingSoon) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton aria-disabled="true" tabIndex={-1} isActive={activeUrl === child.url} className="opacity-60 pointer-events-none">
          <Icon className="size-4" />
          <span className="inline-flex min-w-0 items-center gap-2">
            <span className="truncate">{child.title}</span>
            <ComingSoonBadge />
          </span>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  }

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={activeUrl === child.url}>
        <Link href={child.url}>
          <Icon className="size-4" />
          <span>{child.title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
