"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "@/lib/actions/account";
import type { Profile } from "@/lib/supabase/database.types";

type AppHeaderProps = {
  profile: Pick<Profile, "full_name" | "email" | "avatar_url"> | null;
};

const NAV = [
  { href: "/dashboard", label: "CVs", match: (path: string) => path.startsWith("/dashboard") || path.startsWith("/cv") },
  { href: "/profile", label: "Perfil", match: (path: string) => path.startsWith("/profile") },
  { href: "/tests", label: "Tests", match: (path: string) => path.startsWith("/tests") },
  { href: "/docs", label: "Docs", match: (path: string) => path.startsWith("/docs") },
] as const;

export function AppHeader({ profile }: AppHeaderProps) {
  const pathname = usePathname();
  const name = profile?.full_name || profile?.email || "Cuenta";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <BrandLogo href="/dashboard" size="sm" />
          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                active={item.match(pathname)}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {profile ? (
              <div className="flex items-center gap-2 rounded-full border border-line bg-cream/80 py-1 pr-1 pl-1 sm:pl-2">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt=""
                    className="size-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex size-8 items-center justify-center rounded-full bg-accent text-xs text-on-accent">
                    {name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                <span className="hidden max-w-36 truncate text-sm text-muted lg:block">
                  {name}
                </span>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="rounded-full px-3 py-1.5 text-sm text-muted transition-colors hover:bg-paper hover:text-ink"
                  >
                    Salir
                  </button>
                </form>
              </div>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-ink px-4 py-2 text-sm text-paper transition-colors hover:bg-accent hover:text-on-accent"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 bg-paper/90 px-3 py-2 backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              active={item.match(pathname)}
              compact
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}

function NavLink({
  href,
  active,
  compact,
  children,
}: {
  href: string;
  active: boolean;
  compact?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full text-sm transition-colors ${
        compact ? "px-2 py-2.5 text-center" : "px-3.5 py-2"
      } ${
        active
          ? "bg-ink text-paper shadow-sm"
          : "text-muted hover:bg-cream hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
