"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CreditCard, History, Settings, Zap } from "lucide-react";

const navItems = [
  { href: "/", label: "推薦", icon: Zap },
  { href: "/cards", label: "我的卡", icon: CreditCard },
  { href: "/history", label: "歷史", icon: History },
  { href: "/settings", label: "設定", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-white/90 backdrop-blur-md safe-area-pb">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                  active
                    ? "text-[var(--primary)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg transition-all duration-200 ${
                    active ? "bg-blue-50" : ""
                  }`}
                >
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.5 : 1.8}
                  />
                </div>
                <span className={`text-xs font-medium ${active ? "font-semibold" : ""}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
