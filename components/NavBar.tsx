import Link from "next/link";

export function NavBar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8">
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
      </div>
    </header>
  );
}
