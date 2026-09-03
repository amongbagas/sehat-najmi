import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["COUNSELOR", "ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const students = await prisma.studentProfile.findMany({
      include: {
        user: {
          select: { name: true }
        },
        moodEntries: {
          orderBy: { timestamp: 'desc' },
          take: 1
        },
        _count: {
          select: { journalEntries: true, cbtSessions: true }
        }
      },
      orderBy: { class: 'asc' }
    });

    const formattedStudents = students.map(s => ({
      participantId: s.participantId,
      name: s.user.name || "Unknown",
      nis: s.nis,
      className: s.class,
      lastMood: s.moodEntries.length > 0 ? s.moodEntries[0].moodValue : null,
      lastActive: s.moodEntries.length > 0 ? s.moodEntries[0].timestamp : s.createdAt,
      journalCount: s._count.journalEntries,
      cbtCount: s._count.cbtSessions
    }));

    return NextResponse.json(formattedStudents);
  } catch (error) {
    console.error("Fetch students error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
