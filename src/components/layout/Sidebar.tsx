"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  PackagePlus,
  PackageMinus,
  Bell,
  LogOut,
  Store,
  Tags,
  BarChart3,
  FileText,
  Receipt,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/transactions", label: "Transactions", icon: FileText },
  { href: "/stock-in", label: "Stock In", icon: PackagePlus },
  { href: "/stock-out", label: "Stock Out", icon: PackageMinus },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/purchase-orders", label: "Purchase Orders", icon: FileText },
  { href: "/forecast", label: "Forecast", icon: BarChart3 },
  { href: "/billing", label: "Billing", icon: Receipt },
  { href: "/invoice-history", label: "Invoice History", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-card md:flex h-screen sticky top-0 font-medium">
      <div className="flex h-20 items-center px-6">
        <Store className="h-6 w-6 text-foreground mr-2" />
        <span className="text-xl font-bold tracking-tight">KiranaStock</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <button
          onClick={() => {
            localStorage.removeItem("loggedIn"); // optional
            window.location.href = "/login";
          }}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
