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
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6">
        <Link href="/dashboard" className="shrink-0 font-serif text-xl tracking-tight">
          Folio
        </Link>
        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto text-sm">
          <NavLink
            href="/dashboard"
            active={
              pathname.startsWith("/dashboard") || pathname.startsWith("/cv")
            }
          >
            CVs
          </NavLink>
          <NavLink href="/docs" active={pathname.startsWith("/docs")}>
            Docs
          </NavLink>
          <NavLink href="/profile" active={pathname.startsWith("/profile")}>
            Perfil
          </NavLink>
          <ThemeToggle />
          <div className="ml-1 flex items-center gap-2 border-l border-line pl-3 sm:gap-3 sm:pl-4">
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
