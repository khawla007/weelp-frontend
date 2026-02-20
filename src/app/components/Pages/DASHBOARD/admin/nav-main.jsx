'use client';
import { Badge } from '@/components/ui/badge';
import { useSidebar } from '@/components/ui/sidebar';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function NavMain({ items }) {
  const { state, open } = useSidebar();
  const [showchildLink, setShowChildLink] = useState(false);

  const pathname = usePathname();
  const splitPathname = pathname.split('/');

  // handleChild Links
  const handleChildLinks = (index) => {
    setShowChildLink((prevIndex) => (prevIndex === index ? null : index));
  };

  return (
    <ul className="space-y-2 py-4">
      {items.map((item, index) => (
        <li key={index}>
          {item.children && item.children.length > 0 ? (
            state === 'collapsed' ? (
              <Link className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-start gap-4 font-medium text-sm leading-5 text-[#474748]`} href={item.url}>
                <item.icon className="size-4" />
              </Link>
            ) : (
              <div className={`px-4 py-2 cursor-pointer font-medium text-sm leading-5 text-black ${open ? 'mx-4' : ''}`} onClick={() => handleChildLinks(index)}>
                <p className="flex gap-4 items-center">
                  <item.icon />
                  <span className="flex justify-between w-full">
                    {item.title}
                    <ChevronDown className={`ease duration-300 size-5 ${showchildLink === index && '-rotate-180'}`} />
                  </span>
                </p>
                {showchildLink === index && (
                  <ul className="p-2">
                    {item.children.map((child, childIndex) => (
                      <li key={childIndex}>
                        <Link className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-start gap-4 font-medium text-sm leading-5 text-[#474748]" href={child.url}>
                          <child.icon className="size-4" />
                          {child.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )
          ) : (
            // Normal Link for items without children
            <Link className={`px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center justify-start gap-4 font-medium text-sm leading-5 text-[#474748] ${open ? 'mx-4' : ''}`} href={item.url}>
              {state === 'collapsed' ? (
                <item.icon className="size-4" />
              ) : (
                <>
                  <item.icon />
                  <span className="text-black">{item.title}</span>
                  {item.comingSoon && (
                    <Badge variant="success" className="text-[8px] animate-pulse">
                      Coming Soon
                    </Badge>
                  )}
                </>
              )}
            </Link>
          )}
        </li>
      ))}
    </ul>
  );
}
