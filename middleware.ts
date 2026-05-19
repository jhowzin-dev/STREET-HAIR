import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

// Rota única de autenticação permitida sem sessão
const AUTH_PATHS = ["/auth", "/auth/callback"]
const ASSET_PATTERNS = [
  "/_next/",
  "/favicon.ico",
  "/logo.jpg",
  "/api/",
]

function isAsset(path: string): boolean {
  return ASSET_PATTERNS.some((pattern) => path.startsWith(pattern))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Se for asset ou auth callback, bypassa
  if (isAsset(pathname) || pathname === "/auth/callback") {
    return response
  }

  // Cria Supabase SSR para verificar sessão
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response = NextResponse.next({
              request: { headers: request.headers },
            })
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPath = pathname === "/auth" || AUTH_PATHS.some((p) => pathname.startsWith(p))

  // Usuário LOGADO tentando acessar tela de login → redirect para home
  if (user && isAuthPath) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  // Usuário NÃO logado tentando acessar qualquer coisa exceto /auth → redirect para /auth
  if (!user && !isAuthPath) {
    const redirectUrl = new URL("/auth", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Rotas admin: verifica se o usuário logado é admin
  if (pathname.startsWith("/admin")) {
    // Permite acesso à tela de login do admin sem verificação
    if (pathname === "/admin/login") {
      return response
    }

    // Se não estiver logado, manda para auth
    if (!user) {
      return NextResponse.redirect(new URL("/auth", request.url))
    }

    // Busca a role do usuário no banco
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

    // Se não for admin, redireciona para o login do admin
    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  // Anti-cache para páginas protegidas
  if (user && !isAuthPath) {
    response.headers.set("Cache-Control", "no-store, must-revalidate, max-age=0")
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
