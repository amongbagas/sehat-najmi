import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch available contacts to message
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Students can only see counselors, counselors can see all students
  if (session.user.role === "STUDENT") {
    const counselors = await prisma.user.findMany({
      where: { role: "COUNSELOR" },
      select: { id: true, name: true, email: true, role: true },
    });
    return NextResponse.json(counselors);
  } else {
    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentProfile: {
          select: { class: true, nis: true },
        },
      },
    });
    return NextResponse.json(students);
  }
}
