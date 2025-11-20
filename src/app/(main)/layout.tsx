'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { navItems } from '@/config/nav-items';
import { Logo } from '@/components/icons';
import { cn } from '@/lib/utils';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useUser, useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2, Award } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationsBell } from '@/components/notifications-bell';

function UserMenu() {
  const { user, userProfile, isUserLoading, isProfileLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (!auth) return;
    await auth.signOut();
    router.push('/login');
  };
  
  if (isUserLoading || isProfileLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (!user) {
    return null;
  }
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) {
      if(userProfile?.firstName) return userProfile.firstName[0].toUpperCase();
      if(user?.email) return user.email[0].toUpperCase();
      return 'U';
    };
    return name.split(' ').map(n => n[0]).join('');
  }

  const displayName = userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : (user.displayName || user.email);
  const reputation = userProfile?.reputation ?? 10;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photoURL ?? ''} alt={displayName ?? 'Usuario'} />
            <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            {user.email && <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-2 py-1.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Award className="size-4" />
            <span>Reputación</span>
          </div>
          <span className="font-semibold">{reputation}</span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  
  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-7 text-primary" />
            <span className="font-headline text-xl font-semibold">
              CiudadSegura
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href) && item.href !== '/';
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={{ children: item.label }}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-16 sm:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <NotificationsBell />
          <UserMenu />
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
