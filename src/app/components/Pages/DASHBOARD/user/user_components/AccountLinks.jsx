'use client';
import { NavigationMenu, NavigationMenuList, NavigationMenuLink, NavigationMenuItem } from '@radix-ui/react-navigation-menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; //having working on path based url active

export function AccountLinks({ AccountRoutes }) {
  return (
    <NavigationMenu className="w-full">
      <NavigationMenuList className={'flex flex-col space-y-2'}>
        {AccountRoutes?.map((val, index) => (
          <NavigationMenuItem key={index} className={`w-full py-2 hover:bg-gray-100 rounded-md text-black font-medium hover:underline`}>
            <NavigationMenuLink asChild className="w-full px-4  ">
              <Link className=" inline-block" href={val?.url}>
                {val?.title}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
