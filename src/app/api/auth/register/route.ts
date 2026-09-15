import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Data registrasi tidak valid." }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const name = typeof input.name === "string" ? input.name.trim() : "";
    const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
    const password = typeof input.password === "string" ? input.password : "";
    const nis = typeof input.nis === "string" ? input.nis.trim() : "";
    const kelas = typeof input.kelas === "string" ? input.kelas.trim() : "";

    // Validate required fields
    if (!name || !email || !password || !nis || !kelas) {
      return NextResponse.json(
        { error: "Nama, email, password, NIS, dan kelas wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter." },
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

    const existingNis = await prisma.studentProfile.findUnique({
      where: { nis },
    });

    if (existingNis) {
      return NextResponse.json(
        { error: "NIS sudah terdaftar. Silakan hubungi guru BK." },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate participantId for students
    const participantId = `P${randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;

    // Create user with profile in a transaction
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "STUDENT",
        studentProfile: {
          create: {
            nis,
            class: kelas,
            participantId,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: "Registrasi berhasil! Silakan login.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Registration error:", error);

    // Handle Prisma unique constraint errors
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Email atau NIS sudah terdaftar. Silakan gunakan data lain." },
        { status: 409 }
      );
    }

    // Handle Prisma connection errors
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P1001", "P1002"].includes(error.code)) {
      return NextResponse.json(
        { error: "Tidak dapat terhubung ke database. Pastikan database sudah berjalan." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan server. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
