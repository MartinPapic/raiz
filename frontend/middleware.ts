import { auth0 } from "./lib/auth0";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    const res = await auth0.middleware(request);

    const protectedPaths = ["/lector", "/admin", "/studio"];
    const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

    if (isProtected) {
        return await auth0.getSession(request) ? res : Response.redirect(new URL("/auth/login", request.url));
    }
    return res;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};
