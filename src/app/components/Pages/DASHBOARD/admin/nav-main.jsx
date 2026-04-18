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
const COMING_SOON_BADGE_CLASS = 'text-[8px] animate-pulse bg-emerald-100 text-emerald-700';

const isLeafActive = (pathname, url) => pathname === url;
const isParentActive = (pathname, item) => item.children?.some((c) => pathname === c.url || pathname.startsWith(c.url + '/'));

export function NavMain({ items: sections }) {
  const pathname = usePathname();

  return (
    <>
      {sections.map((section) => (
        <SectionGroup key={section.section} section={section} pathname={pathname} showSeparator={section.section === 'COMING SOON'} />
      ))}
    </>
  );
}

function SectionGroup({ section, pathname, showSeparator }) {
  return (
    <>
      {showSeparator && <SidebarSeparator />}
      <SidebarGroup>
        <SidebarGroupLabel>{section.section}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {section.items.map((item) =>
              item.children?.length ? (
                <ParentItem key={item.title} item={item} pathname={pathname} />
              ) : (
                <LeafItem key={item.title} item={item} pathname={pathname} />
              ),
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}

function LeafItem({ item, pathname }) {
  const Icon = item.icon;

  if (item.comingSoon) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton tooltip={item.title} disabled>
          <Icon />
          <span>{item.title}</span>
        </SidebarMenuButton>
        <SidebarMenuBadge className={COMING_SOON_BADGE_CLASS}>{COMING_SOON_LABEL}</SidebarMenuBadge>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isLeafActive(pathname, item.url)} tooltip={item.title}>
        <Link href={item.url}>
          <Icon />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

function ParentItem({ item, pathname }) {
  const parentActive = isParentActive(pathname, item);
  const [open, setOpen] = useState(parentActive);
  const [prevActive, setPrevActive] = useState(parentActive);
  if (parentActive !== prevActive) {
    setPrevActive(parentActive);
    if (parentActive) setOpen(true);
  }

  const Icon = item.icon;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton onClick={() => setOpen((o) => !o)} isActive={parentActive} tooltip={item.title}>
        <Icon />
        <span>{item.title}</span>
        {!item.comingSoon && <ChevronDown className={`ml-auto size-4 transition-transform duration-200 ${open ? '-rotate-180' : ''}`} />}
      </SidebarMenuButton>
      {item.comingSoon && <SidebarMenuBadge className={COMING_SOON_BADGE_CLASS}>{COMING_SOON_LABEL}</SidebarMenuBadge>}
      {open && (
        <SidebarMenuSub>
          {item.children.map((child) => (
            <ChildItem key={child.title} child={child} pathname={pathname} />
          ))}
        </SidebarMenuSub>
      )}
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
          <span>{child.title}</span>
        </SidebarMenuSubButton>
        <SidebarMenuBadge className={COMING_SOON_BADGE_CLASS}>{COMING_SOON_LABEL}</SidebarMenuBadge>
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
