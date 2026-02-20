import NextAuth, { CredentialsSignin } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { jwtDecode } from 'jwt-decode';
import { redirect } from 'next/navigation';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  providers: [
    CredentialsProvider({
      // Add credentials configuration
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password', placeholder: '******' },
      },
      async authorize(credentials) {
        try {
          const loginAPI = `${process.env.API_BASE_URL}api/login`;

          const loginRes = await fetch(loginAPI, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          // Get the error response if the request failed
          if (!loginRes.ok) {
            const errorData = await loginRes.json().catch(() => ({}));

            const { error } = errorData;
            throw new CredentialsSignin(error);
          }

          const data = await loginRes.json();

          const decodedToken = jwtDecode(data.accessToken); // decode token

          return {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            accessToken: data.accessToken,
            expiresAt: decodedToken.exp * 1000,
          };
        } catch (error) {
          console.error('Authorization error:', error);

          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Update token with user data
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.expiresAt = user.expiresAt;
      }

      // Check if token is expired
      if (Date.now() > token.expiresAt) {
        return null;
      }
      return token;
    },

    async session({ session, token }) {
      // Ensure session.user exists
      if (!session.user) {
        return null;
      }

      // Update session with token data
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.role = token.role;
      session.access_token = token.accessToken;
      session.expires = new Date(token.expiresAt).toISOString();

      return session;
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
  // debug: true
  // useSecureCookies:true
});
