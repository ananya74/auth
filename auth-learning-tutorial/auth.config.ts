import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { LoginSchema } from "@/schemas";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";


export default {
  providers: [
    GitHub({
        clientId:process.env.GITHUB_CLIENT_ID,
        clientSecret:process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
        clientId:process.env.GOOGLE_CLIENT_ID,
        clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      authorize: async (credentials) => {
        const validatedFields = LoginSchema.safeParse(credentials);
        if (!validatedFields.success) return null;

        // import only when needed (avoids Turbopack crash)
        const { getUserByemail } = await import("@/data/user");
        const bcrypt = await import("bcrypt");

        const { email, password } = validatedFields.data;
        const user = await getUserByemail(email);

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        return passwordMatch ? user : null;
      },
    }),
  ],
} satisfies NextAuthConfig;
