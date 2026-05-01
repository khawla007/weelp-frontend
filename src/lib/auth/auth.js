import NextAuth, { CredentialsSignin } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { jwtDecode } from 'jwt-decode';

import { refreshTokens } from './refreshTokens';

const ACCESS_REFRESH_LEEWAY_MS = 60 * 1000;

// In-process single-flight: concurrent jwt() invocations sharing the same
// refresh token must POST /api/refresh-token once, not N times. Backend treats
// duplicate refresh as theft (single-use rotation) and revokes all sessions.
const inflightRefreshes = new Map();

function dedupeRefresh(refreshToken) {
  const existing = inflightRefreshes.get(refreshToken);
  if (existing) return existing;
  const promise = refreshTokens(refreshToken).finally(() => {
    inflightRefreshes.delete(refreshToken);
  });
  inflightRefreshes.set(refreshToken, promise);
  return promise;
}

async function rotateToken(token) {
  const result = await dedupeRefresh(token.refreshToken);

  if (result.ok) {
    token.accessToken = result.accessToken;
    token.refreshToken = result.refreshToken;
    token.accessExpiresAt = result.accessExpiresAt;
    token.refreshExpiresAt = result.refreshExpiresAt;
    token.expiresAt = result.refreshExpiresAt;
    delete token.error;
    return token;
  }

  if (result.terminal) {
    return null;
  }

  // Transient failure (e.g., backend unreachable) — keep current token but flag.
  token.error = result.error;
  return token;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,
  providers: [
    CredentialsProvider({
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
          const accessExp = jwtDecode(data.accessToken).exp * 1000;
          const refreshExp = data.refreshToken ? jwtDecode(data.refreshToken).exp * 1000 : null;

          return {
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role,
            is_creator: data.is_creator,
            avatar: data.avatar || null,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken ?? null,
            accessExpiresAt: accessExp,
            refreshExpiresAt: refreshExp,
            expiresAt: accessExp,
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
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
        token.is_creator = user.is_creator;
        token.avatar = user.avatar;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessExpiresAt = user.accessExpiresAt;
        token.refreshExpiresAt = user.refreshExpiresAt;
        token.expiresAt = user.refreshExpiresAt ?? user.accessExpiresAt;
      }

      if (trigger === 'update' && session) {
        if (session.is_creator !== undefined) token.is_creator = session.is_creator;
        if (session.avatar !== undefined) token.avatar = session.avatar;
      }

      const now = Date.now();

      // Refresh window expired — force re-login.
      if (token.refreshExpiresAt && now >= token.refreshExpiresAt) {
        return null;
      }

      const forcedRefresh = trigger === 'update' && session?.refresh === true;
      const accessNearExpiry = token.accessExpiresAt && now >= token.accessExpiresAt - ACCESS_REFRESH_LEEWAY_MS;
      const needsRefresh = token.refreshToken && (forcedRefresh || accessNearExpiry);

      if (needsRefresh) {
        const rotated = await rotateToken(token);
        if (rotated === null) return null;
        return rotated;
      }

      return token;
    },

    async session({ session, token }) {
      if (!session.user) return null;

      session.user.id = token.id;
      session.user.email = token.email;
      session.user.name = token.name;
      session.user.role = token.role;
      session.user.is_creator = token.is_creator;
      session.user.avatar = token.avatar;
      session.access_token = token.accessToken;
      session.error = token.error ?? null;
      // expires must reflect the refresh-token lifetime so SessionProvider does
      // not drop the session each time the access token rotates.
      session.expires = new Date(token.refreshExpiresAt ?? token.expiresAt).toISOString();

      return session;
    },
  },
  session: { strategy: 'jwt' },
  secret: process.env.AUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
});
