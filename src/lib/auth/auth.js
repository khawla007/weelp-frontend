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

          if (!loginRes.ok) {
            throw new CredentialsSignin('Invalid credentials');
          }

          const data = await loginRes.json();
          const decodedToken = jwtDecode(data.accessToken);

          return {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            is_creator: data.is_creator,
            avatar: data.avatar || null,
            accessToken: data.accessToken,
            expiresAt: decodedToken.exp * 1000,
          };
        } catch (error) {
          if (error instanceof CredentialsSignin) throw error;
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        // Update token with user data
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.is_creator = user.is_creator;
        token.avatar = user.avatar;
        token.accessToken = user.accessToken;
        token.expiresAt = user.expiresAt;
      }

      // Handle session updates (e.g., after creator upgrade)
      if (trigger === 'update' && session) {
        if (session.is_creator !== undefined) {
          token.is_creator = session.is_creator;
        }
        if (session.avatar !== undefined) {
          token.avatar = session.avatar;
        }
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
      session.user.is_creator = token.is_creator;
      session.user.avatar = token.avatar;
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
  useSecureCookies: process.env.NODE_ENV === 'production',
});
