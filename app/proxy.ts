import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

const AUTH_PATHS = ["/auth", "/auth/login", "/auth/register"]

function isAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  )
}

// ALTERADO: O Next.js exige o nome "middleware" para funcionar nativamente
export async function middleware(request: NextRequest) {
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

  const { data: { user } } = await supabase.auth.getUser()
  const isAuthPath = pathname === "/auth" || AUTH_PATHS.some((p) => pathname.startsWith(p))

  // Redirecionamento básico de sessão ativa/inativa
  if (user && isAuthPath) {
    return NextResponse.redirect(new URL("/", request.url))
  }
  if (!user && !isAuthPath) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  // Trava de segurança para obrigar o preenchimento do WhatsApp
  if (user && pathname !== "/onboarding") {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .maybeSingle()

      // ALTERADO: Proteção extra se o telefone vier como string vazia ("") do banco
      if (!profile?.phone || profile.phone.trim() === "") {
        return NextResponse.redirect(new URL("/onboarding", request.url))
      }
    } catch (err) {
      console.error("[Middleware] Erro ao verificar telefone:", err)
    }
  }

  // Se já tiver telefone e tentar entrar no onboarding manualmente, joga para a Home
  if (user && pathname === "/onboarding") {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .maybeSingle()

      // ALTERADO: Validação consistente com a de cima
      if (profile?.phone && profile.phone.trim() !== "") {
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (err) {
      console.error("[Middleware] Erro ao validar rota de onboarding:", err)
    }
  }

  // Proteção de rotas administrativas
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return response
    if (!user) return NextResponse.redirect(new URL("/auth", request.url))

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()

      if (profile?.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", request.url))
      }
    } catch (err) {
      console.error("[Middleware] Erro ao validar nível de acesso admin:", err)
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  if (user && !isAuthPath) {
    response.headers.set("Cache-Control", "no-store, must-revalidate, max-age=0")
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|auth).*)"],
}