import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const path = req.nextUrl.pathname

  // Not logged in → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const role = token.role as string

  // Counselor/Admin/Researcher panel
  if (path.startsWith("/counselor") && !["COUNSELOR", "ADMIN", "RESEARCHER"].includes(role)) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Admin panel
  if (path.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Auto-redirect counselors away from student dashboard
  if (path === "/dashboard" && role === "COUNSELOR") {
    return NextResponse.redirect(new URL("/counselor", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/counselor/:path*", "/admin/:path*"],
}
