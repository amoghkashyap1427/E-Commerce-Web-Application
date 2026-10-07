"use client";

import { ShieldCheck, Package, ShoppingBag, Users, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { name: "Customers", href: "/admin/customers", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Admin Sidebar & Header Simulation */}
      <header className="bg-primary text-primary-foreground py-4 px-6 sticky top-0 z-40 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-secondary" />
          <Link href="/admin">
            <span className="font-serif font-bold text-xl">Choudharyji Admin</span>
          </Link>
        </div>
        <div className="text-sm font-medium">Admin User</div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card min-h-[calc(100vh-64px)] border-r border-border hidden md:block sticky top-[64px]">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" /> {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-x-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
