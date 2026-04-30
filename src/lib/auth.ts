import NextAuth, { type NextAuthConfig } from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === 'string' ? credentials.email.trim().toLowerCase() : '';
        const password = typeof credentials?.password === 'string' ? credentials.password : '';

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        const hash = (user as unknown as { passwordHash?: string | null })?.passwordHash ?? null;
        if (!hash) return null;

        const ok = await bcrypt.compare(password, hash);
        if (!ok) return null;

        return user;
      },
    }),
  ],
  session: {
    strategy: 'database',
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.plan = user.plan;
        session.user.freeUsageCount = user.freeUsageCount;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      // Initialize new users with the FREE plan and 2 lifetime generations.
      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: 'FREE',
          freeUsageCount: 2,
        },
      });
    },
  },
  pages: {
    signIn: '/login',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

