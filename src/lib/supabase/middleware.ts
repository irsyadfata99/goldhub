import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  // Refresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected routes and their required roles
  const protectedRoutes = [
    { prefix: "/super-admin", role: "super_admin" },
    { prefix: "/agency", role: "agency_admin" },
    { prefix: "/client", role: "client" },
  ];

  const matchedRoute = protectedRoutes.find((r) => pathname.startsWith(r.prefix));

  if (matchedRoute) {
    // Not logged in → go to login
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check their role from DB
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();

    const role = userData?.role;

    // Wrong role → redirect to their correct dashboard
    if (!role || role !== matchedRoute.role) {
      const redirectMap: Record<string, string> = {
        super_admin: "/super-admin",
        agency_admin: "/agency",
        client: "/client",
      };
      return NextResponse.redirect(new URL(redirectMap[role ?? ""] ?? "/login", request.url));
    }
  }

  // Already logged in and visiting /login → go to dashboard
  if (pathname === "/login" && user) {
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();

    const redirectMap: Record<string, string> = {
      super_admin: "/super-admin",
      agency_admin: "/agency",
      client: "/client",
    };
    const dest = redirectMap[userData?.role ?? ""];
    if (dest) {
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return supabaseResponse;
}
