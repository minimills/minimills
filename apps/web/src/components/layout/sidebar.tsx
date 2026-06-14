'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutGrid, Star, Bell, Search, Settings, ChevronDown, ChevronRight,
  Plus, User, LogOut, Moon, Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { api } from '@/lib/api';
import type { Workspace } from '@minimills/shared';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  const { data: workspaces } = useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: () => api.get('/workspaces'),
  });

  const navItems = [
    { href: '/dashboard', icon: LayoutGrid, label: 'Boards' },
    { href: '/starred', icon: Star, label: 'Starred' },
    { href: '/notifications', icon: Bell, label: 'Notifications' },
    { href: '/search', icon: Search, label: 'Search' },
  ];

  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 border-r bg-background flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="font-bold text-lg">MinIMills</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href}>
            <Button
              variant={pathname === href ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Icon className="mr-2 h-4 w-4" />{label}
            </Button>
          </Link>
        ))}

        <div className="pt-4">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workspaces</span>
            <Link href="/workspaces/new">
              <Button variant="ghost" size="icon" className="h-5 w-5"><Plus className="h-3 w-3" /></Button>
            </Link>
          </div>

          {workspaces?.map((ws) => (
            <WorkspaceSidebarItem key={ws.id} workspace={ws} pathname={pathname} />
          ))}
        </div>
      </nav>

      {/* User */}
      <div className="border-t p-3">
        <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer group">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl ?? undefined} />
            <AvatarFallback>{getInitials(user?.name || 'U')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link href="/settings">
              <Button variant="ghost" size="icon" className="h-7 w-7"><Settings className="h-3 w-3" /></Button>
            </Link>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={logout}>
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}

function WorkspaceSidebarItem({ workspace, pathname }: { workspace: Workspace; pathname: string }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-muted text-left"
      >
        <div className="w-5 h-5 bg-primary/10 text-primary rounded text-xs font-bold flex items-center justify-center shrink-0">
          {workspace.name[0].toUpperCase()}
        </div>
        <span className="flex-1 truncate font-medium">{workspace.name}</span>
        {expanded ? <ChevronDown className="h-3 w-3 shrink-0" /> : <ChevronRight className="h-3 w-3 shrink-0" />}
      </button>
      {expanded && (
        <div className="ml-3 pl-3 border-l space-y-0.5 mt-1">
          <Link href={`/workspaces/${workspace.id}`}>
            <button className={cn(
              'w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-muted truncate',
              pathname === `/workspaces/${workspace.id}` && 'bg-muted font-medium'
            )}>Boards</button>
          </Link>
          <Link href={`/workspaces/${workspace.id}/members`}>
            <button className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-muted truncate">Members</button>
          </Link>
          <Link href={`/workspaces/${workspace.id}/settings`}>
            <button className="w-full text-left text-sm px-2 py-1.5 rounded-md hover:bg-muted truncate">Settings</button>
          </Link>
        </div>
      )}
    </div>
  );
}
