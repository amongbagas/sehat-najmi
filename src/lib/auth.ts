import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or NIS", type: "text", placeholder: "student@sehat.demo" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        // Search by email first
        let user = await prisma.user.findUnique({
          where: { email: credentials.identifier },
          include: { studentProfile: true, counselorProfile: true }
        });

        // If not found by email, try to find by NIS
        if (!user) {
          const student = await prisma.studentProfile.findUnique({
            where: { nis: credentials.identifier },
            include: { user: true }
          });
          
          if (student) {
            user = await prisma.user.findUnique({
              where: { id: student.userId },
              include: { studentProfile: true, counselorProfile: true }
            });
          }
        }

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          participantId: user.studentProfile?.participantId || null
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.participantId = (user as any).participantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
          participantId: token.participantId as string | null
        };
      }
      return session;
    },
  },
};
