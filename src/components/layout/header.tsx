'use client';

import { PlayCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/features/auth/auth-provider';
import { LoginButton } from '@/components/features/auth/login-button';
import { UserAvatar } from '@/components/features/auth/user-avatar';

export function Header() {
  const { user, isAdmin } = useAuth();

  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <PlayCircle className="h-8 w-8" />
          <span className="text-xl font-bold font-headline">Pavallion Sports Arena</span>
        </Link>
        <nav className="flex items-center gap-4">
          {user && isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-2 hover:text-accent transition-colors"
            >
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">Admin</span>
            </Link>
          )}
          {user ? <UserAvatar /> : <LoginButton />}
        </nav>
      </div>
    </header>
  );
}
