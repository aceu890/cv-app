"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "@/lib/actions/account";
import type { Profile } from "@/lib/supabase/database.types";

type AppHeaderProps = {
  profile: Profile | null;
};

export function AppHeader({ profile }: AppHeaderProps) {
  const pathname = usePathname();
  const name = profile?.full_name || profile?.email || "Cuenta";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between gap-3 sm:h-16">
          <Link
            href="/dashboard"
            className="shrink-0 font-serif text-xl tracking-tight"
          >
            Folio
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {profile?.avatar_url ? (
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
            <span className="hidden max-w-40 truncate text-muted md:block">
              {name}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="min-h-11 text-muted transition-colors hover:text-ink"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
        <nav className="flex items-center gap-1 overflow-x-auto pb-3 text-sm">
          <NavLink
            href="/dashboard"
            active={
              pathname.startsWith("/dashboard") || pathname.startsWith("/cv")
            }
          >
            CVs
          </NavLink>
          <NavLink href="/profile" active={pathname.startsWith("/profile")}>
            Perfil
          </NavLink>
          <NavLink href="/tests" active={pathname.startsWith("/tests")}>
            Test visual
          </NavLink>
          <NavLink href="/docs" active={pathname.startsWith("/docs")}>
            Docs
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-2 transition-colors ${
        active ? "bg-ink text-paper" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
