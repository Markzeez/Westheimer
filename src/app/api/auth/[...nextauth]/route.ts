import NextAuth from "next-auth";
import * as optionsModule from "./options";

const authOptions: Parameters<typeof NextAuth>[0] =
  ("authOptions" in optionsModule && optionsModule.authOptions
    ? optionsModule.authOptions
    : {
        providers: [],
      }) as Parameters<typeof NextAuth>[0];

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);