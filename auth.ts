import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "./db";
import { HTTPException } from "hono/http-exception";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    session: async ({ session, user }) => {
      if (session?.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
  events: {},
});

export async function authenticateUser() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    throw new HTTPException(401, { message: "Unauthorized" });
  }

  const userId = session.user.id;
  return userId;
}
