import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { SessionStrategy } from "next-auth";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "" , 
      clientSecret: process.env.GITHUB_SECRET || "" ,
      authorization: {
        params: { scope: "read:user user:email repo read:org admin:repo_hook"},
      },
    }),
  ],
  jwt : {
    maxAge : 1*24*60*60
  },
  session: {
    maxAge: 24 * 60 * 60,
    strategy : "jwt" as SessionStrategy,
  },
  redirect : "/dashboard",
  pages: {
    signIn: "/"
  },
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  callbacks : {
    
    async jwt({ token, account } : {token : any, account : any}) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },  
    async session({session,token} : {token : any, session : any}) {
      // console.log(token)
      console.log(process.env.GITHUB_ID)
      console.log(session)
      if(token.accessToken) {
          session.user.accessToken = token.accessToken;
      }
      return session
    }
  }
}
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };