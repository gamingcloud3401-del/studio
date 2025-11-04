
'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Instagram,
  Home
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  useEffect(() => {
    // This is the single source of truth for admin authentication.
    // It will not run on the server, only on the client.
    const authToken = sessionStorage.getItem('darpan-admin-auth');
    if (authToken === 'true') {
      setAuthStatus('authenticated');
    } else {
      setAuthStatus('unauthenticated');
      // If not authenticated and not already on the login page, redirect.
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    }
  }, [router, pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem('darpan-admin-auth');
    setAuthStatus('unauthenticated');
    router.push('/admin/login');
  };

  const navItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { href: '/admin/products', icon: Package, label: 'Products' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ];
  
  // If we are on the login page, we don't want to render the main layout, just the children.
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }


  if (authStatus === 'loading') {
     return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground">Authenticating...</p>
          </div>
        </div>
      );
  }

  if (authStatus === 'unauthenticated') {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <div className="flex w-full items-center justify-between p-2">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary font-headline group-data-[collapsible=icon]:hidden">
                <Image src="https://i.postimg.cc/bvypQBy5/IMG-20251031-224943-060.webp" alt="Darpan Wears Logo" width={32} height={32} className="rounded-full" />
                <span>Darpan Admin</span>
            </Link>
             <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary font-headline group-data-[collapsible=icon]:flex hidden">
                <Image src="https://i.postimg.cc/bvypQBy5/IMG-20251031-224943-060.webp" alt="Darpan Wears Logo" width={32} height={32} className="rounded-full" />
            </Link>
            <SidebarTrigger className="group-data-[collapsible=icon]:hidden" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout} tooltip="Logout">
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <div className="flex-1 flex flex-col">
         <header className="bg-card border-b sticky top-0 z-30 flex h-16 items-center justify-between px-6 md:justify-end">
             <div className="md:hidden">
                <SidebarTrigger />
             </div>
             <div className="flex items-center gap-4">
                 <Link
                    href="https://www.instagram.com/darpan_wears?igsh=a2pkYXhpajVwNnR3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                    >
                    <Instagram />
                    <span className="sr-only">Instagram</span>
                </Link>
                <Button asChild>
                    <Link href="/">
                        <Home className="mr-2" />
                        View Shop
                    </Link>
                </Button>
            </div>
         </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}
