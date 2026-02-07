'use client';

import { PlayCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get('admin') === 'true' || pathname.startsWith('/admin');

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <PlayCircle className="h-8 w-8" />
          <span className="text-xl font-bold font-headline">Pavallion Sports Arena</span>
        </Link>
        <nav>
          {isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Admin</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
