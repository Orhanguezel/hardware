// =============================================================
// FILE: src/lib/auth.ts
// =============================================================

import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import DiscordProvider from "next-auth/providers/discord";
import CredentialsProvider from "next-auth/providers/credentials";

import { DJANGO_API_URL_SERVER } from "@/lib/api-config";

/* ---------- Django response tipleri ---------- */

interface DjangoUser {
  id: number | string;
  email: string;
  first_name?: string | null;
  username?: string | null;
  role?: string | null;
  [key: string]: unknown;
}

interface DjangoLoginResponse {
  success: boolean;
  token: string;
  user: DjangoUser;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID ?? "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // DJANGO_API_URL_SERVER: Örn: http://localhost:8000/api
          const url = `${DJANGO_API_URL_SERVER}/auth/login/`;
          console.log("🔐 [NextAuth] Login isteği:", url, credentials.email);

          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            const text = await response.text().catch(() => "");
            console.error(
              "❌ [NextAuth] Login failed:",
              response.status,
              text || "<empty body>",
            );
            return null;
          }

          const data = (await response.json()) as DjangoLoginResponse;

          if (!data.success || !data.user || !data.token) {
            console.error("❌ [NextAuth] Invalid Django login response:", data);
            return null;
          }

          console.log("✅ [NextAuth] Login success, Django response:", {
            user: data.user.email,
            role: data.user.role,
          });

          const user: User & { role: string; accessToken: string } = {
            id: data.user.id.toString(),
            email: data.user.email,
            name:
              data.user.first_name ||
              data.user.username ||
              data.user.email,
            role: data.user.role ?? "user",
            accessToken: data.token,
          };

          return user;
        } catch (error) {
          console.error("🔥 [NextAuth] Auth error:", error);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  jwt: {
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      // İlk login
      if (user) {
        const u = user as User & { role?: string; accessToken?: string };
        (token as JWT & { role: string }).role = u.role ?? "user";
        (token as JWT & { accessToken: string }).accessToken =
          u.accessToken ?? "";
      } else {
        // Sonraki çağrılar: token içinden devam
        const t = token as JWT & { role?: string; accessToken?: string };
        (token as JWT & { role: string }).role = t.role ?? "user";
        (token as JWT & { accessToken: string }).accessToken =
          t.accessToken ?? "";
      }

      return token;
    },

    async session({ session, token }) {
      const s = session as Session & {
        user: Session["user"] & { id?: string; role?: string };
        accessToken?: string;
      };

      if (token.sub) {
        s.user.id = token.sub;
      }

      const t = token as JWT & { role?: string; accessToken?: string };

      s.user.role = t.role ?? "user";
      s.accessToken = t.accessToken ?? "";

      return s;
    },

    async redirect({ url, baseUrl }) {
      if (
        url === `${baseUrl}/api/auth/signin` ||
        url === `${baseUrl}/api/auth/signout`
      ) {
        return baseUrl;
      }

      if (url.startsWith(baseUrl)) {
        return url;
      }

      return baseUrl;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
