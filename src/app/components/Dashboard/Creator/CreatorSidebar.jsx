'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, BarChart3, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

const navItems = [
  { href: '/dashboard/creator/overview', label: 'Overview', icon: Home },
  { href: '/dashboard/creator/posts', label: 'My Posts', icon: FileText },
  { href: '/dashboard/creator/analytics', label: 'Analytics', icon: BarChart3 }, // Future
];

export default function CreatorSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-[#435a6742] min-h-screen p-6">
      {/* Logo/Brand */}
      <div className="mb-8">
        <Link href="/explore" className="text-2xl font-bold text-secondaryDark">
          weelp
        </Link>
        <p className="text-sm text-[#5A5A5A] mt-1">Creator Dashboard</p>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-secondaryDark text-white'
                  : 'text-[#435a67] hover:bg-[#CFDBE54D]'
              }`}
            >
              <Icon className="size-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-6 left-6 right-6">
        <button
          onClick={() => signOut({ callbackUrl: '/user/login' })}
          className="flex items-center gap-3 px-4 py-3 text-[#435a67] hover:bg-[#CFDBE54D] rounded-lg transition-colors w-full"
        >
          <LogOut className="size-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
