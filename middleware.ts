import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

const AUTH_PATHS = ["/auth", "/auth/callback"]
const ASSET_PATTERNS = ["/_next/", "/favicon.ico", "/logo.jpg", "/assets/"]

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
          cookiesToSet.forEach(({ name, value, options }) => { if (!options?.sameSite) { options.sameSite = "strict"; }
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

  const isConfirmPath = pathname === "/confirm"
  const PUBLIC_PATHS = ["/auth", "/auth/callback", "/confirm"]

// Redirecionamento básico de sessão ativa/inativa: permite que /confirm seja acessada sem sessão (usuário digita o código)
  if (user && isAuthPath) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (!user && !isAuthPath && !isConfirmPath) {
    return NextResponse.redirect(new URL("/auth", request.url))
  }

// Verificação obrigatória de e‑mail: se o usuário estiver logado mas não confirmou, redireciona para /confirm
  if (user && !isAuthPath && !isConfirmPath) {
    try {
      // Verifica se o e‑mail foi confirmado no Auth ou na tabela profiles
      const isVerified =
        !!user.email_confirmed_at || 
        (await supabase
          .from("profiles")
          .select("email_verified")
          .eq("id", user.id)
          .maybeSingle()
          .then(({ data }) => data?.email_verified))

      if (!isVerified) {
        return NextResponse.redirect(new URL("/confirm", request.url))
      }
    } catch (err) {
      console.error("[Middleware] Erro ao verificar e-mail:", err)
    }
  }

  // Tela de confirmação de e‑mail: se já está verificado, redireciona para a página inicial
  if (user && isConfirmPath) {
    try {
      const isVerified =
        !!user.email_confirmed_at ||
        (await supabase
          .from("profiles")
          .select("email_verified")
          .eq("id", user.id)
          .maybeSingle()
          .then(({ data }) => data?.email_verified))

      if (isVerified) {
        return NextResponse.redirect(new URL("/", request.url))
      }
    } catch (err) {
      console.error("[Middleware] Erro ao verificar e-mail na tela de confirmação:", err)
    }
  }

  // Validação obrigatória de telefone (WhatsApp): garante que o usuário tenha preenchido o campo antes de prosseguir
  if (user && pathname !== "/onboarding" && !isConfirmPath) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .maybeSingle()

      if (!profile?.phone || profile.phone.trim() === "") {
        return NextResponse.redirect(new URL("/onboarding", request.url))
      }
    } catch (err) {
      console.error("[Middleware] Erro ao verificar telefone:", err)
    }
  }

  // Bloqueio de acesso ao onboarding quando o telefone já está cadastrado: redireciona o usuário para a página inicial
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

  // Proteção de rotas administrativas: garante que apenas usuários autenticados e com role 'admin' acessem rotas /admin
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

// Arquitetura de roteamento: o matcher intercepta todas as rotas internas, garantindo proteção automática (verificação de e‑mail, onboarding etc.) para novas páginas
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets).*)"]
}
