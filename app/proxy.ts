import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const AUTH_PATHS = ["/auth", "/auth/callback"]
const ASSET_PATTERNS = ["/_next/", "/favicon.ico", "/logo.jpg", "/api/"]

function isAsset(path: string): boolean {
  return ASSET_PATTERNS.some((pattern) => path.startsWith(pattern))
}

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const { pathname } = request.nextUrl

  if (isAsset(pathname) || pathname === "/auth/callback") {
    return response
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPath =
    pathname === "/auth" || AUTH_PATHS.some((p) => pathname.startsWith(p))

  if (user && isAuthPath) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (!user && !isAuthPath) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return response
    }

    if (!user) {
      return NextResponse.redirect(new URL("/auth", request.url))
    }

    let profile
    try {
      const result = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      profile = result.data
    } catch (err) {
      console.error("[Middleware] Erro ao buscar role:", err)
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  if (user && !isAuthPath) {
    response.headers.set(
      "Cache-Control",
      "no-store, must-revalidate, max-age=0"
    )
  }

  return response
}

export const config = {
  matcher: [
    "/",
    "/about",
    "/auth/:path*",
    "/booking",
    "/booking/:path*",
    "/appointments",
    "/appointments/:path*",
    "/profile",
    "/profile/:path*",
    "/admin/:path*",
  ],
}
