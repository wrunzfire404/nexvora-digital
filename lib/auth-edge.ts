import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Lightweight auth config untuk middleware (tanpa Prisma/bcrypt)
// Hanya digunakan untuk verifikasi JWT token di edge runtime
export const { auth } = NextAuth({
  providers: [Credentials({})],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});
