import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { TOKEN_KEY } from "@/lib/api"

export function middleware(request: NextRequest) {
  const token = request.cookies.get(TOKEN_KEY)?.value
  const { pathname } = request.nextUrl

  if (pathname === "/login") {
    if (token) return NextResponse.redirect(new URL("/", request.url))
    return NextResponse.next()
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
