import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, role, nis, kelas, nip } = body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Nama, email, password, dan role wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter." },
        { status: 400 }
      );
    }

    if (!["STUDENT", "COUNSELOR"].includes(role)) {
      return NextResponse.json(
        { error: "Role tidak valid." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan gunakan email lain." },
        { status: 409 }
      );
    }

    // For students, validate NIS and class
    if (role === "STUDENT") {
      if (!nis || !kelas) {
        return NextResponse.json(
          { error: "NIS dan Kelas wajib diisi untuk siswa." },
          { status: 400 }
        );
      }

      const existingNis = await prisma.studentProfile.findUnique({
        where: { nis },
      });

      if (existingNis) {
        return NextResponse.json(
          { error: "NIS sudah terdaftar. Silakan hubungi guru BK." },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate participantId for students
    const participantId = role === "STUDENT"
      ? `P${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}`
      : undefined;

    // Create user with profile in a transaction
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        ...(role === "STUDENT"
          ? {
              studentProfile: {
                create: {
                  nis,
                  class: kelas,
                  participantId: participantId!,
                },
              },
            }
          : {
              counselorProfile: {
                create: {
                  nip: nip || null,
                },
              },
            }),
      },
    });

    return NextResponse.json(
      {
        message: "Registrasi berhasil! Silakan login.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Data sudah terdaftar. Silakan cek email atau NIS." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
