import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

const AUTH_PATHS = ["/auth", "/auth/login", "/auth/register"]

function isAsset(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    // pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  )
}

// Arquitetura Next.js: o Next.js requer que o arquivo exporte uma função chamada "middleware"
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
          cookiesToSet.forEach(({ name, value, options }) => { if (!options?.sameSite) { options.sameSite = "strict"; }
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isAuthPath = pathname === "/auth" || AUTH_PATHS.some((p) => pathname.startsWith(p))

  // Redirecionamento básico de sessão ativa/inativa: gerencia login e logout, redirecionando usuários conforme o estado da sessão
  if (user && isAuthPath) {
    return NextResponse.redirect(new URL("/", request.url))
  }
  if (!user && !isAuthPath) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  // Validação obrigatória de telefone (WhatsApp): garante que o usuário tenha preenchido o campo de telefone antes de prosseguir
  if (user && pathname !== "/onboarding") {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .maybeSingle()

      // Proteção extra para telefone vazio: trata casos em que o telefone vem como string vazia do banco
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

      // Validação consistente para o telefone ao acessar onboarding: garante comportamento simétrico ao da verificação anterior
      if (profile?.phone && profile.phone.trim() !== "") {
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (err) {
      console.error("[Middleware] Erro ao validar rota de onboarding:", err)
    }
  }

  // Proteção de rotas administrativas: restringe acesso a rotas /admin a usuários com role 'admin'
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|auth).*)"]
}