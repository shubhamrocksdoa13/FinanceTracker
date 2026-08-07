import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Kept separate from src/auth.ts (which pulls in Prisma + bcrypt) so this
// file — the equivalent of middleware.ts in older Next.js versions, renamed
// to proxy.ts here — never hits the database on every navigation.
const { auth } = NextAuth(authConfig);

export { auth as proxy };

export const config = {
  // PWA assets (manifest, generated icons, static icon files, service
  // worker) must be reachable unauthenticated: the browser/OS fetches them
  // to decide installability, and the service worker itself needs to load
  // before there's ever a session.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon|apple-icon|sw.js|icons/|.well-known/).*)",
  ],
};
