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

function ComingSoonBadge() {
  return <span className={COMING_SOON_BADGE_CLASS}>{COMING_SOON_LABEL}</span>;
}

const isLeafActive = (pathname, url) => pathname === url;
const isParentActive = (pathname, item) => item.children?.some((c) => pathname === c.url || pathname.startsWith(c.url + '/'));

function getNotificationCount(item, counts) {
  if (!item.notificationKey) return 0;

  const count = Number(counts?.[item.notificationKey]);
  return Number.isFinite(count) && count > 0 ? Math.floor(count) : 0;
}

export function NavMain({ items: sections, counts = {} }) {
  const pathname = usePathname();
  const activeParentKey =
    sections.flatMap((section) => section.items.map((item) => ({ key: `${section.section}:${item.title}`, item }))).find(({ item }) => isParentActive(pathname, item))?.key ?? null;
  const [openItem, setOpenItem] = useState(null);
  const visibleOpenItem = openItem ?? activeParentKey;

  return (
    <>
      {sections.map((section) => (
        <SectionGroup
          key={section.section}
          section={section}
          pathname={pathname}
          showSeparator={section.section === 'COMING SOON'}
          openItem={visibleOpenItem}
          setOpenItem={setOpenItem}
          counts={counts}
        />
      ))}
    </>
  );
}

function SectionGroup({ section, pathname, showSeparator, openItem, setOpenItem, counts }) {
  return (
    <>
      {showSeparator && <SidebarSeparator />}
      <SidebarGroup>
        <SidebarGroupLabel>{section.section}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {section.items.map((item) =>
              item.children?.length ? (
                <ParentItem key={item.title} item={item} itemKey={`${section.section}:${item.title}`} pathname={pathname} openItem={openItem} setOpenItem={setOpenItem} />
              ) : (
                <LeafItem key={item.title} item={item} pathname={pathname} counts={counts} />
              ),
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

function LeafItem({ item, pathname, counts }) {
  const Icon = item.icon;
  const notificationCount = getNotificationCount(item, counts);

  if (item.comingSoon) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton tooltip={item.title} disabled>
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
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isLeafActive(pathname, item.url)} tooltip={item.title}>
        <Link href={item.url} aria-label={notificationCount > 0 ? `${item.title}, ${notificationCount} unseen` : undefined}>
          <Icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
      {notificationCount > 0 ? (
        <SidebarMenuBadge aria-hidden="true" className={UNSEEN_BADGE_CLASS}>
          {notificationCount > 99 ? '99+' : notificationCount}
        </SidebarMenuBadge>
      ) : null}
    </SidebarMenuItem>
  );
}

function ParentItem({ item, itemKey, pathname, openItem, setOpenItem }) {
  const parentActive = isParentActive(pathname, item);
  const open = openItem === itemKey;

  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={() => setOpenItem((current) => (current === itemKey ? null : itemKey))} isActive={parentActive} tooltip={item.title}>
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
              <ChildItem key={child.title} child={child} pathname={pathname} />
            ))}
          </SidebarMenuSub>
        </div>
      </div>
    </SidebarMenuItem>
  );
}

function ChildItem({ child, pathname }) {
  const Icon = child.icon;

  if (child.comingSoon) {
    return (
      <SidebarMenuSubItem>
        <SidebarMenuSubButton aria-disabled="true" tabIndex={-1} className="opacity-60 pointer-events-none">
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
      <SidebarMenuSubButton asChild isActive={isLeafActive(pathname, child.url)}>
        <Link href={child.url}>
          <Icon className="size-4" />
          <span>{child.title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}
