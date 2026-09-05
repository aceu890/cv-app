import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ensureUserWorkspace } from "@/lib/auth/workspace";
import { AUTH_NEXT_COOKIE } from "@/lib/dev-mode";
import { createClient } from "@/lib/supabase/server";

function safePath(value: string | undefined | null) {
  return value?.startsWith("/") ? value : null;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const cookieStore = await cookies();
  const next =
    safePath(searchParams.get("next")) ??
    safePath(cookieStore.get(AUTH_NEXT_COOKIE)?.value) ??
    "/dashboard";

  function finish(url: string) {
    const response = NextResponse.redirect(url);
    response.cookies.delete(AUTH_NEXT_COOKIE);
    return response;
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        try {
          await ensureUserWorkspace(supabase, user);
        } catch (workspaceError) {
          console.error("No se pudo crear el perfil o el CV:", workspaceError);
        }
      }

      return finish(`${origin}${next}`);
    }
  }

  return finish(`${origin}/login?error=auth`);
}
