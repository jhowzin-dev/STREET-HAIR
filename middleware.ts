import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const AUTH_PATHS = ["/auth", "/auth/callback"]
const ASSET_PATTERNS = ["/_next/", "/favicon.ico", "/logo.jpg", "/api/", "/assets/"]

function isAsset(path: string): boolean {
  return ASSET_PATTERNS.some((pattern) => path.startsWith(pattern))
}

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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPath =
    pathname === "/auth" || AUTH_PATHS.some((p) => pathname.startsWith(p))

  // 1. Redirecionamento básico de sessão ativa/inativa
  if (user && isAuthPath) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (!user && !isAuthPath) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }

  // 2. Trava de segurança para obrigar o preenchimento do WhatsApp (Utilizadores novos e antigos)
  if (user && pathname !== "/onboarding") {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .maybeSingle()

      // Se o telefone não existir ou for uma string vazia, barra e manda para o onboarding
      if (!profile?.phone || profile.phone.trim() === "") {
        return NextResponse.redirect(new URL("/onboarding", request.url))
      }
    } catch (err) {
      console.error("[Middleware] Erro ao verificar telefone:", err)
    }
  }

  // 3. Se o utilizador já tiver o telefone salvo e tentar aceder a /onboarding manualmente, volta para a Home
  if (user && pathname === "/onboarding") {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .maybeSingle()

      if (profile?.phone && profile.phone.trim() !== "") {
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (err) {
      console.error("[Middleware] Erro ao validar rota de onboarding:", err)
    }
  }

  // 4. Proteção de rotas administrativas
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

// ALTERADO: O matcher agora interceta de forma inteligente todas as páginas internas da aplicação,
// garantindo que o onboarding e qualquer nova página criada fiquem protegidos automaticamente.
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|auth|assets).*)"],
}