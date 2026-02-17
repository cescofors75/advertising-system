/**
 * NextAuth.js configuration
 * Single hardcoded user for admin access
 */
import CredentialsProvider from 'next-auth/providers/credentials';

// Credenciales únicas del administrador
const ADMIN_USER = 'publi2026';
const ADMIN_PASS = '20262026';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error('Usuario y contraseña son requeridos');
        }

        if (
          credentials.username === ADMIN_USER &&
          credentials.password === ADMIN_PASS
        ) {
          return {
            id: '1',
            name: 'Publi-Taxi Admin',
          };
        }

        throw new Error('Credenciales inválidas');
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
};
