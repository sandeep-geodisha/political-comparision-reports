"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Overview" },
  { href: "/compare", label: "Compare" },
];

export function NavBar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-dark text-sm font-bold text-white shadow-sm shadow-brand/30">
            P
          </span>
          <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:inline">
            Political Social Analytics
          </span>
          <span className="text-sm font-semibold tracking-tight text-foreground sm:hidden">
            PSA
          </span>
        </Link>
        <nav className="flex items-center gap-1 rounded-full border border-border bg-background/60 p-1">
          {LINKS.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  "rounded-full px-3 py-1.5 text-xs font-semibold transition-all sm:px-4 sm:text-sm " +
                  (active
                    ? "bg-foreground text-white shadow-sm"
                    : "text-muted hover:text-foreground")
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
