import { PlayCircle } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-8 w-8" />
          <span className="text-xl font-bold font-headline">TurfConnect</span>
        </div>
        {/* Future navigation can go here */}
      </div>
    </header>
  );
}
